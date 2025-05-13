# src/apps/donations/views.py

from rest_framework import generics, permissions
from .models import Donacion
from .serializers import DonacionSerializer

class ListaDonacionesView(generics.ListAPIView):
    """
    Lista todas las donaciones, ordenadas por fecha descendente.
    Cada objeto incluirá `display_usuario` con “Anonimo” o tu nombre real.
    """
    queryset = Donacion.objects.all().order_by("-fecha")
    serializer_class = DonacionSerializer
    permission_classes = []  # público

class CrearDonacionView(generics.CreateAPIView):
    """
    Permite hacer una donación; espera un campo `anonimo` booleano.
    """
    serializer_class = DonacionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # toma cantidad y anonimo de la request, añade usuario autenticado
        serializer.save(usuario=self.request.user)
