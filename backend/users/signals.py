# signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import AdopterProfile

@receiver(post_save, sender=User)
def create_adopter_profile(sender, instance, created, **kwargs):
    """
    Crea un AdopterProfile vacío (o con valores por defecto)
    cuando se crea un nuevo usuario.
    """
    if created:
        AdopterProfile.objects.create(user=instance)
