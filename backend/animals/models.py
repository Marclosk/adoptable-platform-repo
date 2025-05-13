from django.db import models
from django.utils import timezone
from decimal import Decimal
from django.conf import settings

class Animal(models.Model):
    GENDER_CHOICES = [
        ('male', 'Macho'),
        ('female', 'Hembra'),
    ]

    SIZE_CHOICES = [
        ('small', 'Pequeño'),
        ('medium', 'Mediano'),
        ('large', 'Grande'),
    ]

    ACTIVITY_CHOICES = [
        ('low', 'Baja'),
        ('medium', 'Media'),
        ('high', 'Alta'),
    ]

    name = models.CharField(max_length=100, default='Nombre del animal')
    age = models.CharField(max_length=50, default='0 años')
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='male')
    size = models.CharField(max_length=10, choices=SIZE_CHOICES, default='medium')
    activity = models.CharField(max_length=10, choices=ACTIVITY_CHOICES, default='low')
    city = models.CharField(max_length=100, default='Ciudad desconocida')
    biography = models.TextField(default='Biografía no disponible')

    species = models.CharField(max_length=50, default='Especie desconocida')
    breed = models.CharField(max_length=100, blank=True, null=True, default='Raza desconocida')

    weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, default=Decimal('0.0'))

    characteristics = models.JSONField(blank=True, null=True, default=dict)

    owner = models.ForeignKey(
        "auth.User",
        on_delete=models.CASCADE,
        related_name="animals",
        null=True,          
        blank=True,
        help_text="Usuario/protectora que creó este registro"
    )
    adopter = models.ForeignKey(
        "auth.User",
        on_delete=models.SET_NULL,
        related_name="adopted_animals",
        null=True,
        blank=True,
        help_text="Usuario que ha adoptado este animal"
    )
    since = models.DateField(default=timezone.localdate)

    vaccinated = models.BooleanField(default=False)
    sterilized = models.BooleanField(default=False)
    microchipped = models.BooleanField(default=False)
    dewormed = models.BooleanField(default=False)

    image = models.ImageField(upload_to='animal_images/', default='animal_images/default_image.jpg')
    extra_images = models.JSONField(blank=True, null=True, default=dict)

    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class AdoptionRequest(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="adoption_requests",
        on_delete=models.CASCADE
    )
    animal = models.ForeignKey(
        "animals.Animal",
        related_name="adoption_requests",
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "animal")
        ordering = ("-created_at",)


