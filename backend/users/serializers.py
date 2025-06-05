import re

from django.contrib.auth import get_user_model
from rest_framework import serializers

from animals.models import Animal

from .models import AdopterProfile

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_staff",
            "is_superuser",
        ]


class AdopterListSerializer(serializers.ModelSerializer):
    """
    Serializador ligero para listar apenas id y username
    de los adoptantes en el dropdown.
    """

    class Meta:
        model = User
        fields = ["id", "username"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(write_only=True, default="adoptante")
    shelter_name = serializers.CharField(
        write_only=True, required=False, allow_blank=True
    )
    localidad = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "first_name",
            "last_name",
            "role",
            "shelter_name",
            "localidad",
        ]

    def validate_username(self, value):
        pattern = r"^[A-Za-z0-9@.+-_]+$"
        if not re.match(pattern, value):
            raise serializers.ValidationError(
                "El nombre de usuario solo puede contener letras, números y @/./+/-/_."
            )
        return value

    def create(self, validated_data):
        role = validated_data.pop("role", "adoptante")
        validated_data.pop("shelter_name", "")
        validated_data.pop("localidad", "")

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )
        if role == "protectora":
            user.is_active = False
            user.is_staff = True
            user.save()

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
    adoption_form = serializers.JSONField()

    class Meta:
        model = AdopterProfile
        fields = [
            "user_id",
            "username",
            "email",
            "avatar",
            "location",
            "phone_number",
            "bio",
            "favorites",
            "adopted",
            "adoption_form",
        ]
