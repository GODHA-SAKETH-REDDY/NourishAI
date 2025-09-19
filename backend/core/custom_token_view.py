from rest_framework_simplejwt.views import TokenObtainPairView
from .email_token import EmailTokenObtainPairSerializer

class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer
