from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.core.mail import EmailMessage
from django.conf import settings
from .models import ContactMessage
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def contact_view(request):
    name = request.data.get('name', '').strip()
    email = request.data.get('email', '').strip()
    message = request.data.get('message', '').strip()

    logger.debug(f"Contacto recibido: name={name}, email={email}, message={message}")

    if not name or not email or not message:
        return Response({"error": "Faltan campos requeridos."}, status=400)

    try:
        ContactMessage.objects.create(name=name, email=email, message=message)
    except Exception as e:
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
    except Exception as e:
        logger.exception("Error al enviar el correo de contacto")
        return Response({"error": "Error al enviar el correo."}, status=500)

    return Response({"message": "Mensaje enviado correctamente."}, status=200)
