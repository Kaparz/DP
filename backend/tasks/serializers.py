# backend/tasks/serializers.py
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password
from django.shortcuts import get_object_or_404

from .models import (
    User, Project, Task, Comment,
    StatusChangeLog, Notification, TimeSpent
)

# ----------------------------------------------------------------------
# User
# ----------------------------------------------------------------------
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role')


# ----------------------------------------------------------------------
# Project
# ----------------------------------------------------------------------
class ProjectSerializer(serializers.ModelSerializer):
    manager    = UserSerializer(read_only=True)
    manager_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='manager'),
        source='manager',
        write_only=True,
        allow_null=True
    )

    class Meta:
        model  = Project
        fields = (
            'id', 'name', 'description',
            'start_date', 'end_date',
            'manager', 'manager_id'
        )

    def validate(self, attrs):
        start = attrs.get('start_date', getattr(self.instance, 'start_date', None))
        end   = attrs.get('end_date',   getattr(self.instance, 'end_date',   None))
        if start and end and start > end:
            raise serializers.ValidationError('Дата окончания раньше даты начала проекта.')
        return attrs


# ----------------------------------------------------------------------
# Task
# ----------------------------------------------------------------------
class TaskSerializer(serializers.ModelSerializer):
    assignee    = UserSerializer(read_only=True)
    assignee_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='worker'),
        source='assignee',
        write_only=True,
        allow_null=True
    )
    project    = serializers.StringRelatedField(read_only=True)
    project_id = serializers.PrimaryKeyRelatedField(
        queryset=Project.objects.all(),
        source='project',
        write_only=True
    )

    class Meta:
        model  = Task
        fields = (
            'id', 'title', 'description',
            'project', 'project_id',
            'assignee', 'assignee_id',
            'status', 'priority',
            'deadline', 'created_at'
        )

    # --- безопасная проверка дедлайна ---
    def validate_deadline(self, value):
        """
        Дедлайн не должен позже end_date проекта.
        Если project_id пришёл строкой, получаем объект Project.
        """
        project_pk = self.initial_data.get('project_id')
        if project_pk:
            project = get_object_or_404(Project, pk=project_pk)
        else:
            project = getattr(self.instance, 'project', None)

        if project and value > project.end_date:
            raise serializers.ValidationError('Дедлайн выходит за пределы проекта.')
        return value


# ----------------------------------------------------------------------
# Comment
# ----------------------------------------------------------------------
class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model  = Comment
        fields = ('id', 'task', 'author', 'text', 'created_at')


# ----------------------------------------------------------------------
# Status change log
# ----------------------------------------------------------------------
class StatusChangeLogSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model  = StatusChangeLog
        fields = ('id', 'task', 'user', 'old_status', 'new_status', 'changed_at', 'comment')


# ----------------------------------------------------------------------
# Notification
# ----------------------------------------------------------------------
class NotificationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model  = Notification
        fields = ('id', 'user', 'message', 'created_at', 'is_read', 'category')


# ----------------------------------------------------------------------
# Time spent
# ----------------------------------------------------------------------
class TimeSpentSerializer(serializers.ModelSerializer):
    user     = UserSerializer(read_only=True)
    duration = serializers.SerializerMethodField()

    class Meta:
        model  = TimeSpent
        fields = ('id', 'task', 'user', 'start_time', 'end_time', 'duration', 'comment')

    def get_duration(self, obj):
        dur = obj.duration()
        return dur.total_seconds() if dur else None


# ----------------------------------------------------------------------
# Register
# ----------------------------------------------------------------------
class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password  = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    # делаем first/last name необязательными
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name  = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model  = User
        fields = (
            'username', 'password', 'password2',
            'email', 'first_name', 'last_name'
        )

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Пароли не совпадают.'})
        return attrs

    def create(self, validated_data):
        """Всегда создаём пользователя-worker"""
        validated_data.pop('password2')
        password = validated_data.pop('password')

        user = User(
            username   = validated_data['username'],
            email      = validated_data['email'],
            first_name = validated_data.get('first_name', ''),
            last_name  = validated_data.get('last_name', ''),
            role       = 'worker',
        )
        user.set_password(password)
        user.save()
        return user
