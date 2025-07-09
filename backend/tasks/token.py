# backend/tasks/token.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class MyTokenSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # дополнительные поля
        token['role']     = user.role
        token['username'] = user.username
        return token

class MyTokenView(TokenObtainPairView):
    serializer_class = MyTokenSerializer
