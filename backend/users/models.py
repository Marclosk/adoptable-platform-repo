# models.py
from django.db import models
from django.contrib.auth.models import User
from app.storages import PrivateMediaStorage

class AdopterProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")

    avatar = models.ImageField(
        storage=PrivateMediaStorage(),
        upload_to="profile_images/",
        blank=True,
        null=True  # Para que pueda estar vacío
    )
    
    location = models.CharField(max_length=100, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    favorites = models.ManyToManyField("animals.Animal", blank=True, related_name="favorited_by")
    adopted = models.ManyToManyField("animals.Animal", blank=True, related_name="adopted_by")

    def __str__(self):
        return f"Perfil de {self.user.username}"
