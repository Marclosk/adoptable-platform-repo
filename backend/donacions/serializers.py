from rest_framework import serializers
from .models import Donacion

class DonacionSerializer(serializers.ModelSerializer):
    # Sobrescribimos el campo 'usuario' para que muestre el 'username' en lugar del ID
    usuario = serializers.CharField(source="usuario.username", read_only=True)

    class Meta:
        model = Donacion
        fields = ["id","usuario", "cantidad", "fecha"]
        read_only_fields = ["usuario", "fecha"]
