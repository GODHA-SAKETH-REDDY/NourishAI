from rest_framework import serializers
from .models import UserProfile, Recipe, FoodLog
class RecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = '__all__'


class UserProfileSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = UserProfile
        fields = '__all__'


# FoodLog serializer
class FoodLogSerializer(serializers.ModelSerializer):
    recipe = RecipeSerializer(read_only=True)
    recipe_id = serializers.PrimaryKeyRelatedField(
        queryset=Recipe.objects.all(), source='recipe', write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = FoodLog
        fields = [
            'id', 'user_profile', 'recipe', 'recipe_id', 'custom_food', 'date',
            'meal_type', 'calories', 'protein', 'carbs', 'fats'
        ]
