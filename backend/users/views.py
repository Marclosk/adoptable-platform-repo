# users/views.py
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view,  permission_classes
from django.contrib.auth import authenticate, login, logout
from .serializers import RegisterSerializer, UserSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.views.decorators.csrf import csrf_exempt


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
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)  
            return Response({"message": "Login successful!"}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

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
@permission_classes([IsAuthenticated]) 
def check_session(request):
    """
    Verifica si el usuario ha iniciado sesión correctamente.
    """
    return Response({"message": "Session is valid!"}, status=status.HTTP_200_OK)