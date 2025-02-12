from django.db import models
from django.utils import timezone
from decimal import Decimal

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
    age = models.CharField(max_length=50, default='0 años')  # Si necesitas cálculos, mejor usar IntegerField
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='male')
    size = models.CharField(max_length=10, choices=SIZE_CHOICES, default='medium')
    activity = models.CharField(max_length=10, choices=ACTIVITY_CHOICES, default='low')
    city = models.CharField(max_length=100, default='Ciudad desconocida')
    biography = models.TextField(default='Biografía no disponible')

    # Información de especie y raza
    species = models.CharField(max_length=50, default='Especie desconocida')
    breed = models.CharField(max_length=100, blank=True, null=True, default='Raza desconocida')

    # Peso del animal
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, default=Decimal('0.0'))

    # Características del animal (Lista de etiquetas)
    characteristics = models.JSONField(default=dict)  # Usa dict en lugar de list para evitar problemas

    # Información sobre la protectora
    shelter = models.CharField(max_length=150, default='Protectora desconocida')
    since = models.DateField(default=timezone.now)  # Usa timezone.now en lugar de date.today

    # Estado de salud
    vaccinated = models.BooleanField(default=False)
    sterilized = models.BooleanField(default=False)
    microchipped = models.BooleanField(default=False)
    dewormed = models.BooleanField(default=False)

    # Imagen principal + imágenes adicionales
    image = models.ImageField(upload_to='animal_images/', default='animal_images/default_image.jpg')
    extra_images = models.JSONField(default=dict)  # Usa dict en lugar de list

    # Fechas de creación y actualización
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
