from rest_framework import generics, permissions
from .models import Donacion
from .serializers import DonacionSerializer

class ListaDonacionesView(generics.ListAPIView):
    queryset = Donacion.objects.all().order_by("-fecha")
    serializer_class = DonacionSerializer
    permission_classes = [] 

class CrearDonacionView(generics.CreateAPIView):
    serializer_class = DonacionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)
