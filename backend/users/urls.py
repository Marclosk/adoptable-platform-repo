from django.urls import path

from . import views

urlpatterns = [
    path("register/", views.register_view, name="register"),
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("check_session/", views.check_session, name="check_session"),
    path("<int:user_id>/profile/", views.user_profile_view),
    path("", views.user_search),
    path("password-reset-confirm/", views.password_reset_confirm),
    path("password-reset/", views.password_reset_request),
    path("profile/", views.get_profile, name="get_own_profile"),
    path("profile/update/", views.update_profile, name="update_profile"),
    path("profile/adoption-form/", views.adoption_form_view, name="adoption-form"),
    path("adopters/", views.AdopterListView.as_view(), name="adopter-list"),
    path("favorites/<int:animal_id>/", views.favorite_animal, name="favorite-animal"),
    path(
        "animals/request/<int:req_id>/delete/",
        views.cancel_adoption_request_view,
        name="cancel-adoption-request",
    ),
    path(
        "animals/<int:animal_id>/request/",
        views.adoption_request_view,
        name="adoption-request",
    ),
    path(
        "admin/pending-protectoras/",
        views.list_pending_protectoras,
        name="list_pending_protectoras",
    ),
    path(
        "admin/validate-protectora/<int:user_id>/",
        views.validate_protectora,
        name="validate_protectora",
    ),
    path("admin/block/<int:user_id>/", views.block_user, name="block_user"),
    path("admin/unblock/<int:user_id>/", views.unblock_user, name="unblock_user"),
    path("admin/delete/<int:user_id>/", views.delete_user, name="delete_user"),
    path("admin/blocked-users/", views.list_blocked_users, name="list_blocked_users"),
]
