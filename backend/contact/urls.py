from django.urls import path

from .views import contact_view, list_contact_messages, manage_contact_message

urlpatterns = [
    path("contact/", contact_view, name="contact"),
    path("contact/admin/messages/", list_contact_messages, name="contact_list_messages"),
    path(
        "contact/admin/messages/<int:message_id>/",
        manage_contact_message,
        name="contact_retrieve_message",
    ),
]
