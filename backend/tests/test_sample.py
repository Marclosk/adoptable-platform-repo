import pytest
from django.urls import reverse

@pytest.mark.django_db
def test_home_page():
    url = reverse('home')
    response = pytest.client.get(url)
    assert response.status_code == 200
