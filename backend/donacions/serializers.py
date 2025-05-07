from rest_framework import serializers
from .models import Donacion

class DonacionSerializer(serializers.ModelSerializer):

    usuario = serializers.CharField(source="usuario.username", read_only=True)

    class Meta:
        model = Donacion
        fields = ["id","usuario", "cantidad", "fecha"]
        read_only_fields = ["usuario", "fecha"]
