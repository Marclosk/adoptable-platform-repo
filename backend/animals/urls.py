from django.urls import path

from . import views

urlpatterns = [
    path("animals/", views.AnimalListCreateView.as_view(), name="animal-list-create"),
    path("animals/<int:pk>/", views.AnimalDetailView.as_view(), name="animal-detail"),
    path("animals/<int:pk>/request/", views.request_adoption, name="request-adoption"),
    path(
        "animals/<int:animal_id>/request/",
        views.adoption_request_view,
        name="adoption-request",
    ),
    path(
        "animals/<int:animal_id>/requests/",
        views.list_animal_requests_view,
        name="animal-requests",
    ),
    path(
        "animals/<int:animal_id>/requests/<str:username>/delete/",
        views.reject_adoption_request_view,
        name="animal-request-reject",
    ),
    path(
        "animals/protectora/metrics/",
        views.protectora_metrics,
        name="protectora-metrics",
    ),
    path(
        "animals/protectora/animals/",
        views.protectora_animals,
        name="protectora-animals",
    ),
    path(
        "animals/protectora/metrics/",
        views.protectora_metrics_view,
        name="protectora-metrics",
    ),
    path(
        "animals/protectora/monthly-adoptions/",
        views.monthly_adoptions_view,
        name="protectora-monthly-adoptions",
    ),
    path(
        "animals/protectora/top-requested/",
        views.top_requested_animals_view,
        name="protectora-top-requested",
    ),
    path(
        "animals/protectora/adopted/",
        views.protectora_adopted_animals,
        name="protectora-animals-adopted",
    ),
]
