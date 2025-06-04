from rest_framework import permissions

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permite operar solo a la protectora que creó el animal (owner) o a un admin.
    """
    def has_object_permission(self, request, view, obj):
        # Métodos seguros (GET, HEAD, OPTIONS) siempre permitidos si ya pasa IsAuthenticated.
        if request.method in permissions.SAFE_METHODS:
            return True

        user = request.user
        # Si es administrador (is_staff o is_superuser), permite cualquier acción.
        if user and (user.is_staff or user.is_superuser):
            return True

        # En otro caso, solo el owner (protectora) puede operar sobre el objeto.
        return getattr(obj, "owner", None) == user

