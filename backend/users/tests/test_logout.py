import pytest
from django.urls import reverse
from rest_framework import status


@pytest.mark.django_db
def test_logout(api_client, user):
    """Prueba para cerrar sesión."""

    api_client.login(username='testuser', password='testpassword')

    url = reverse('logout')
    response = api_client.post(url, format='json')

    assert response.status_code == status.HTTP_200_OK
    assert response.data['message'] == 'Logout successful!'

    assert 'sessionid' in response.cookies 
    assert response.cookies['sessionid'].value == '' 

    response = api_client.get(reverse('check_session'))  
    assert response.status_code == status.HTTP_403_FORBIDDEN  
