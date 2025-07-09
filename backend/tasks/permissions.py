# backend/tasks/permissions.py
from rest_framework import permissions


# ────────────────────────────────────────────────────────────────
# Общие небольшие хелперы
# ────────────────────────────────────────────────────────────────
def _is_admin(user):
    return getattr(user, "role", "") == "admin"


def _is_manager(user):
    return getattr(user, "role", "") == "manager"


# ────────────────────────────────────────────────────────────────
# 1) Объект связан с request.user (например Notification)
# ────────────────────────────────────────────────────────────────
class IsSelfOrAdmin(permissions.BasePermission):
    """
    Чтение — только сам пользователь или админ.
    Изменения/удаление — только админ.
    """

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False

        # safe методы — только свои данные или админ
        if request.method in permissions.SAFE_METHODS:
            return obj.user == request.user or _is_admin(request.user)

        # изменение — только админ
        return _is_admin(request.user)


# ────────────────────────────────────────────────────────────────
# 2) Владение объектом напрямую (например TimeSpent)
# ────────────────────────────────────────────────────────────────
class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    SAFE — любой авторизованный.
    Изменение/удаление — владелец объекта или админ.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated

        return obj.user == request.user or _is_admin(request.user)


# ────────────────────────────────────────────────────────────────
# 3) Проекты: менять могут админ и менеджер
# ────────────────────────────────────────────────────────────────
class IsAdminOrManagerOrReadOnly(permissions.BasePermission):
    """
    SAFE — любой авторизованный.
    POST/PUT/PATCH/DELETE — admin или manager.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated

        return _is_admin(request.user) or _is_manager(request.user)


# ────────────────────────────────────────────────────────────────
# 4) Менеджер конкретного проекта (для ProjectViewSet до изменений)
# ────────────────────────────────────────────────────────────────
class IsProjectManagerOrAdmin(permissions.BasePermission):
    """
    SAFE — любой.
    Изменять/удалять проект может:
        • admin
        • менеджер самого проекта
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated

        user = request.user
        return _is_admin(user) or obj.manager == user


# ────────────────────────────────────────────────────────────────
# 5) Новое правило для TaskViewSet
# ────────────────────────────────────────────────────────────────
class IsAssigneeOrProjectManagerOrAdmin(permissions.BasePermission):
    """
    SAFE — любой авторизованный.

    Изменять/удалять задачу может:
        • admin
        • менеджер проекта, к которому относится задача
        • сам исполнитель (assignee)
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated

        user = request.user
        if not user.is_authenticated:
            return False

        if _is_admin(user):
            return True

        if getattr(obj.project, "manager", None) == user:
            return True

        if getattr(obj, "assignee", None) == user:
            return True

        return False
