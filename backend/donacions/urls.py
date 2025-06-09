from django.urls import path

from . import views

urlpatterns = [
    path("donations/", views.ListaDonacionesView.as_view(), name="lista-donaciones"),
    path("donations/add/", views.CrearDonacionView.as_view(), name="crear-donacion"),
]
