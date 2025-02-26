# users/serializers.py
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
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
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

