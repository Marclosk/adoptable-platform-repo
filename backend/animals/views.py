# views.py
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Animal
from .serializers import AnimalSerializer
from .signals import haversine_distance
from .permissions import IsOwnerOrAdmin

class AnimalListCreateView(generics.ListCreateAPIView):
    serializer_class = AnimalSerializer
    permission_classes = [IsAuthenticated]  # sólo usuarios autenticados pueden crear


    def get_queryset(self):
        queryset = Animal.objects.all()

        user_lat = self.request.query_params.get('user_lat')
        user_lng = self.request.query_params.get('user_lng')
        distance_param = self.request.query_params.get('distance')

        if user_lat and user_lng and distance_param:
            try:
                lat_user = float(user_lat)
                lng_user = float(user_lng)
                distance_km = float(distance_param)

                print("[DEBUG] user_lat:", lat_user, "user_lng:", lng_user, "distance:", distance_km)

                filtered_ids = []
                for animal in queryset:
                    if animal.latitude and animal.longitude:
                        dist = haversine_distance(lat_user, lng_user, animal.latitude, animal.longitude)
                        print(f"[DEBUG] Animal {animal.id} -> lat={animal.latitude}, lng={animal.longitude}, dist={dist} km")

                        if dist <= distance_km:
                            filtered_ids.append(animal.id)

                queryset = queryset.filter(id__in=filtered_ids)

            except ValueError:
                pass

        return queryset


class AnimalDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Animal.objects.all()
    serializer_class = AnimalSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]