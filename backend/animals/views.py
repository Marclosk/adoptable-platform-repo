# backend/animals/views.py

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Animal, AdoptionRequest
from .serializers import AnimalSerializer, AdoptionRequestSerializer
from .signals import haversine_distance
from .permissions import IsOwnerOrAdmin


class AnimalListCreateView(generics.ListCreateAPIView):
    """
    GET: lista solo los animales sin adoptante (disponibles), opcionalmente filtrados por distancia.
    POST: permite crear un nuevo animal; se asigna automáticamente la protectora creadora.
    """
    serializer_class = AnimalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # 1️⃣ Solo animales sin adoptante
        queryset = Animal.objects.filter(adopter__isnull=True)

        # 2️⃣ Filtro por geolocalización si vienen params
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
                # Ignorar si no son números válidos
                pass

        return queryset

    def perform_create(self, serializer):
        # Asigna automáticamente la protectora que crea el animal
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
    Crea (o recupera) una solicitud de adopción para el animal indicado
    por el usuario autenticado.
    """
    animal = get_object_or_404(Animal, pk=pk)
    req, created = AdoptionRequest.objects.get_or_create(
        animal=animal,
        user=request.user
    )
    return Response(
        {"requested": True},
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
    )


@api_view(["POST", "DELETE"])
@permission_classes([IsAuthenticated])
def adoption_request_view(request, animal_id):
    user = request.user
    animal = get_object_or_404(Animal, pk=animal_id)
    if request.method == "POST":
        AdoptionRequest.objects.get_or_create(user=user, animal=animal)
        return Response(status=status.HTTP_201_CREATED)
    # DELETE:
    AdoptionRequest.objects.filter(user=user, animal=animal).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

# animals/views.py


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_adoption_requests_for_animal(request, animal_id):
    qs = AdoptionRequest.objects.filter(animal_id=animal_id)
    serializer = AdoptionRequestSerializer(qs, many=True)
    return Response(serializer.data)
