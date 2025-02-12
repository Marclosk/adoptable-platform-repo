from django.contrib import admin
from .models import Animal


@admin.register(Animal)
class AnimalAdmin(admin.ModelAdmin):
    list_display = ('name', 'species', 'breed', 'age', 'gender', 'size', 'city', 'created_at')
    search_fields = ('name', 'city', 'species', 'breed')
    list_filter = ('species', 'gender', 'size', 'city', 'vaccinated', 'sterilized')
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ("Información General", {
            'fields': ('name', 'species', 'breed', 'age', 'gender', 'size', 'activity', 'weight', 'city', 'biography')
        }),
        ("Características", {
            'fields': ('characteristics',)
        }),
        ("Protectora", {
            'fields': ('shelter', 'since')
        }),
        ("Estado de Salud", {
            'fields': ('vaccinated', 'sterilized', 'microchipped', 'dewormed')
        }),
        ("Imágenes", {
            'fields': ('image', 'extra_images')
        }),
        ("Fechas", {
            'fields': ('created_at', 'updated_at')
        }),
    )
