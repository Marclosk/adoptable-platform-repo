import logging
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.mail import EmailMessage
from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from contact.models import ContactMessage

User = get_user_model()


class ContactViewTest(APITestCase):
    def setUp(self):
        logging.getLogger("contact.views").setLevel(logging.CRITICAL)

        self.url = reverse("contact")

        User.objects.create_user(username="juan", email="juan@example.com", password="pwd")
        User.objects.create_user(username="user_x", email="x@x.com", password="pwd")
        User.objects.create_user(username="user_y", email="y@y.com", password="pwd")

    def test_missing_fields(self):
        """POST sin name/email/message → 400 + error claro"""
        resp = self.client.post(self.url, {}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(resp.data.get("error"), "Faltan campos requeridos.")
        self.assertEqual(ContactMessage.objects.count(), 0)

    def test_success_creates_record_and_sends_email(self):
        """POST válido → 200 + registro en BD + EmailMessage.send llamado"""
        data = {
            "name": "Juan Pérez",
            "email": "juan@example.com",
            "message": "¡Hola, esto es un test!",
        }
        with patch.object(EmailMessage, "send", return_value=1) as mock_send:
            resp = self.client.post(self.url, data, format="json")

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data.get("message"), "Mensaje enviado correctamente.")
        self.assertEqual(ContactMessage.objects.count(), 1)
        cm = ContactMessage.objects.first()
        self.assertEqual(cm.name, data["name"])
        self.assertEqual(cm.email, data["email"])
        self.assertEqual(cm.message, data["message"])
        mock_send.assert_called_once()

    def test_database_error_returns_500(self):
        """Si falla al guardar en BD → 500 + mensaje de error"""
        data = {"name": "X", "email": "x@x.com", "message": "M"}
        with patch("contact.views.ContactMessage.objects.create", side_effect=Exception("BD")):
            resp = self.client.post(self.url, data, format="json")

        self.assertEqual(resp.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertEqual(resp.data.get("error"), "Error al guardar el mensaje.")
        self.assertEqual(ContactMessage.objects.count(), 0)

    def test_email_send_error_returns_success(self):
        """Si falla al enviar email → 200 + mensaje de éxito y registro en BD"""
        data = {"name": "Y", "email": "y@y.com", "message": "M2"}
        with patch.object(EmailMessage, "send", side_effect=Exception("SMTP")):
            resp = self.client.post(self.url, data, format="json")

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data.get("message"), "Mensaje enviado correctamente.")
        self.assertEqual(ContactMessage.objects.count(), 1)
