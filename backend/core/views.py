from .models import UserProfile, Recipe, FoodLog
from .serializers import RecipeSerializer, FoodLogSerializer
from rest_framework import generics, filters

from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User

# Recipe List & Search API
class RecipeListView(generics.ListAPIView):
	queryset = Recipe.objects.all()
	serializer_class = RecipeSerializer
	filter_backends = [filters.SearchFilter]
	search_fields = ['name', 'cuisine']

# Recipe Detail API
class RecipeDetailView(generics.RetrieveAPIView):
	queryset = Recipe.objects.all()
	serializer_class = RecipeSerializer

# User registration endpoint

# FoodLog API views
class FoodLogListCreateView(generics.ListCreateAPIView):
	serializer_class = FoodLogSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		# Only return logs for the authenticated user's profile
		return FoodLog.objects.filter(user_profile__user=self.request.user).order_by('-date')

	def perform_create(self, serializer):
		# Attach the user's profile automatically
		user_profile = UserProfile.objects.get(user=self.request.user)
		serializer.save(user_profile=user_profile)


class FoodLogRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
	serializer_class = FoodLogSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		return FoodLog.objects.filter(user_profile__user=self.request.user)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
	username = request.data.get('username')
	password = request.data.get('password')
	email = request.data.get('email', '')
	if not username or not password:
		return Response({'error': 'Username and password are required.'}, status=400)
	if User.objects.filter(username=username).exists():
		return Response({'error': 'Username already exists.'}, status=400)
	user = User.objects.create_user(username=username, password=password, email=email)
	return Response({'message': 'User registered successfully.'}, status=201)

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import UserProfile, Recipe
from .serializers import UserProfileSerializer
import math

@api_view(['GET'])
@permission_classes([AllowAny])
def generate_meal_plan(request, profile_id):
	"""
	Generate a simple meal plan based on BMR/TDEE and user profile.
	"""
	try:
		profile = UserProfile.objects.get(id=profile_id)
	except UserProfile.DoesNotExist:
		return Response({'error': 'UserProfile not found'}, status=404)


	# Calculate BMR using Mifflin-St Jeor equation
	s = 5 if profile.gender.lower() == 'male' else -161
	bmr = 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age + s

	# Estimate TDEE based on activity level
	activity_factors = {
		'sedentary': 1.2,
		'lightly active': 1.375,
		'moderately active': 1.55,
		'very active': 1.725,
	}
	activity = profile.activity_level.lower()
	tdee = bmr * activity_factors.get(activity, 1.2)

	# Macro split (default: 30% protein, 40% carbs, 30% fat)
	calories = round(tdee)
	protein = round(0.3 * calories / 4)
	carbs = round(0.4 * calories / 4)
	fats = round(0.3 * calories / 9)

	# Personalized recipe filtering
	from .serializers import RecipeSerializer
	import random
	recipes = Recipe.objects.all()

	# Filter by dietary preference (if set)
	if profile.dietary_preferences:
		pref = profile.dietary_preferences.lower()
		if pref != 'omnivore':
			recipes = recipes.filter(description__icontains=pref)

	# Filter by cuisine preferences (comma-separated)
	if profile.cuisine_preferences:
		cuisines = [c.strip() for c in profile.cuisine_preferences.split(',') if c.strip()]
		if cuisines:
			recipes = recipes.filter(cuisine__in=cuisines)

	# Exclude recipes with allergens
	if profile.restrictions_allergies:
		allergens = [a.strip() for a in profile.restrictions_allergies.split(',') if a.strip()]
		for allergen in allergens:
			recipes = recipes.exclude(ingredients__icontains=allergen)


	all_recipes = list(recipes)
	# If no recipes after filtering, fall back to all recipes
	if not all_recipes:
		all_recipes = list(Recipe.objects.all())

	def pick_recipes(count):
		return random.sample(all_recipes, min(count, len(all_recipes))) if all_recipes else []

	breakfast_recipes = pick_recipes(2)
	lunch_recipes = pick_recipes(2)
	dinner_recipes = pick_recipes(2)
	snack_recipes = pick_recipes(2)

	meal_plan = {
		'calories': calories,
		'protein_g': protein,
		'carbs_g': carbs,
		'fats_g': fats,
		'meals': {
			'breakfast': RecipeSerializer(breakfast_recipes, many=True).data,
			'lunch': RecipeSerializer(lunch_recipes, many=True).data,
			'dinner': RecipeSerializer(dinner_recipes, many=True).data,
			'snacks': RecipeSerializer(snack_recipes, many=True).data,
		}
	}
	return Response(meal_plan)
@api_view(['POST'])
@permission_classes([AllowAny])
def onboarding(request):
	serializer = UserProfileSerializer(data=request.data)
	if serializer.is_valid():
		serializer.save()
		return Response(serializer.data, status=status.HTTP_201_CREATED)
	return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def userprofile_detail(request, pk):
    try:
        profile = UserProfile.objects.get(pk=pk)
    except UserProfile.DoesNotExist:
        return Response({'error': 'UserProfile not found'}, status=404)
    serializer = UserProfileSerializer(profile)
    return Response(serializer.data)
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def tracking_data(request, pk):
    try:
        profile = UserProfile.objects.get(pk=pk)
        tracking_info = {
            "weightData": [80, 79.5, 79, 78.7, 78.2, 77.8, 77.5],
            "weightLabels": ["Day 1", "Day 5", "Day 10", "Day 15", "Day 20", "Day 25", "Today"],
            "bodyMeasurements": {
                "waist": [90, 89, 88.5, 88, 87.5, 87, 86.5],
                "hips": [100, 99.5, 99, 98.5, 98, 97.5, 97]
            },
            "calorieIntake": [1800, 1950, 2100, 1700, 2000, 1850, 2200],
            "calorieTarget": 2000,
            "macros": {"protein": 35, "carbs": 45, "fat": 20},
            "micronutrients": {"Fiber": 80, "Sugar": 60, "Sodium": 70, "VitaminC": 90},
            "activityLog": [
                {"date": "2025-09-10", "activity": "Morning Walk", "steps": 3500, "kcal": 120},
                {"date": "2025-09-11", "activity": "Gym Session", "steps": 0, "kcal": 350},
                {"date": "2025-09-12", "activity": "Yoga", "steps": 0, "kcal": 90}
            ],
            "progressPhotos": [
                {"url": "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80", "date": "2025-08-15"},
                {"url": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", "date": "2025-09-15"}
            ]
        }
        return Response(tracking_info)
    except UserProfile.DoesNotExist:
        return Response({'error': 'UserProfile not found'}, status=404)
