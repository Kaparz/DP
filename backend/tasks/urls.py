from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .token import MyTokenView   
from .views import (
    UserViewSet, ProjectViewSet, TaskViewSet, CommentViewSet,
    StatusChangeLogViewSet, NotificationViewSet, TimeSpentViewSet,
    RegisterView
)

router = DefaultRouter()
router.register(r'users',          UserViewSet,          basename='user')
router.register(r'projects',       ProjectViewSet,       basename='project')
router.register(r'tasks',          TaskViewSet,          basename='task')
router.register(r'comments',       CommentViewSet,       basename='comment')
router.register(r'status_logs',    StatusChangeLogViewSet, basename='statuslog')
router.register(r'notifications',  NotificationViewSet,  basename='notification')
router.register(r'time_spent',     TimeSpentViewSet,     basename='timespent')

urlpatterns = [
    path('', include(router.urls)),
    path('token/',  MyTokenView.as_view(),        name='token_obtain_pair'),
    path('token/refresh/',  TokenRefreshView.as_view(),    name='token_refresh'),
    path('register/',       RegisterView.as_view(),        name='register'),
]
