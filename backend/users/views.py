import logging

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model, login, logout
from django.contrib.auth.tokens import PasswordResetTokenGenerator, default_token_generator
from django.core.mail import send_mail
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode

from rest_framework import generics, status
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from animals.models import AdoptionRequest, Animal
from animals.serializers import AdoptionRequestSerializer, AnimalSerializer

from .models import AdopterProfile, ProtectoraApproval
from .serializers import AdopterListSerializer, AdopterProfileSerializer, RegisterSerializer, UserSerializer

User = get_user_model()

logger = logging.getLogger(__name__)


@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request):
    role = request.data.get("role", "adoptante")
    localidad = request.data.get("localidad", "")

    email = request.data.get("email", "").strip()
    if User.objects.filter(email=email).exists():
        return Response(
            {"email": ["Ya existe un usuario registrado con este correo."]},
            status=status.HTTP_400_BAD_REQUEST,
        )

    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        logger.debug("Errores de validación: %s", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = serializer.save()

    if role == "protectora":
        user.is_staff = True
        user.is_active = False
        user.save()

        ProtectoraApproval.objects.create(user=user, approved=False)

        send_mail(
            subject="Solicitud de registro de protectora",
            message=(
                f"La protectora {user.username} (email: {user.email}) " f"solicita registrarse. Localidad: {localidad}"
            ),
            from_email="no-reply@miapp.com",
            recipient_list=["marclosquino2@gmail.com"],
        )

        return Response(
            {"message": "Solicitud de protectora enviada. Espera aprobación."},
            status=status.HTTP_201_CREATED,
        )

    user.is_staff = False
    user.is_active = True
    user.save()
    return Response({"message": "Usuario creado correctamente!"}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")

    try:
        user_obj = User.objects.get(username=username)
    except User.DoesNotExist:
        user_obj = None

    if user_obj and not user_obj.is_active:
        return Response(
            {"error": "Tu cuenta está pendiente de aprobación."},
            status=status.HTTP_403_FORBIDDEN,
        )

    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response({"error": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)

    login(request, user)
    user_data = UserSerializer(user).data
    role = "protectora" if user.is_staff else "adoptante"

    return Response(
        {"message": "Login successful!", "user": user_data, "role": role},
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def logout_view(request):
    logout(request)
    response = Response({"message": "Logout successful!"}, status=status.HTTP_200_OK)
    response.delete_cookie("sessionid", path="/")
    response.delete_cookie("csrftoken", path="/")
    return response


@api_view(["GET"])
@permission_classes([AllowAny])
def check_session(request):
    if request.user.is_authenticated:
        return Response({"message": "Session is valid!"}, status=status.HTTP_200_OK)
    return Response(
        {"message": "Session is invalid, please log in."},
        status=status.HTTP_401_UNAUTHORIZED,
    )


@api_view(["POST", "DELETE"])
@permission_classes([IsAuthenticated])
def favorite_animal(request, animal_id):
    profile = request.user.profile
    animal = get_object_or_404(Animal, pk=animal_id)
    if request.method == "POST":
        profile.favorites.add(animal)
    else:
        profile.favorites.remove(animal)
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET", "POST", "DELETE"])
@permission_classes([IsAuthenticated])
def adoption_request_view(request, animal_id):
    """
    GET:   Lista todas las solicitudes de adopción de este animal.
    POST:  Crea una nueva solicitud para el usuario autenticado.
    DELETE:Cancela la solicitud del usuario autenticado para este animal.
    """
    user = request.user
    animal = get_object_or_404(Animal, pk=animal_id)

    if request.method == "GET":
        qs = AdoptionRequest.objects.filter(animal=animal)
        serializer = AdoptionRequestSerializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    if request.method == "POST":
        AdoptionRequest.objects.get_or_create(user=user, animal=animal)
        return Response(status=status.HTTP_201_CREATED)

    AdoptionRequest.objects.filter(user=user, animal=animal).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_profile(request):
    user = request.user
    user_data = UserSerializer(user).data
    role = "protectora" if user.is_staff else "adoptante"
    user_data["role"] = role

    if not user.is_staff:
        try:
            profile = user.profile
        except AdopterProfile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

        profile_data = AdopterProfileSerializer(profile).data
        fav_qs = profile.favorites.all()
        profile_data["favorites"] = AnimalSerializer(fav_qs, many=True).data
        adopted_qs = Animal.objects.filter(adopter=user)
        profile_data["adopted"] = AnimalSerializer(adopted_qs, many=True).data
        req_qs = AdoptionRequest.objects.filter(user=user)
        profile_data["requests"] = AdoptionRequestSerializer(req_qs, many=True).data

        return Response({**user_data, **profile_data}, status=status.HTTP_200_OK)

    try:
        profile = user.profile
        profile_data = AdopterProfileSerializer(profile).data
    except AdopterProfile.DoesNotExist:
        profile_data = {}

    en_adopcion_qs = Animal.objects.filter(owner=user, adopter__isnull=True)
    adopted_owner_qs = Animal.objects.filter(owner=user, adopter__isnull=False)
    return Response(
        {
            **user_data,
            **profile_data,
            "en_adopcion": AnimalSerializer(en_adopcion_qs, many=True).data,
            "adopted": AnimalSerializer(adopted_owner_qs, many=True).data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def update_profile(request):
    """
    Actualiza avatar, location, phone_number y bio para cualquier usuario
    (adoptante o protectora). Luego reconstruye y devuelve el payload completo,
    igual que get_profile.
    """
    user = request.user
    try:
        profile = user.profile
    except AdopterProfile.DoesNotExist:
        return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = AdopterProfileSerializer(profile, data=request.data, partial=True)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    serializer.save()

    user_data = UserSerializer(user).data
    role = "protectora" if user.is_staff else "adoptante"
    user_data["role"] = role

    profile_data = serializer.data

    if role == "adoptante":
        fav_qs = profile.favorites.all()
        profile_data["favorites"] = AnimalSerializer(fav_qs, many=True).data
        adopted_qs = Animal.objects.filter(adopter=user)
        profile_data["adopted"] = AnimalSerializer(adopted_qs, many=True).data
        req_qs = AdoptionRequest.objects.filter(user=user)
        profile_data["requests"] = AdoptionRequestSerializer(req_qs, many=True).data

        return Response({**user_data, **profile_data}, status=status.HTTP_200_OK)

    en_adopcion_qs = Animal.objects.filter(owner=user, adopter__isnull=True)
    adopted_owner_qs = Animal.objects.filter(owner=user, adopter__isnull=False)
    return Response(
        {
            **user_data,
            **profile_data,
            "en_adopcion": AnimalSerializer(en_adopcion_qs, many=True).data,
            "adopted": AnimalSerializer(adopted_owner_qs, many=True).data,
        },
        status=status.HTTP_200_OK,
    )


class AdopterListView(generics.ListAPIView):
    queryset = User.objects.filter(is_staff=False, is_active=True)
    serializer_class = AdopterListSerializer
    permission_classes = [AllowAny]


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def cancel_adoption_request_view(request, req_id):
    deleted, _ = AdoptionRequest.objects.filter(pk=req_id, user=request.user).delete()
    if deleted:
        return Response(status=status.HTTP_204_NO_CONTENT)
    return Response({"detail": "No encontrado o sin permisos"}, status=status.HTTP_404_NOT_FOUND)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def adoption_form_view(request):
    profile = request.user.profile
    if request.method == "GET":
        return Response({"adoption_form": profile.adoption_form})
    form_data = request.data.get("adoption_form", {})
    profile.adoption_form = form_data
    profile.save()
    return Response({"adoption_form": profile.adoption_form})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_profile_view(request, user_id):
    """
    GET /api/users/{user_id}/profile/
    Devuelve el perfil completo de un usuario (adoptante o protectora),
    incluyendo favoritos, adoptados, solicitudes, etc. Solo lectura.
    Si el usuario está bloqueado (is_active=False), devolvemos 404.
    """
    user = get_object_or_404(User, pk=user_id)
    if not user.is_active:
        return Response({"detail": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)

    user_data = UserSerializer(user).data
    role = "protectora" if user.is_staff else "adoptante"
    user_data["role"] = role

    if not user.is_staff:
        try:
            profile = user.profile
        except AdopterProfile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
        profile_data = AdopterProfileSerializer(profile).data
        fav_qs = profile.favorites.all()
        profile_data["favorites"] = AnimalSerializer(fav_qs, many=True).data
        adopted_qs = Animal.objects.filter(adopter=user)
        profile_data["adopted"] = AnimalSerializer(adopted_qs, many=True).data
        req_qs = AdoptionRequest.objects.filter(user=user)
        profile_data["requests"] = AdoptionRequestSerializer(req_qs, many=True).data
        return Response({**user_data, **profile_data}, status=status.HTTP_200_OK)

    try:
        profile = user.profile
        profile_data = AdopterProfileSerializer(profile).data
    except AdopterProfile.DoesNotExist:
        profile_data = {}

    en_adopcion_qs = Animal.objects.filter(owner=user, adopter__isnull=True)
    adopted_owner_qs = Animal.objects.filter(owner=user, adopter__isnull=False)
    return Response(
        {
            **user_data,
            **profile_data,
            "en_adopcion": AnimalSerializer(en_adopcion_qs, many=True).data,
            "adopted": AnimalSerializer(adopted_owner_qs, many=True).data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_search(request):
    """
    GET /api/users/?search=<q>
    Devuelve lista de usuarios activos cuyo username, first_name o last_name
    contienen la cadena 'q' (case-insensitive).
    """
    q = request.query_params.get("search", "").strip()
    if not q:
        return Response([], status=status.HTTP_200_OK)

    qs = User.objects.filter(
        Q(username__icontains=q) | Q(first_name__icontains=q) | Q(last_name__icontains=q),
        is_active=True,
    )
    serializer = AdopterListSerializer(qs, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_pending_protectoras(request):
    """
    GET /api/admin/pending-protectoras/
    Devuelve una lista de usuarios con is_staff=True e is_active=False (protectora pendientes de validación).
    Solo accesible por administrador (is_superuser=True).
    """
    if not request.user.is_superuser:
        return Response({"detail": "No tienes permiso."}, status=status.HTTP_403_FORBIDDEN)

    pending_qs = User.objects.filter(is_staff=True, is_active=False, protectora_approval__approved=False)
    serializer = UserSerializer(pending_qs, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def validate_protectora(request, user_id):
    """
    POST /api/admin/validate-protectora/{user_id}/
    Marca a la protectora con is_active=True si existe y estaba pendiente.
    Solo accesible por administrador (is_superuser=True).
    """
    if not request.user.is_superuser:
        return Response({"detail": "No tienes permiso."}, status=status.HTTP_403_FORBIDDEN)
    protectora = get_object_or_404(User, pk=user_id, is_staff=True, is_active=False)
    protectora.is_active = True
    protectora.save()
    pa = getattr(protectora, "protectora_approval", None)
    if pa:
        pa.approved = True
        pa.save()
    return Response({"message": "Protectora validada correctamente."}, status=status.HTTP_200_OK)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def block_user(request, user_id):
    """
    PUT /api/users/admin/block/{user_id}/
    Bloquea a un usuario (adoptante o protectora).
    - Si es adoptante → is_active=False
    - Si es protectora previamente aprobada → is_active=False (dejando approved=True)
    """
    if not request.user.is_superuser:
        return Response({"detail": "No tienes permiso."}, status=status.HTTP_403_FORBIDDEN)

    if request.user.id == user_id:
        return Response(
            {"detail": "No puedes bloquearte a ti mismo."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    target = get_object_or_404(User, pk=user_id)
    if not target.is_active:
        return Response({"detail": "Usuario ya bloqueado."}, status=status.HTTP_400_BAD_REQUEST)

    target.is_active = False
    target.save()

    if target.is_staff:
        pa = getattr(target, "protectora_approval", None)
        if pa:
            pa.approved = True
            pa.save()

    return Response({"message": "Usuario bloqueado correctamente."}, status=status.HTTP_200_OK)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def unblock_user(request, user_id):
    """
    PUT /api/users/admin/unblock/{user_id}/
    El admin podrá reactivar (= desbloquear) al usuario marcado.
    Se pone is_active=True.
    """
    if not request.user.is_superuser:
        return Response({"detail": "No tienes permiso."}, status=status.HTTP_403_FORBIDDEN)

    target = get_object_or_404(User, pk=user_id)
    if target.is_active:
        return Response({"detail": "Usuario ya activo."}, status=status.HTTP_400_BAD_REQUEST)

    target.is_active = True
    target.save()
    return Response({"message": "Usuario reactivado correctamente."}, status=status.HTTP_200_OK)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_user(request, user_id):
    """
    DELETE /api/users/admin/delete/{user_id}/
    Borra al usuario de la base de datos (irrevocable). Solo superuser.
    """
    if not request.user.is_superuser:
        return Response({"detail": "No tienes permiso."}, status=status.HTTP_403_FORBIDDEN)

    if request.user.id == user_id:
        return Response(
            {"detail": "No puedes eliminarte a ti mismo."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    target = get_object_or_404(User, pk=user_id)
    target.delete()
    return Response(
        {"message": "Usuario eliminado correctamente."},
        status=status.HTTP_204_NO_CONTENT,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_blocked_users(request):
    """
    GET /api/users/admin/blocked-users/
    Devuelve todos los usuarios bloqueados:
      - Adoptantes bloqueados → is_staff=False, is_active=False
      - Protectoras bloqueadas → is_staff=True, is_active=False, approved=True
    Solo accesible por superusuario.
    """
    if not request.user.is_superuser:
        return Response({"detail": "No tienes permiso."}, status=403)

    adoptantes_qs = User.objects.filter(is_staff=False, is_active=False)
    protectoras_qs = User.objects.filter(is_staff=True, is_active=False, protectora_approval__approved=True)
    blocked_qs = adoptantes_qs.union(protectoras_qs)
    serializer = UserSerializer(blocked_qs, many=True)
    return Response(serializer.data, status=200)


@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset_request(request):
    """
    Solicita envío de correo para recuperación de contraseña.
    Siempre responde 200 aunque el email no exista, para no filtrar usuarios.
    """
    email = request.data.get("email", "").strip().lower()
    if not email:
        return Response({"error": "Debe proporcionar un email."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        user = None
        return Response({"error": "error_usuario_no_encontrado"}, status=status.HTTP_418_IM_A_TEAPOT)
    if user and user.is_active:
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        frontend_reset_url = getattr(settings, "FRONTEND_RESET_URL", "http://localhost:3000/reset-password")
        reset_link = f"{frontend_reset_url}?uid={uidb64}&token={token}"

        subject = "Recuperación de contraseña"
        message = (
            f"Hola {user.username},\n\n"
            f"Alguien (esperamos que tú) solicitó recuperar la contraseña de esta cuenta.\n"
            f"Para cambiar tu contraseña, haz clic en el siguiente enlace o cópialo en tu navegador:\n\n"
            f"{reset_link}\n\n"
            f"Si no solicitaste este correo, puedes ignorarlo. El enlace expirará en breve.\n\n"
            f"Saludos,\n"
            f"Equipo AdoptAble"
        )
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )

    return Response(
        {"message": "Si ese correo existe en nuestro sistema, se ha enviado un enlace de recuperación."},
        status=status.HTTP_200_OK,
    )


@api_view(["PUT"])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    """
    PUT /users/password-reset-confirm/
    Recibe { "uid": "...", "token": "...", "new_password": "..." }.
    Valida y actualiza la contraseña.
    """
    uid = request.data.get("uid")
    token = request.data.get("token")
    new_password = request.data.get("new_password")

    if not uid or not token or not new_password:
        return Response(
            {"detail": "Debe proporcionar uid, token y new_password."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user_pk = urlsafe_base64_decode(uid).decode()
        user = User.objects.get(pk=user_pk)
    except Exception:
        return Response({"detail": "UID inválido."}, status=status.HTTP_400_BAD_REQUEST)

    if not PasswordResetTokenGenerator().check_token(user, token):
        return Response({"detail": "Token inválido o expirado."}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()
    return Response({"message": "Contraseña actualizada correctamente."}, status=status.HTTP_200_OK)
