from rest_framework import permissions


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permite operar solo a la protectora que creó el animal (owner) o a un admin.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        user = request.user
        if user and (user.is_staff or user.is_superuser):
            return True

        return getattr(obj, "owner", None) == user
