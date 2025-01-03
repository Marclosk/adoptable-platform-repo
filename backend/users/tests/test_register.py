import pytest
from django.urls import reverse
from rest_framework import status


@pytest.mark.django_db
def test_register(api_client):
    """Prueba para el registro de un nuevo usuario."""
    url = reverse('register') 
    data = {
        'username': 'newuser',
        'email': 'newuser@example.com',
        'password': 'newpassword123',
        'first_name': 'First',
        'last_name': 'Last'
    }
    response = api_client.post(url, data, format='json')

    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['message'] == 'User created successfully!'
