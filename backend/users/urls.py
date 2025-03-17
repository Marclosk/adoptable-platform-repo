from django.urls import path
from . import views
from .views import get_profile, update_profile

urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'), 
    path('check_session/', views.check_session, name='check_session'),
    path("profile/", get_profile, name="get_profile"),
    path('profile/update/', update_profile, name='update_profile'),
]
