import math

from django.db.models.signals import pre_save
from django.dispatch import receiver

from geopy.geocoders import Nominatim

from .models import Animal

geolocator = Nominatim(user_agent="my_app")


@receiver(pre_save, sender=Animal)
def geocode_city(sender, instance, **kwargs):
    """
    Antes de guardar un Animal, si su ciudad cambia o no tiene lat/lng,
    intentamos geocodificar la ciudad y guardar las coordenadas.
    """
    if instance.city:

        location = geolocator.geocode(instance.city)
        if location:
            instance.latitude = location.latitude
            instance.longitude = location.longitude
        else:

            instance.latitude = None
            instance.longitude = None


def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Retorna la distancia en kilómetros entre dos puntos
    (lat1, lon1) y (lat2, lon2) usando la fórmula de Haversine.
    """
    R = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    return distance
