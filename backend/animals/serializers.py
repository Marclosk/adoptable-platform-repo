from rest_framework import serializers
from .models import Animal
from django.contrib.auth.models import User

class AnimalSerializer(serializers.ModelSerializer):
    owner = serializers.PrimaryKeyRelatedField(read_only=True)
    adopter = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), allow_null=True, required=False)
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
