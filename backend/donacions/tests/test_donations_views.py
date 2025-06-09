from django.contrib.auth import get_user_model
from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from donacions.models import Donacion

User = get_user_model()


class DonationsViewsTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", email="test@example.com", password="testpass")
        self.lista_url = reverse("lista-donaciones")
        self.crear_url = reverse("crear-donacion")
        self.d1 = Donacion.objects.create(usuario=self.user, cantidad="5.00", anonimo=False)
        self.d2 = Donacion.objects.create(usuario=self.user, cantidad="10.00", anonimo=True)

    def test_list_donations_public(self):
        """GET público a /donations/ debe devolver todas las donaciones ordenadas y con display_usuario."""
        resp = self.client.get(self.lista_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 2)
        primero, segundo = resp.data[0], resp.data[1]
        self.assertEqual(primero["id"], self.d2.id)
        self.assertEqual(segundo["id"], self.d1.id)
        for obj in (primero, segundo):
            for campo in (
                "id",
                "usuario",
                "display_usuario",
                "cantidad",
                "fecha",
                "anonimo",
            ):
                self.assertIn(campo, obj)
        self.assertEqual(primero["display_usuario"], "Anonimo")
        self.assertEqual(segundo["display_usuario"], self.user.username)

    def test_create_donation_unauthenticated(self):
        """Intento de POST sin login → 403"""
        data = {"cantidad": "20.00", "anonimo": False}
        resp = self.client.post(self.crear_url, data, format="json")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_donation_authenticated(self):
        """POST autenticado crea donación con usuario, cantidad y anonimo."""
        assert self.client.login(username="testuser", password="testpass")
        data = {"cantidad": "20.00", "anonimo": True}
        resp = self.client.post(self.crear_url, data, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertIn("id", resp.data)
        self.assertEqual(resp.data["usuario"], self.user.username)
        self.assertEqual(resp.data["display_usuario"], "Anonimo")
        self.assertEqual(resp.data["cantidad"], "20.00")
        self.assertTrue(resp.data["anonimo"])
        self.assertIn("fecha", resp.data)
        don = Donacion.objects.get(id=resp.data["id"])
        self.assertEqual(don.usuario, self.user)
        self.assertEqual(str(don.cantidad), "20.00")
        self.assertTrue(don.anonimo)
