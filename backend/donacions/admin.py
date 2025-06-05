from django.contrib import admin

from .models import Donacion


@admin.register(Donacion)
class DonacionAdmin(admin.ModelAdmin):
    list_display = ("usuario", "cantidad", "fecha")
    ordering = ("-fecha",)
