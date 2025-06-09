from rest_framework import serializers

from .models import Donacion


class DonacionSerializer(serializers.ModelSerializer):
    usuario = serializers.CharField(source="usuario.username", read_only=True)
    display_usuario = serializers.SerializerMethodField()

    class Meta:
        model = Donacion
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
