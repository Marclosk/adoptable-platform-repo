from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import authenticate, login, logout
from django.core.mail import send_mail
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404

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
        user.is_staff = True
        user.is_active = False
        user.save()

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
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response({"error": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)
    if not user.is_active:
        return Response({"error": "Tu cuenta está pendiente de aprobación."}, status=status.HTTP_403_FORBIDDEN)

    login(request, user)
    user_data = UserSerializer(user).data
    role = "protectora" if user.is_staff else "adoptante"

    return Response(
        {"message": "Login successful!", "user": user_data, "role": role},
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def logout_view(request):
    logout(request)
    response = Response({"message": "Logout successful!"}, status=status.HTTP_200_OK)
    response.delete_cookie('sessionid', path='/')
    response.delete_cookie('csrftoken', path='/')
    return response


@api_view(['GET'])
@permission_classes([AllowAny])
def check_session(request):
    if request.user.is_authenticated:
        return Response({"message": "Session is valid!"}, status=status.HTTP_200_OK)
    return Response({"message": "Session is invalid, please log in."}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def favorite_animal(request, animal_id):
    profile = request.user.profile
    animal = get_object_or_404(Animal, pk=animal_id)
    if request.method == 'POST':
        profile.favorites.add(animal)
    else:
        profile.favorites.remove(animal)
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    user = request.user
    user_data = UserSerializer(user).data
    role = "protectora" if user.is_staff else "adoptante"
    user_data['role'] = role

    if not user.is_staff:
        try:
            profile = user.profile
        except AdopterProfile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

        profile_data = AdopterProfileSerializer(profile).data
        adopted_qs = Animal.objects.filter(adopter=user)
        profile_data['adopted'] = AnimalSerializer(adopted_qs, many=True).data

        return Response({**user_data, **profile_data}, status=status.HTTP_200_OK)

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
    Actualiza avatar, location, phone_number, bio para adoptantes.
    Luego reconstruye y devuelve el payload completo como get_profile.
    """
    try:
        profile = request.user.profile
    except AdopterProfile.DoesNotExist:
        return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = AdopterProfileSerializer(profile, data=request.data, partial=True)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    serializer.save()

    user = request.user
    user_data = UserSerializer(user).data
    role = "protectora" if user.is_staff else "adoptante"
    user_data['role'] = role

    if role == "adoptante":
        profile_data = serializer.data

        fav_qs = profile.favorites.all()
        profile_data['favorites'] = AnimalSerializer(fav_qs, many=True).data

        adopted_qs = Animal.objects.filter(adopter=user)
        profile_data['adopted'] = AnimalSerializer(adopted_qs, many=True).data
        return Response({**user_data, **profile_data}, status=status.HTTP_200_OK)


    en_adopcion_qs = Animal.objects.filter(owner=user, adopter__isnull=True)
    adopted_owner_qs = Animal.objects.filter(owner=user, adopter__isnull=False)
    return Response({
        **user_data,
        "en_adopcion": AnimalSerializer(en_adopcion_qs, many=True).data,
        "adopted": AnimalSerializer(adopted_owner_qs, many=True).data,
    }, status=status.HTTP_200_OK)


class AdopterListView(generics.ListAPIView):
    queryset = User.objects.filter(is_staff=False, is_active=True)
    serializer_class = AdopterListSerializer
    permission_classes = [AllowAny]
