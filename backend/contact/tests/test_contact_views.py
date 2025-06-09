# contact/tests/test_contact_views.py

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
        # Silenciar los logs de contact.views durante los tests
        logging.getLogger("contact.views").setLevel(logging.CRITICAL)
        # si tu urls.py principal hace include('contact.urls') sin prefijo,
        # la ruta es simplemente '/contact/'
        self.url = reverse("contact")
        # Creamos usuarios para que el endpoint no devuelva 404
        User.objects.create_user(username="juan",    email="juan@example.com", password="pwd")
        User.objects.create_user(username="user_x",  email="x@x.com",         password="pwd")
        User.objects.create_user(username="user_y",  email="y@y.com",         password="pwd")

    def test_missing_fields(self):
        """POST sin name/email/message → 400 + error claro"""
        resp = self.client.post(self.url, {}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(resp.data.get("error"), "Faltan campos requeridos.")
        # no debe crearse ningún registro
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
        # verifica que el mensaje quedó en la BD
        self.assertEqual(ContactMessage.objects.count(), 1)
        cm = ContactMessage.objects.first()
        self.assertEqual(cm.name, data["name"])
        self.assertEqual(cm.email, data["email"])
        self.assertEqual(cm.message, data["message"])
        # y que se llamó a send() de Django
        mock_send.assert_called_once()

    def test_database_error_returns_500(self):
        """Si falla al guardar en BD → 500 + mensaje de error"""
        data = {"name": "X", "email": "x@x.com", "message": "M"}
        # parcheamos el create para que lance excepción
        with patch(
            "contact.views.ContactMessage.objects.create", side_effect=Exception("BD")
        ):
            resp = self.client.post(self.url, data, format="json")

        self.assertEqual(resp.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertEqual(resp.data.get("error"), "Error al guardar el mensaje.")
        # no debe quedar nada en BD
        self.assertEqual(ContactMessage.objects.count(), 0)

    def test_email_send_error_returns_success(self):
        """Si falla al enviar email → 200 + mensaje de éxito y registro en BD"""
        data = {"name": "Y", "email": "y@y.com", "message": "M2"}
        # parcheamos EmailMessage.send para que lance excepción
        with patch.object(EmailMessage, "send", side_effect=Exception("SMTP")):
            resp = self.client.post(self.url, data, format="json")

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data.get("message"), "Mensaje enviado correctamente.")
        # el registro en BD sí debe existir
        self.assertEqual(ContactMessage.objects.count(), 1)
