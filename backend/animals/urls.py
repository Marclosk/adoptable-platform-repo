from django.urls import path
from . import views

urlpatterns = [
    path('animals/', views.AnimalListCreateView.as_view(), name='animal-list-create'),
    path('animals/<int:pk>/', views.AnimalDetailView.as_view(), name='animal-detail'),
    path('animals/<int:pk>/request/', views.request_adoption, name='request-adoption'),
    path("animals/<int:animal_id>/request/", views.adoption_request_view, name="adoption-request"),
    path('animals/<int:animal_id>/requests/', views.list_animal_requests_view, name='animal-requests'),
    path('animals/<int:animal_id>/requests/<str:username>/delete/', views.reject_adoption_request_view, name='animal-request-reject'),
]
