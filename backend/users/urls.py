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
    adoption_form_view,
    user_profile_view,
    user_search,
    list_pending_protectoras,
    validate_protectora,
    block_user,
    unblock_user,
    delete_user,
    list_blocked_users,
    password_reset_confirm,
    password_reset_request

)

urlpatterns = [

    path('register/', register_view, name='register'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('check_session/', check_session, name='check_session'),
    path("<int:user_id>/profile/", user_profile_view),
    path("", user_search),

    path("password-reset-confirm/", password_reset_confirm),
    path("password-reset/", password_reset_request),

    path('profile/', get_profile, name='get_profile'),
    path('profile/update/', update_profile, name='update_profile'),

    path('profile/adoption-form/', adoption_form_view, name='adoption-form'),


    path('adopters/', AdopterListView.as_view(), name='adopter-list'),


    path('favorites/<int:animal_id>/', favorite_animal, name='favorite-animal'),

    path('animals/request/<int:req_id>/delete/', cancel_adoption_request_view, name='cancel-adoption-request'),

    path('animals/<int:animal_id>/request/', adoption_request_view, name='adoption-request'),

    path('admin/pending-protectoras/', list_pending_protectoras, name='list_pending_protectoras'),
    path('admin/validate-protectora/<int:user_id>/', validate_protectora, name='validate_protectora'),

    path("admin/block/<int:user_id>/", block_user, name="block_user"),
    path("admin/unblock/<int:user_id>/", unblock_user, name="unblock_user"),
    path("admin/delete/<int:user_id>/", delete_user, name="delete_user"),
    path("admin/blocked-users/", list_blocked_users, name="list_blocked_users"),
]