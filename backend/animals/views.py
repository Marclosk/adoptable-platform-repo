from rest_framework import generics
from .models import Animal
from .serializers import AnimalSerializer

# Lista de animales y creación de un nuevo animal
class AnimalListCreateView(generics.ListCreateAPIView):
    queryset = Animal.objects.all()
    serializer_class = AnimalSerializer

# Detalle de un animal, actualización y eliminación
class AnimalDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Animal.objects.all()
    serializer_class = AnimalSerializer
