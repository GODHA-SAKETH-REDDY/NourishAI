from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims if needed
        return token

    def validate(self, attrs):
        # Accept email or username for login
        credentials = {
            'password': attrs.get('password'),
        }
        user_obj = None
        username_or_email = attrs.get('username')
        if User.objects.filter(email=username_or_email).exists():
            user_obj = User.objects.filter(email=username_or_email).first()
            if not user_obj:
                raise self.fail('no_active_account')
            credentials['username'] = user_obj.username
        else:
            credentials['username'] = username_or_email
        attrs['username'] = credentials['username']
        return super().validate(attrs)
