from django.conf import settings
from django.contrib.auth.models import User
from django.db import models

from app.storages import PrivateMediaStorage


class AdopterProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")

    avatar = models.ImageField(
        storage=PrivateMediaStorage(),
        upload_to="profile_images/",
        blank=True,
        null=True,
    )

    location = models.CharField(max_length=100, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    favorites = models.ManyToManyField("animals.Animal", blank=True, related_name="favorited_by")
    adopted = models.ManyToManyField("animals.Animal", blank=True, related_name="adopted_by")
    adoption_form = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"Perfil de {self.user.username}"


class ProtectoraApproval(models.Model):
    """
    Guarda el estado de aprobación de una protectora:
      - approved=False → pendiente de aprobar
      - approved=True  → ya fue aprobada (o fue aprobada y luego quizá bloqueada)
    Solo tiene sentido cuando user.is_staff=True.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="protectora_approval",
    )
    approved = models.BooleanField(default=False)

    def __str__(self):
        return f"Protectora {self.user.username}: {'Aprobada' if self.approved else 'Pendiente'}"
