from django.urls import path

from .views import CrearDonacionView, ListaDonacionesView

urlpatterns = [
    path("donations/", ListaDonacionesView.as_view(), name="lista-donaciones"),
    path("donations/add/", CrearDonacionView.as_view(), name="crear-donacion"),
]
