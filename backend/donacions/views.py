from django.contrib.auth import get_user_model

from rest_framework import generics, permissions

from .models import Donacion
from .serializers import DonacionSerializer

User = get_user_model()


class ListaDonacionesView(generics.ListAPIView):
    """
    Lista todas las donaciones, ordenadas por fecha descendente.
    Solo donaiones de usuarios activos.
    """

    serializer_class = DonacionSerializer
    permission_classes = [] 

    def get_queryset(self):
        return Donacion.objects.filter(usuario__is_active=True).order_by("-fecha")


class CrearDonacionView(generics.CreateAPIView):
    """
    Permite hacer una donación; espera un campo `anonimo` booleano.
    """

    serializer_class = DonacionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if not self.request.user.is_active:
            raise permissions.PermissionDenied("Usuario bloqueado.")
        serializer.save(usuario=self.request.user)
