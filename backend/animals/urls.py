from django.urls import path
from .views import AnimalListCreateView, AnimalDetailView

urlpatterns = [
    path('animals/', AnimalListCreateView.as_view(), name='animal-list-create'),
    path('animals/<int:pk>/', AnimalDetailView.as_view(), name='animal-detail'),
]
