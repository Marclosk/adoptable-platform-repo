from django.urls import path
from .views import (
    register_view,
    login_view,
    logout_view,
    check_session,
    get_profile,
    update_profile,
    AdopterListView,
    favorite_animal,
    cancel_adoption_request_view,
    adoption_request_view,
)

urlpatterns = [

    path('register/', register_view, name='register'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('check_session/', check_session, name='check_session'),


    path('profile/', get_profile, name='get_profile'),
    path('profile/update/', update_profile, name='update_profile'),


    path('adopters/', AdopterListView.as_view(), name='adopter-list'),


    path('favorites/<int:animal_id>/', favorite_animal, name='favorite-animal'),

    path('animals/request/<int:req_id>/delete/', cancel_adoption_request_view, name='cancel-adoption-request'),

    path('animals/<int:animal_id>/request/', adoption_request_view, name='adoption-request'),


]
