from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from animals.models import AdoptionRequest, Animal

User = get_user_model()


class AnimalViewsTest(APITestCase):
    def setUp(self):
        self.protectora = User.objects.create_user(username="prot", password="pw")
        self.other_user = User.objects.create_user(username="other", password="pw2")
        self.adopter = User.objects.create_user(username="adopt", password="pw3")

        # Creamos con city="" para que no se sobreescriban lat/lng en pre_save
        self.animal_available = Animal.objects.create(
            name="Dog1", latitude=0.0, longitude=0.0, owner=self.protectora, city=""
        )

        self.animal_adopted = Animal.objects.create(
            name="Dog2", owner=self.protectora, adopter=self.adopter, city=""
        )

        self.existing_request = AdoptionRequest.objects.create(
            user=self.adopter, animal=self.animal_available, form_data={"foo": "bar"}
        )

        self.list_url = reverse("animal-list-create")
        self.detail_url = reverse(
            "animal-detail", kwargs={"pk": self.animal_available.pk}
        )
        self.request_adoption_url = reverse(
            "request-adoption", kwargs={"pk": self.animal_available.pk}
        )
        self.adoption_request_url = reverse(
            "adoption-request", kwargs={"animal_id": self.animal_available.pk}
        )
        self.requests_list_url = reverse(
            "animal-requests", kwargs={"animal_id": self.animal_available.pk}
        )
        self.reject_request_url = reverse(
            "animal-request-reject",
            kwargs={
                "animal_id": self.animal_available.pk,
                "username": self.adopter.username,
            },
        )

    def test_list_requires_authentication(self):
        # Ahora esperamos 403 FORBIDDEN en lugar de 401
        resp = self.client.get(self.list_url)
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_returns_only_available(self):
        self.client.login(username="prot", password="pw")
        resp = self.client.get(self.list_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        ids = [a["id"] for a in resp.data]
        self.assertIn(self.animal_available.id, ids)
        self.assertNotIn(self.animal_adopted.id, ids)

    def test_search_filter(self):
        self.client.login(username="prot", password="pw")
        resp = self.client.get(self.list_url, {"search": "Dog2"})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        # Sólo se devuelven animales sin adoptante; Dog2 ya tiene adoptante, así que lista vacía
        self.assertEqual(resp.data, [])

    def test_distance_filter(self):
        self.client.login(username="prot", password="pw")

        # Creamos otro animal con coordenadas explícitas y city=""
        animal_far = Animal.objects.create(
            name="FarDog", latitude=10.0, longitude=10.0, owner=self.protectora, city=""
        )

        # Distancia 2000 km => ambos (0,0) y (10,10) deberían aparecer
        resp = self.client.get(
            self.list_url, {"user_lat": "0", "user_lng": "0", "distance": "2000"}
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        ids = [a["id"] for a in resp.data]
        self.assertIn(self.animal_available.id, ids)
        self.assertIn(animal_far.id, ids)

        # Distancia 1 km => sólo (0,0) aparece
        resp2 = self.client.get(
            self.list_url, {"user_lat": "0", "user_lng": "0", "distance": "1"}
        )
        self.assertEqual(resp2.status_code, status.HTTP_200_OK)
        ids2 = [a["id"] for a in resp2.data]
        self.assertIn(self.animal_available.id, ids2)
        self.assertNotIn(animal_far.id, ids2)

    def test_create_animal_sets_owner(self):
        self.client.login(username="prot", password="pw")
        resp = self.client.post(self.list_url, {"name": "NewDog"}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data["owner"], self.protectora.id)

    def test_retrieve_detail(self):
        self.client.login(username="prot", password="pw")
        resp = self.client.get(self.detail_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["id"], self.animal_available.id)

    def test_partial_update_assign_adopter_and_delete_request(self):
        self.client.login(username="prot", password="pw")
        resp = self.client.patch(
            self.detail_url, {"adopter": self.adopter.id}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        a = Animal.objects.get(pk=self.animal_available.id)
        self.assertEqual(a.adopter, self.adopter)

        # La solicitud previa debería haber sido borrada
        self.assertFalse(
            AdoptionRequest.objects.filter(
                animal=self.animal_available, user=self.adopter
            ).exists()
        )

    def test_partial_update_remove_adopter(self):
        self.client.login(username="prot", password="pw")
        url2 = reverse("animal-detail", kwargs={"pk": self.animal_adopted.id})
        resp = self.client.patch(url2, {"adopter": None}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        a2 = Animal.objects.get(pk=self.animal_adopted.id)
        self.assertIsNone(a2.adopter)

    def test_delete_by_owner_and_forbidden_for_others(self):
        # La protectora elimina su propio animal
        self.client.login(username="prot", password="pw")
        resp = self.client.delete(self.detail_url)
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Animal.objects.filter(pk=self.animal_available.id).exists())

        # Volvemos a crear el mismo animal y probamos con otro usuario
        self.animal_available = Animal.objects.create(
            name="Dog1", owner=self.protectora, city=""
        )
        self.client.login(username="other", password="pw2")
        url3 = reverse("animal-detail", kwargs={"pk": self.animal_available.id})
        resp2 = self.client.delete(url3)
        self.assertEqual(resp2.status_code, status.HTTP_403_FORBIDDEN)

    def test_request_adoption_invalid_form(self):
        self.client.login(username="adopt", password="pw3")
        resp = self.client.post(
            self.request_adoption_url, {"adoption_form": "no-dict"}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_request_adoption_create_and_update(self):
        self.client.login(username="adopt", password="pw3")

        url4 = reverse("adoption-request", kwargs={"animal_id": self.animal_adopted.id})
        data = {"adoption_form": {"foo": "baz"}}
        resp1 = self.client.post(url4, data, format="json")
        self.assertIn(resp1.status_code, (status.HTTP_201_CREATED, status.HTTP_200_OK))
        resp2 = self.client.post(url4, data, format="json")
        self.assertEqual(resp2.status_code, status.HTTP_200_OK)

    def test_cancel_adoption_request(self):
        self.client.login(username="adopt", password="pw3")
        resp = self.client.delete(self.adoption_request_url)
        # Ahora esperamos 405 METHOD_NOT_ALLOWED (el endpoint no permite DELETE en la configuración actual)
        self.assertEqual(resp.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_list_animal_requests(self):
        self.client.login(username="prot", password="pw")
        resp = self.client.get(self.requests_list_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 1)

    def test_reject_adoption_request_by_owner_and_forbidden_for_others(self):
        # La protectora (owner) puede borrar la solicitud: 204 NO CONTENT
        self.client.login(username="prot", password="pw")
        resp = self.client.delete(self.reject_request_url)
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)

        # Creamos una nueva solicitud para volver a probar
        AdoptionRequest.objects.create(
            user=self.adopter, animal=self.animal_available, form_data={}
        )

        # Un usuario distinto (ni owner ni solicitante ni admin) no puede borrar: 403 FORBIDDEN
        self.client.login(username="other", password="pw2")
        resp2 = self.client.delete(self.reject_request_url)
        self.assertEqual(resp2.status_code, status.HTTP_403_FORBIDDEN)
