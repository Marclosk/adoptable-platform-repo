# users/views.py
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view,  permission_classes
from django.contrib.auth import authenticate, login
from .serializers import RegisterSerializer, UserSerializer
from rest_framework.permissions import AllowAny


@permission_classes([AllowAny])
@api_view(['POST'])
def register_view(request):
    if request.method == 'POST':
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message": "User created successfully!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@permission_classes([AllowAny])
@api_view(['POST'])
def login_view(request):
    """
    Vista para iniciar sesión con nombre de usuario y contraseña.
    """
    if request.method == 'POST':
        # Obtenemos los datos del request (nombre de usuario y contraseña)
        username = request.data.get('username')
        password = request.data.get('password')

        # Intentamos autenticar al usuario
        user = authenticate(request, username=username, password=password)
        
        # Si el usuario existe y las credenciales son correctas
        if user is not None:
            login(request, user)  # Creamos una sesión para el usuario
            return Response({"message": "Login successful!"}, status=status.HTTP_200_OK)
        else:
            # Si las credenciales son incorrectas
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
