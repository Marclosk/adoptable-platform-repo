from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from .models import Animal, AdoptionRequest
from .serializers import AnimalSerializer, AdoptionRequestSerializer
from .signals import haversine_distance
from .permissions import IsOwnerOrAdmin


User = get_user_model()

class AnimalListCreateView(generics.ListCreateAPIView):
    """
    GET: lista solo los animales sin adoptante (disponibles), opcionalmente filtrados por distancia.
    POST: permite crear un nuevo animal; se asigna automáticamente la protectora creadora.
    """
    serializer_class = AnimalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Animal.objects.filter(adopter__isnull=True)
        user_lat = self.request.query_params.get('user_lat')
        user_lng = self.request.query_params.get('user_lng')
        distance_param = self.request.query_params.get('distance')

        if user_lat and user_lng and distance_param:
            try:
                lat_user = float(user_lat)
                lng_user = float(user_lng)
                distance_km = float(distance_param)

                filtered_ids = []
                for animal in queryset:
                    if animal.latitude is not None and animal.longitude is not None:
                        dist = haversine_distance(
                            lat_user, lng_user,
                            animal.latitude, animal.longitude
                        )
                        if dist <= distance_km:
                            filtered_ids.append(animal.id)

                queryset = queryset.filter(id__in=filtered_ids)
            except ValueError:
                pass

        return queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class AnimalDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Recupera, actualiza o borra un animal.
    Solo el owner (protectora) o admin tienen permisos de PUT/DELETE.
    """
    queryset = Animal.objects.all()
    serializer_class = AnimalSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def request_adoption(request, pk):
    """
    POST /api/animals/{pk}/request/
    Crea o actualiza una solicitud de adopción guardando también el JSON del formulario.
    """
    animal = get_object_or_404(Animal, pk=pk)
    form_json = request.data.get("adoption_form")
    if not isinstance(form_json, dict):
        return Response(
            {"error": "Debe enviar 'adoption_form' con un objeto JSON."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # get_or_create con defaults para form_data
    req, created = AdoptionRequest.objects.get_or_create(
        animal=animal,
        user=request.user,
        defaults={"form_data": form_json}
    )
    if not created:
        req.form_data = form_json
        req.save()

    serializer = AdoptionRequestSerializer(req)
    return Response(
        serializer.data,
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
    )


@api_view(["POST", "DELETE"])
@permission_classes([IsAuthenticated])
def adoption_request_view(request, animal_id):
    """
    POST: crea/actualiza una solicitud con JSON del formulario.
    DELETE: cancela la solicitud del user para ese animal.
    """
    animal = get_object_or_404(Animal, pk=animal_id)

    if request.method == "POST":
        form_json = request.data.get("adoption_form")
        if not isinstance(form_json, dict):
            return Response(
                {"error": "Debe enviar 'adoption_form' con un objeto JSON."},
                status=status.HTTP_400_BAD_REQUEST
            )

        req, created = AdoptionRequest.objects.get_or_create(
            animal=animal,
            user=request.user,
            defaults={"form_data": form_json}
        )
        if not created:
            req.form_data = form_json
            req.save()

        serializer = AdoptionRequestSerializer(req)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )

    # DELETE
    AdoptionRequest.objects.filter(animal=animal, user=request.user).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_animal_requests_view(request, animal_id):
    """
    GET /api/animals/{animal_id}/requests/
    Lista todas las solicitudes de adopción de un animal, incluyendo su form_data.
    """
    qs = AdoptionRequest.objects.filter(animal_id=animal_id)
    serializer = AdoptionRequestSerializer(qs, many=True)
    return Response(serializer.data)

@api_view(["DELETE"])
@permission_classes([IsAuthenticated, IsOwnerOrAdmin])
def reject_adoption_request_view(request, animal_id, username):
    """
    DELETE /api/animals/{animal_id}/requests/{username}/delete/
    Permite a la protectora rechazar (borrar) la solicitud
    de adopción de un usuario concreto.
    """
    animal = get_object_or_404(Animal, pk=animal_id)
    user = get_object_or_404(User, username=username)

    AdoptionRequest.objects.filter(animal=animal, user=user).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)