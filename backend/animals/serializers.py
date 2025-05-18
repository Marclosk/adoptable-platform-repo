from rest_framework import serializers
from .models import Animal, AdoptionRequest
from users.serializers import AdopterListSerializer  # serializer de usuario/adoptante


class AnimalSerializer(serializers.ModelSerializer):
    owner = serializers.PrimaryKeyRelatedField(read_only=True)
    adopter = serializers.PrimaryKeyRelatedField(
        queryset=serializers.CurrentUserDefault(),  # o User.objects.all()
        allow_null=True,
        required=False
    )
    adopter_username = serializers.SerializerMethodField()

    class Meta:
        model = Animal
        fields = "__all__"
        read_only_fields = ["owner", "created_at", "updated_at"]

    def get_adopter_username(self, obj):
        return obj.adopter.username if obj.adopter else None

    def create(self, validated_data):
        validated_data["owner"] = self.context["request"].user
        return super().create(validated_data)


class AdoptionRequestSerializer(serializers.ModelSerializer):
    animal = AnimalSerializer(read_only=True)
    user = AdopterListSerializer(read_only=True)

    class Meta:
        model = AdoptionRequest
        # incluimos form_data en la representación
        fields = ("id", "animal", "user", "created_at", "form_data")
        read_only_fields = ("id", "animal", "user", "created_at")

class ProtectoraAnimalSerializer(serializers.ModelSerializer):
    pending_requests = serializers.IntegerField(read_only=True)

    class Meta:
        model = Animal
        fields = ["id", "name", "pending_requests"]