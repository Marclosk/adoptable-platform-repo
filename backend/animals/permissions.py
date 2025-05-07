from rest_framework import permissions

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permite operar sólo a la protectora que creó el animal (owner) o a admin.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user and request.user.is_staff:
            return True
        return getattr(obj, "owner", None) == request.user
