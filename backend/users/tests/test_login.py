import pytest
from django.urls import reverse
from rest_framework import status


@pytest.mark.django_db
def test_login(api_client, user):
    """Prueba para iniciar sesión con credenciales correctas."""
    url = reverse('login') 
    data = {
        'username': 'testuser',
        'password': 'testpassword'
    }
    response = api_client.post(url, data, format='json')

    assert response.status_code == status.HTTP_200_OK
    assert response.data['message'] == 'Login successful!'
