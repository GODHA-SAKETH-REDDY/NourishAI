from rest_framework import serializers
from .models import UserProfile, Recipe, FoodLog, WeightLog, MeasurementLog, CommunityPost, CommunityComment, CommunityGroup, CommunityChallenge, ChallengeLeaderboard
class RecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = '__all__'


class UserProfileSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    username = serializers.SerializerMethodField(read_only=True)
    email = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = UserProfile
        fields = '__all__'

    def get_username(self, obj):
        try:
            return obj.user.username if obj.user else ""
        except Exception:
            return ""

    def get_email(self, obj):
        try:
            return obj.user.email if obj.user else ""
        except Exception:
            return ""


class SimpleUserSerializer(serializers.ModelSerializer):
    """Lightweight nested user info for community displays."""
    username = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'avatar']

    def get_username(self, obj):
        if obj.user:
            return obj.user.username
        return f"user-{obj.id}"

    def get_avatar(self, obj):
        # Placeholder avatar (frontend can handle if missing)
        return ""


# FoodLog serializer
class FoodLogSerializer(serializers.ModelSerializer):
    recipe = RecipeSerializer(read_only=True)
    recipe_id = serializers.PrimaryKeyRelatedField(
        queryset=Recipe.objects.all(), source='recipe', write_only=True, required=False, allow_null=True
    )
    # Server sets this from the authenticated user; clients should not send it
    user_profile = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = FoodLog
        fields = [
            'id', 'user_profile', 'recipe', 'recipe_id', 'custom_food', 'date',
            'meal_type', 'calories', 'protein', 'carbs', 'fats'
        ]


class WeightLogSerializer(serializers.ModelSerializer):
    # Server sets this from the authenticated user; clients should not send it
    user_profile = serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = WeightLog
        fields = ['id', 'user_profile', 'date', 'weight']


class MeasurementLogSerializer(serializers.ModelSerializer):
    # Server sets this from the authenticated user; clients should not send it
    user_profile = serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = MeasurementLog
        fields = ['id', 'user_profile', 'date', 'waist', 'hips']


# --- Community serializers ---
class CommunityCommentSerializer(serializers.ModelSerializer):
    user = SimpleUserSerializer(source='user_profile', read_only=True)

    class Meta:
        model = CommunityComment
        fields = ['id', 'user', 'text', 'created_at']


class CommunityPostSerializer(serializers.ModelSerializer):
    user = SimpleUserSerializer(source='user_profile', read_only=True)
    comments = CommunityCommentSerializer(many=True, read_only=True)
    likes_count = serializers.IntegerField(read_only=True)
    liked = serializers.SerializerMethodField()

    class Meta:
        model = CommunityPost
        fields = ['id', 'user', 'content', 'image_url', 'topic', 'created_at', 'likes_count', 'liked', 'comments']

    def get_liked(self, obj):
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            return False
        try:
            up = UserProfile.objects.get(user=request.user)
        except UserProfile.DoesNotExist:
            return False
        return obj.likes.filter(id=up.id).exists()


# Groups & Challenges
class CommunityGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunityGroup
        fields = ['id', 'name', 'desc']


class ChallengeEntrySerializer(serializers.ModelSerializer):
    user = SimpleUserSerializer(source='user_profile', read_only=True)

    class Meta:
        model = ChallengeLeaderboard
        fields = ['position', 'user']


class CommunityChallengeSerializer(serializers.ModelSerializer):
    leaderboard = ChallengeEntrySerializer(many=True, read_only=True)

    class Meta:
        model = CommunityChallenge
        fields = ['id', 'name', 'desc', 'leaderboard']
