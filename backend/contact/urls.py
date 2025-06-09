from django.urls import path

from . import views

urlpatterns = [
    path("contact/", views.contact_view, name="contact"),
    path("contact/admin/messages/", views.list_contact_messages, name="contact_list_messages"),
    path(
        "contact/admin/messages/<int:message_id>/",
        views.manage_contact_message,
        name="contact_retrieve_message",
    ),
]
