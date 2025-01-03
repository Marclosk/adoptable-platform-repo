import pytest
from rest_framework.test import APIClient
from django.contrib.auth.models import User


@pytest.fixture
def api_client():
    """Fixture para crear un cliente de la API."""
    return APIClient()


@pytest.fixture
def user():
    """Fixture para crear un usuario de prueba."""
    return User.objects.create_user(
        username="testuser",
        email="test@example.com",
        password="testpassword"
    )
