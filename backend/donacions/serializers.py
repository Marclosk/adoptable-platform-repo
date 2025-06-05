# src/apps/donations/serializers.py

from rest_framework import serializers

from .models import Donacion


class DonacionSerializer(serializers.ModelSerializer):
    # tu nombre real, siempre disponible
    usuario = serializers.CharField(source="usuario.username", read_only=True)
    # este es el campo que usaremos en la lista pública
    display_usuario = serializers.SerializerMethodField()

    class Meta:
        model = Donacion
        # exponemos anonimo para que el POST lo acepte y display_usuario para el GET
        fields = [
            "id",
            "usuario",
            "display_usuario",
            "cantidad",
            "fecha",
            "anonimo",
        ]
        read_only_fields = ["usuario", "fecha", "display_usuario"]

    def get_display_usuario(self, obj):
        return "Anonimo" if obj.anonimo else obj.usuario.username
