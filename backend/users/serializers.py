# users/serializers.py
import re
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from rest_framework import serializers
from .models import AdopterProfile
from animals.models import Animal


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class RegisterSerializer(serializers.ModelSerializer):
    # Campos obligatorios para el registro
    password = serializers.CharField(write_only=True)

    # Campos extra que llegan desde el frontend pero que el modelo User no tiene
    role = serializers.CharField(write_only=True, default="adoptante")
    shelter_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    localidad = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password',
            'first_name',
            'last_name',
            # Campos extra que no pertenecen al modelo, pero queremos recibir
            'role',
            'shelter_name',
            'localidad',
        ]

    def validate_username(self, value):
        """
        Valida que el username cumpla con el regex que Django
        usa por defecto: letras, dígitos y @/./+/-/_.
        """
        pattern = r'^[A-Za-z0-9@.+-_]+$'
        if not re.match(pattern, value):
            raise serializers.ValidationError(
                "El nombre de usuario solo puede contener letras, números y @/./+/-/_."
            )
        return value

    def create(self, validated_data):
        """
        Crea el usuario. Si el rol es 'protectora', marcamos user.is_active = False
        y/o enviamos correo, etc. 
        'shelter_name' y 'localidad' se extraen, pero el modelo User no los guarda.
        """
        role = validated_data.pop("role", "adoptante")
        shelter_name = validated_data.pop("shelter_name", "")
        localidad = validated_data.pop("localidad", "")

        # Crea el usuario estándar de Django
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ""),
            last_name=validated_data.get('last_name', ""),
        )

        # Si es protectora, podrías:
        # - user.is_active = False
        # - user.save()
        # - Guardar shelter_name/localidad en un modelo ProtectoraProfile
        # - Enviar un correo de confirmación, etc.
        if role == "protectora":
            # Ejemplo: user.is_active = False
            user.is_active = False
            user.save()
            # Lógica adicional: guardar shelter_name/localidad en otro modelo, etc.
            # p.ej. ProtectoraProfile.objects.create(user=user, name=shelter_name, location=localidad)
            pass

        return user

class AnimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Animal
        fields = ["id", "name", "image"]

class AdopterProfileSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    favorites = AnimalSerializer(many=True, read_only=True)
    adopted = AnimalSerializer(many=True, read_only=True)

    class Meta:
        model = AdopterProfile
        fields = ["user_id", "username", "email", "avatar", "location", "phone_number", "bio", "favorites", "adopted"]

