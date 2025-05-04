# backend/users/views.py
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, parser_classes
from django.contrib.auth import authenticate, login, logout
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail
from django.contrib.auth.models import User

from .serializers import (
    AdopterListSerializer,
    RegisterSerializer,
    UserSerializer,
    AdopterProfileSerializer,
)
from .models import AdopterProfile
from animals.models import Animal
from animals.serializers import AnimalSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    role = request.data.get("role", "adoptante")
    localidad = request.data.get("localidad", "")

    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = serializer.save()

    if role == "protectora":
        # marcamos al usuario como staff (protectora)
        user.is_staff = True
        # y desactivamos hasta que el admin lo apruebe
        user.is_active = False
        user.save()

        # mandamos el mail de notificación
        send_mail(
            subject="Solicitud de registro de protectora",
            message=(
                f"La protectora {user.username} (email: {user.email}) "
                f"solicita registrarse. Localidad: {localidad}"
            ),
            from_email="no-reply@miapp.com",
            recipient_list=["marclosquino2@gmail.com"],
        )

        return Response(
            {"message": "Solicitud de protectora enviada. Espera aprobación."},
            status=status.HTTP_201_CREATED,
        )

    # PARA ADOPTANTE: nos aseguramos de que NO sea staff y siga activo
    user.is_staff = False
    user.is_active = True
    user.save()

    return Response(
        {"message": "Usuario creado correctamente!"},
        status=status.HTTP_201_CREATED
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Login: además de iniciar sesión, devuelve el usuario y el rol al frontend.
    """
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response(
            {"error": "Credenciales inválidas"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Solo cuentas activas
    if not user.is_active:
        return Response(
            {"error": "Tu cuenta está pendiente de aprobación."},
            status=status.HTTP_403_FORBIDDEN
        )

    login(request, user)

    # Serializamos el usuario
    user_data = UserSerializer(user).data

    # Determinamos el rol
    role = "protectora" if user.is_staff else "adoptante"

    return Response(
        {
            "message": "Login successful!",
            "user": user_data,
            "role": role
        },
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def logout_view(request):
    """
    Vista para cerrar sesión.
    """
    logout(request)
    response = Response({"message": "Logout successful!"}, status=status.HTTP_200_OK)
    response.delete_cookie('sessionid', path='/')
    response.delete_cookie('csrftoken', path='/')
    return response


@api_view(['GET'])
@permission_classes([AllowAny])
def check_session(request):
    """
    Verifica si el usuario ha iniciado sesión correctamente.
    """
    if request.user.is_authenticated:
        return Response({"message": "Session is valid!"}, status=status.HTTP_200_OK)
    return Response({"message": "Session is invalid, please log in."}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    """
    Devuelve el perfil completo del usuario autenticado, con:
    - Campos de UserSerializer
    - role ('protectora' si is_staff, 'adoptante' si no)
    - Para adoptantes: avatar, location, phone_number, bio, favorites y adopted dinámico
    - Para protectoras: listas en_adopcion y adopted dinámicas
    """
    user = request.user
    user_data = UserSerializer(user).data
    role = "protectora" if user.is_staff else "adoptante"
    user_data['role'] = role

    if not user.is_staff:
        # perfil adoptante
        try:
            profile = user.profile
        except AdopterProfile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

        profile_data = AdopterProfileSerializer(profile).data
        # animales que este usuario ha adoptado
        adopted_qs = Animal.objects.filter(adopter=user)
        profile_data['adopted'] = AnimalSerializer(adopted_qs, many=True).data

        return Response({**user_data, **profile_data}, status=status.HTTP_200_OK)
    else:
        # perfil protectora
        en_adopcion_qs = Animal.objects.filter(owner=user, adopter__isnull=True)
        adopted_qs = Animal.objects.filter(owner=user, adopter__isnull=False)

        return Response({
            **user_data,
            "en_adopcion": AnimalSerializer(en_adopcion_qs, many=True).data,
            "adopted": AnimalSerializer(adopted_qs, many=True).data,
        }, status=status.HTTP_200_OK)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def update_profile(request):
    """
    Actualiza el perfil del adoptante (avatar, location, phone_number, bio).
    Tras guardar, devuelve el mismo payload que get_profile.
    """
    user = request.user
    try:
        profile = user.profile
    except AdopterProfile.DoesNotExist:
        return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = AdopterProfileSerializer(profile, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        # después de actualizar, devolvemos todo el perfil
        return get_profile(request)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdopterListView(generics.ListAPIView):
    """
    GET /api/users/adopters/
    Lista todos los usuarios activos que no sean staff (i.e. adoptantes).
    """
    queryset = User.objects.filter(is_staff=False, is_active=True)
    serializer_class = AdopterListSerializer
    permission_classes = [AllowAny]
