from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import authenticate, login, logout
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.views.decorators.csrf import csrf_exempt
from .serializers import RegisterSerializer, UserSerializer, AdopterProfileSerializer
from .models import AdopterProfile
from django.core.mail import send_mail


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

    # Determinamos el rol (por ejemplo usando is_staff o un campo en el perfil)
    role = "protectora" if user.is_staff else "adoptante"

    return Response(
        {
            "message": "Login successful!",
            "user": user_data,
            "role": role
        },
        status=status.HTTP_200_OK
    )

@permission_classes([AllowAny])
@api_view(['POST'])
def logout_view(request):
    """
    Vista para cerrar sesión.
    """
    if request.method == 'POST':
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
    Obtiene la información del perfil del usuario autenticado.
    """
    try:
        profile = request.user.profile 
        serializer = AdopterProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except AdopterProfile.DoesNotExist:
        return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """
    Permite al usuario actualizar su perfil, incluyendo la carga de un avatar.
    """
    try:
        profile = request.user.profile 
        
        # Establece el parser para que maneje datos de formulario y archivos
        parser_classes = (MultiPartParser, FormParser)
        
        # Usar el serializer para manejar tanto los datos como los archivos
        serializer = AdopterProfileSerializer(profile, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except AdopterProfile.DoesNotExist:
        return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)


