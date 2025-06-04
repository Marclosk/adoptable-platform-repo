# contact/serializers.py

from rest_framework import serializers
from .models import ContactMessage

class ContactMessageSerializer(serializers.ModelSerializer):
    """
    Serializador para ContactMessage. Usamos campos explícitos
    para asegurarnos de exponer id, nombre, email, mensaje y created_at,
    sin alterar el endpoint público de 'contact_view'.
    """
    class Meta:
        model = ContactMessage
        fields = [
            "id",
            "name",
            "email",
            "message",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
