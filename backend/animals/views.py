# backend/app/views.py

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Count
from django.db.models.functions import TruncMonth

from .models import Animal, AdoptionRequest
from .serializers import (
    AnimalSerializer,
    AdoptionRequestSerializer,
    ProtectoraAnimalSerializer,
)
from .signals import haversine_distance
from .permissions import IsOwnerOrAdmin

User = get_user_model()


class AnimalListCreateView(generics.ListCreateAPIView):
    """
    GET: lista solo los animales sin adoptante (disponibles),
         opcionalmente filtrados por distancia y por nombre (?search=).
    POST: permite crear un nuevo animal; se asigna automáticamente la protectora creadora.
    """
    serializer_class = AnimalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Solo mostrar animales cuya protectora (owner) esté activa
        queryset = Animal.objects.filter(adopter__isnull=True, owner__is_active=True)

        search = self.request.query_params.get("search", "").strip()
        if search:
            queryset = queryset.filter(name__icontains=search)

        user_lat = self.request.query_params.get("user_lat")
        user_lng = self.request.query_params.get("user_lng")
        distance_param = self.request.query_params.get("distance")

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
    Además maneja PATCH { adopter: <id> } y PATCH { adopter: null }.
    Cuando se asigna un adoptante, elimina automáticamente su solicitud previa.
    """
    # Solo los animales cuya protectora (owner) esté activa pueden recuperarse
    queryset = Animal.objects.filter(owner__is_active=True)
    serializer_class = AnimalSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()

        if "adopter" in request.data:
            adopter_id = request.data.get("adopter")
            if adopter_id is None:
                instance.adopter = None
            else:
                adopter = get_object_or_404(User, pk=adopter_id)
                instance.adopter = adopter
            instance.save()

            if adopter_id is not None:
                AdoptionRequest.objects.filter(
                    animal=instance,
                    user__pk=adopter_id
                ).delete()

            serializer = self.get_serializer(instance)
            return Response(serializer.data, status=status.HTTP_200_OK)

        return super().partial_update(request, *args, **kwargs)


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
@permission_classes([IsAuthenticated])
def reject_adoption_request_view(request, animal_id, username):
    """
    DELETE /api/animals/{animal_id}/requests/{username}/delete/
    Permite al solicitante, a la protectora (dueña del animal) o a un admin borrar la solicitud
    de adopción de un usuario concreto.
    """
    animal = get_object_or_404(Animal, pk=animal_id)
    user_obj = get_object_or_404(User, username=username)

    if request.user != user_obj and request.user != animal.owner and not request.user.is_staff:
        return Response(status=status.HTTP_403_FORBIDDEN)

    AdoptionRequest.objects.filter(animal=animal, user=user_obj).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def protectora_metrics(request):
    """
    GET /api/animals/protectora/metrics/
    Métricas clave para la protectora autenticada.
    """
    user = request.user

    # Contar solo animales cuya protectora esté activa
    total_animals = Animal.objects.filter(owner=user, owner__is_active=True).count()
    pending_requests = AdoptionRequest.objects.filter(animal__owner=user).count()
    completed_adoptions = Animal.objects.filter(owner=user, owner__is_active=True, adopter__isnull=False).count()

    return Response({
        "total_animals": total_animals,
        "pending_requests": pending_requests,
        "completed_adoptions": completed_adoptions,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def protectora_animals(request):
    """
    GET /api/animals/protectora/animals/
    Lista de animales de la protectora que están EN ADOPCIÓN
    (owner=request.user y adopter IS NULL), con cuenta de solicitudes pendientes.
    Solo si la protectora está activa.
    """
    user = request.user
    qs = (
        Animal.objects
        .filter(owner=user, owner__is_active=True, adopter__isnull=True)
        .annotate(pending_requests=Count('adoption_requests'))
    )
    serialized = ProtectoraAnimalSerializer(qs, many=True)
    return Response(serialized.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def protectora_adopted_animals(request):
    """
    GET /api/animals/protectora/adopted/
    Lista de animales de la protectora que están ADOPTADOS
    (owner=request.user y adopter IS NOT NULL), con cuenta de solicitudes recibidas.
    Solo si la protectora está activa.
    """
    user = request.user
    qs = (
        Animal.objects
        .filter(owner=user, owner__is_active=True, adopter__isnull=False)
        .annotate(pending_requests=Count("adoption_requests"))
    )
    serialized = ProtectoraAnimalSerializer(qs, many=True)
    return Response(serialized.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def protectora_metrics_view(request):
    """
    GET /api/protectora/metrics/
    Devuelve las métricas principales para el dashboard de la protectora.
    """
    user = request.user
    total = Animal.objects.filter(owner=user, owner__is_active=True).count()
    pending = AdoptionRequest.objects.filter(animal__owner=user).count()
    completed = Animal.objects.filter(owner=user, owner__is_active=True, adopter__isnull=False).count()
    return Response({
        "total_animals": total,
        "pending_requests": pending,
        "completed_adoptions": completed,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def monthly_adoptions_view(request):
    """
    GET /api/protectora/monthly-adoptions/
    Devuelve el número de adopciones completadas por mes (últimos 12 meses).
    Usa updated_at de Animal cuando se marcó como adoptado.
    """
    user = request.user
    qs = (
        Animal.objects
        .filter(owner=user, owner__is_active=True, adopter__isnull=False)
        .annotate(month=TruncMonth("updated_at"))
        .values("month")
        .annotate(count=Count("id"))
        .order_by("month")
    )
    data = [
        {"month": entry["month"].strftime("%b"), "count": entry["count"]}
        for entry in qs
    ]
    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def top_requested_animals_view(request):
    """
    GET /api/protectora/top-requested/
    Devuelve los 5 animales de la protectora con más solicitudes de adopción.
    """
    user = request.user
    qs = (
        Animal.objects
        .filter(owner=user, owner__is_active=True)
        .annotate(req_count=Count("adoption_requests"))
        .order_by("-req_count")[:5]
    )
    data = [{"name": a.name, "count": a.req_count} for a in qs]
    return Response(data)
