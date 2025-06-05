# contact/views.py

import logging

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import EmailMessage
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import ContactMessage
from .serializers import ContactMessageSerializer

logger = logging.getLogger(__name__)
User = get_user_model()


@api_view(["POST"])
@permission_classes([AllowAny])
def contact_view(request):
    name = request.data.get("name", "").strip()
    email = request.data.get("email", "").strip()
    message = request.data.get("message", "").strip()

    logger.debug(f"Contacto recibido: name={name}, email={email}, message={message}")

    if not name or not email or not message:
        return Response({"error": "Faltan campos requeridos."}, status=400)

    try:
        ContactMessage.objects.create(name=name, email=email, message=message)
    except Exception:
        logger.exception("Error al guardar el mensaje en la base de datos")
        return Response({"error": "Error al guardar el mensaje."}, status=500)

    try:
        email_message = EmailMessage(
            subject="Nuevo mensaje de contacto",
            body=f"De: {name}\nEmail: {email}\n\n{message}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=["marclosquino2@gmail.com"],
            headers={"Reply-To": email},
        )
        email_message.send(fail_silently=False)
    except Exception:
        logger.exception("Error al enviar el correo de contacto")
        return Response({"error": "Error al enviar el correo."}, status=500)

    return Response({"message": "Mensaje enviado correctamente."}, status=200)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_contact_messages(request):
    """
    GET /api/contact/admin/messages/
    Devuelve todos los mensajes de contacto que NO pertenezcan a usuarios bloqueados.
    Solo accesible para superusuarios (is_superuser=True).
    """
    if not request.user.is_superuser:
        return Response({"detail": "No tienes permiso."}, status=403)

    # Excluir mensajes cuyo email corresponda a un User bloqueado (is_active=False)
    blocked_emails = User.objects.filter(is_active=False).values_list(
        "email", flat=True
    )
    qs = ContactMessage.objects.exclude(email__in=blocked_emails).order_by(
        "-created_at"
    )
    serializer = ContactMessageSerializer(qs, many=True)
    return Response(serializer.data, status=200)


@api_view(["GET", "DELETE"])
@permission_classes([IsAuthenticated])
def manage_contact_message(request, message_id):
    """
    GET    /api/contact/admin/messages/{message_id}/   → detalle (solo admin)
    DELETE /api/contact/admin/messages/{message_id}/   → borrar (solo admin)
    Solo si el mensaje no pertenece a un usuario bloqueado.
    """
    if not request.user.is_superuser:
        return Response({"detail": "No tienes permiso."}, status=403)

    msg = get_object_or_404(ContactMessage, pk=message_id)
    # Si el email del mensaje es de usuario bloqueado, actuamos como si no existiera
    if User.objects.filter(email=msg.email, is_active=False).exists():
        return Response({"detail": "Mensaje no encontrado."}, status=404)

    if request.method == "DELETE":
        msg.delete()
        return Response(status=204)

    serializer = ContactMessageSerializer(msg)
    return Response(serializer.data, status=200)
