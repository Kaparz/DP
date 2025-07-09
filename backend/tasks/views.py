# backend/tasks/views.py
from rest_framework import viewsets, permissions, generics
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    User, Project, Task, Comment,
    StatusChangeLog, Notification, TimeSpent
)
from .serializers import (
    UserSerializer, ProjectSerializer, TaskSerializer, CommentSerializer,
    StatusChangeLogSerializer, NotificationSerializer, TimeSpentSerializer,
    RegisterSerializer
)
from .permissions import (
    IsSelfOrAdmin,          # смотреть/менять собственные данные или админ
    IsOwnerOrReadOnly       # редактировать объект может только владелец (или админ)
)

# ------------------------------------------------------------------
# Доп-permission: чтение всем, запись только admin|manager
# ------------------------------------------------------------------
class IsAdminOrManagerOrReadOnly(permissions.BasePermission):
    """
    SAFE_METHODS (GET, HEAD, OPTIONS) — любой авторизованный.
    Изменения — только админ или менеджер.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ('admin', 'manager')
        )

# ------------------------------------------------------------------
# Пользователи
# ------------------------------------------------------------------
class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/users/?role=manager — фильтрация по роли.
    """
    queryset           = User.objects.all()
    serializer_class   = UserSerializer
    permission_classes = (permissions.IsAuthenticated, IsSelfOrAdmin)

    def get_queryset(self):
        role = self.request.query_params.get('role')
        return self.queryset.filter(role=role) if role else self.queryset

# ------------------------------------------------------------------
# Проекты
# ------------------------------------------------------------------
class ProjectViewSet(viewsets.ModelViewSet):
    """
    • admin  — видит и может редактировать все проекты  
    • manager— видит проекты, где он назначен менеджером  
    • worker — видит проекты, в которых у него есть задачи  
    Создавать/изменять могут только admin и manager.
    """
    serializer_class   = ProjectSerializer
    permission_classes = (permissions.IsAuthenticated, IsAdminOrManagerOrReadOnly)

    # --- динамический queryset ---
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Project.objects.all()

        if user.role == 'manager':
            return Project.objects.filter(manager=user)

        # worker
        return Project.objects.filter(tasks__assignee=user).distinct()

    # --- при создании подставляем менеджера, если не указан ---
    def perform_create(self, serializer):
        manager = serializer.validated_data.get('manager') or self.request.user
        serializer.save(manager=manager)

# ------------------------------------------------------------------
# Задачи
# ------------------------------------------------------------------
class TaskViewSet(viewsets.ModelViewSet):
    queryset           = Task.objects.all()
    serializer_class   = TaskSerializer
    permission_classes = (permissions.IsAuthenticated, IsOwnerOrReadOnly)
    filter_backends    = (DjangoFilterBackend,)
    filterset_fields   = ('status', 'deadline', 'project')

# ------------------------------------------------------------------
# Комментарии
# ------------------------------------------------------------------
class CommentViewSet(viewsets.ModelViewSet):
    queryset           = Comment.objects.all()
    serializer_class   = CommentSerializer
    permission_classes = (permissions.IsAuthenticated,)

# ------------------------------------------------------------------
# Журнал смен статусов
# ------------------------------------------------------------------
class StatusChangeLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset           = StatusChangeLog.objects.all()
    serializer_class   = StatusChangeLogSerializer
    permission_classes = (permissions.IsAuthenticated,)

# ------------------------------------------------------------------
# Уведомления
# ------------------------------------------------------------------
class NotificationViewSet(viewsets.ModelViewSet):
    queryset           = Notification.objects.all()
    serializer_class   = NotificationSerializer
    permission_classes = (permissions.IsAuthenticated, IsSelfOrAdmin)

# ------------------------------------------------------------------
# Учёт времени
# ------------------------------------------------------------------
class TimeSpentViewSet(viewsets.ModelViewSet):
    queryset           = TimeSpent.objects.all()
    serializer_class   = TimeSpentSerializer
    permission_classes = (permissions.IsAuthenticated, IsOwnerOrReadOnly)

# ------------------------------------------------------------------
# Регистрация нового пользователя
# ------------------------------------------------------------------
class RegisterView(generics.CreateAPIView):
    queryset           = User.objects.all()
    serializer_class   = RegisterSerializer
    permission_classes = (permissions.AllowAny,)
