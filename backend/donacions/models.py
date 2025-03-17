from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Donacion(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name="donaciones")
    cantidad = models.DecimalField(max_digits=10, decimal_places=2)
    fecha = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.usuario.username} - {self.cantidad}€ - {self.fecha.strftime('%Y-%m-%d %H:%M:%S')}"
    