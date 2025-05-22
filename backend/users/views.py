from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import authenticate, login, logout
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from animals.models import AdoptionRequest, Animal
from animals.serializers import AdoptionRequestSerializer, AnimalSerializer
from .serializers import (
    AdopterListSerializer,
    RegisterSerializer,
    UserSerializer,
    AdopterProfileSerializer,
)
from .models import AdopterProfile

User = get_user_model()


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

    # Primero buscamos al usuario para ver si existe y su estado
    try:
        user_obj = User.objects.get(username=username)
    except User.DoesNotExist:
        user_obj = None

    # Si existe pero aún no está activo, devolvemos 403
    if user_obj and not user_obj.is_active:
        return Response(
            {"error": "Tu cuenta está pendiente de aprobación."},
            status=status.HTTP_403_FORBIDDEN
        )

    # Autenticamos (si era inactivo, ya hemos salido con 403)
    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response(
            {"error": "Credenciales inválidas"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Login y respuesta
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


@api_view(['GET', 'POST', 'DELETE'])
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

    if request.method == 'POST':
        AdoptionRequest.objects.get_or_create(user=user, animal=animal)
        return Response(status=status.HTTP_201_CREATED)

    # DELETE
    AdoptionRequest.objects.filter(user=user, animal=animal).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    print("★ get_profile arrancó para:", request.user)
    user = request.user
    user_data = UserSerializer(user).data
    role = "protectora" if user.is_staff else "adoptante"
    user_data['role'] = role

    if not user.is_staff:
        # obtenemos el perfil de adoptante
        try:
            profile = user.profile
        except AdopterProfile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

        # serializamos los campos básicos de AdopterProfile
        profile_data = AdopterProfileSerializer(profile).data

        # favoritos
        fav_qs = profile.favorites.all()
        profile_data['favorites'] = AnimalSerializer(fav_qs, many=True).data

        # adoptados
        adopted_qs = Animal.objects.filter(adopter=user)
        profile_data['adopted'] = AnimalSerializer(adopted_qs, many=True).data

        # solicitudes de adopción
        req_qs = AdoptionRequest.objects.filter(user=user)
        profile_data['requests'] = AdoptionRequestSerializer(req_qs, many=True).data

        return Response({**user_data, **profile_data}, status=status.HTTP_200_OK)

    # perfil protectora
    en_adopcion_qs = Animal.objects.filter(owner=user, adopter__isnull=True)
    adopted_owner_qs = Animal.objects.filter(owner=user, adopter__isnull=False)
    return Response({
        **user_data,
        "en_adopcion": AnimalSerializer(en_adopcion_qs, many=True).data,
        "adopted": AnimalSerializer(adopted_owner_qs, many=True).data,
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

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def cancel_adoption_request_view(request, req_id):
    # Borra la AdoptionRequest con pk=req_id y user=request.user
    deleted, _ = AdoptionRequest.objects.filter(pk=req_id, user=request.user).delete()
    if deleted:
        return Response(status=status.HTTP_204_NO_CONTENT)
    return Response({'detail': 'No encontrado o sin permisos'}, status=status.HTTP_404_NOT_FOUND)

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def adoption_form_view(request):
    profile = request.user.profile
    if request.method == 'GET':
        return Response({"adoption_form": profile.adoption_form})
    # PUT
    form_data = request.data.get("adoption_form", {})
    profile.adoption_form = form_data
    profile.save()
    return Response({"adoption_form": profile.adoption_form})
