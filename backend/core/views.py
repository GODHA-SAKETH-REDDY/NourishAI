from .models import UserProfile, Recipe, FoodLog, WeightLog, MeasurementLog, CommunityPost, CommunityComment
from .serializers import (
	RecipeSerializer,
	FoodLogSerializer,
	UserProfileSerializer,
	WeightLogSerializer,
	MeasurementLogSerializer,
	CommunityPostSerializer,
	CommunityCommentSerializer,
)
from rest_framework import generics, filters
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
import math
import random
from django.utils import timezone
from django.db.models import Count
from rest_framework.pagination import PageNumberPagination
from .serializers import CommunityGroupSerializer, CommunityChallengeSerializer
from .models import CommunityGroup, CommunityChallenge

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

# FoodLog API views
class FoodLogListCreateView(generics.ListCreateAPIView):
	serializer_class = FoodLogSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		# Only return logs for the authenticated user's profile
		return FoodLog.objects.filter(user_profile__user=self.request.user).order_by('-date')

	def perform_create(self, serializer):
		# Attach or create the user's profile automatically to avoid DoesNotExist
		user_profile, _ = UserProfile.objects.get_or_create(user=self.request.user, defaults={
			# provide minimal defaults if profile did not exist
			'age': 25,
			'gender': 'male',
			'height_cm': 170,
			'weight_kg': 70,
			'activity_level': 'sedentary',
			'goals': 'general health',
		})
		serializer.save(user_profile=user_profile)


class FoodLogRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
	serializer_class = FoodLogSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		return FoodLog.objects.filter(user_profile__user=self.request.user)


# Weight logs
class WeightLogListCreateView(generics.ListCreateAPIView):
	serializer_class = WeightLogSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		return WeightLog.objects.filter(user_profile__user=self.request.user).order_by('date')

	def perform_create(self, serializer):
		user_profile = UserProfile.objects.get(user=self.request.user)
		serializer.save(user_profile=user_profile)


class WeightLogRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
	serializer_class = WeightLogSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		return WeightLog.objects.filter(user_profile__user=self.request.user)


# Measurement logs
class MeasurementLogListCreateView(generics.ListCreateAPIView):
	serializer_class = MeasurementLogSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		return MeasurementLog.objects.filter(user_profile__user=self.request.user).order_by('date')

	def perform_create(self, serializer):
		user_profile = UserProfile.objects.get(user=self.request.user)
		serializer.save(user_profile=user_profile)


class MeasurementLogRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
	serializer_class = MeasurementLogSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		return MeasurementLog.objects.filter(user_profile__user=self.request.user)


# --- Community feed views ---
class PostPagination(PageNumberPagination):
	page_size = 10


class CommunityPostListCreateView(generics.ListCreateAPIView):
	serializer_class = CommunityPostSerializer
	permission_classes = [IsAuthenticated]
	pagination_class = PostPagination

	def get_queryset(self):
		qs = CommunityPost.objects.all().select_related('user_profile__user').prefetch_related('comments__user_profile__user', 'likes')
		# Annotate with a non-conflicting name to avoid clashing with the model @property `likes_count`
		qs = qs.annotate(num_likes=Count('likes'))
		topic = self.request.query_params.get('topic')
		if topic and topic not in ["Trending", "Newest"]:
			qs = qs.filter(topic=topic)
		# For "Newest" or default, ordering already by -created_at; for "Trending" we could order by likes
		sort = self.request.query_params.get('sort')
		if sort == 'trending':
			# Order by the annotated count; serializer will still expose `likes_count` via the model property
			qs = qs.order_by('-num_likes', '-created_at')
		return qs

	def get_serializer_context(self):
		ctx = super().get_serializer_context()
		ctx['request'] = self.request
		return ctx

	def perform_create(self, serializer):
		user_profile, _ = UserProfile.objects.get_or_create(user=self.request.user, defaults={
			'age': 25,
			'gender': 'male',
			'height_cm': 170,
			'weight_kg': 70,
			'activity_level': 'sedentary',
			'goals': 'general health',
		})
		serializer.save(user_profile=user_profile)


class CommunityPostRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
	serializer_class = CommunityPostSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		return CommunityPost.objects.all().select_related('user_profile__user').prefetch_related('comments__user_profile__user', 'likes')

	def get_serializer_context(self):
		ctx = super().get_serializer_context()
		ctx['request'] = self.request
		return ctx


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def community_toggle_like(request, pk):
	try:
		post = CommunityPost.objects.get(pk=pk)
	except CommunityPost.DoesNotExist:
		return Response({'error': 'Not found'}, status=404)
	user_profile, _ = UserProfile.objects.get_or_create(user=request.user, defaults={
		'age': 25,
		'gender': 'male',
		'height_cm': 170,
		'weight_kg': 70,
		'activity_level': 'sedentary',
		'goals': 'general health',
	})
	if post.likes.filter(id=user_profile.id).exists():
		post.likes.remove(user_profile)
		liked = False
	else:
		post.likes.add(user_profile)
		liked = True
	serializer = CommunityPostSerializer(post, context={'request': request})
	return Response({**serializer.data, 'liked': liked})


class CommunityCommentListCreateView(generics.ListCreateAPIView):
	serializer_class = CommunityCommentSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		post_id = self.kwargs['post_pk']
		return CommunityComment.objects.filter(post_id=post_id).select_related('user_profile__user')

	def perform_create(self, serializer):
		post_id = self.kwargs['post_pk']
		try:
			post = CommunityPost.objects.get(pk=post_id)
		except CommunityPost.DoesNotExist:
			from django.http import Http404
			raise Http404("Post not found")
		user_profile, _ = UserProfile.objects.get_or_create(user=self.request.user, defaults={
			'age': 25,
			'gender': 'male',
			'height_cm': 170,
			'weight_kg': 70,
			'activity_level': 'sedentary',
			'goals': 'general health',
		})
		serializer.save(post=post, user_profile=user_profile)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_userprofile(request):
	try:
		up = UserProfile.objects.get(user=request.user)
	except UserProfile.DoesNotExist:
		up = UserProfile.objects.create(user=request.user, age=25, gender='male', height_cm=170, weight_kg=70, activity_level='sedentary', goals='general health')
	return Response(UserProfileSerializer(up).data)


class CommunityGroupListView(generics.ListAPIView):
	queryset = CommunityGroup.objects.all().order_by('name')
	serializer_class = CommunityGroupSerializer
	permission_classes = [AllowAny]


class CommunityChallengeListView(generics.ListAPIView):
	queryset = CommunityChallenge.objects.all().prefetch_related('leaderboard__user_profile__user')
	serializer_class = CommunityChallengeSerializer
	permission_classes = [AllowAny]

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

@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([AllowAny])
def userprofile_detail(request, pk):
	"""
	Retrieve or update a user profile.
	- GET:    returns the profile data
	- PUT:    full update of the profile
	- PATCH:  partial update of the profile
	"""
	try:
		profile = UserProfile.objects.get(pk=pk)
	except UserProfile.DoesNotExist:
		return Response({'error': 'UserProfile not found'}, status=404)

	if request.method in ['PUT', 'PATCH']:
		serializer = UserProfileSerializer(
			profile,
			data=request.data,
			partial=(request.method == 'PATCH')
		)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

	serializer = UserProfileSerializer(profile)
	return Response(serializer.data)

@api_view(['GET'])
def tracking_data(request, pk):
	"""
	Legacy endpoint kept for compatibility; returns user's FoodLogs.
	"""
	try:
		profile = UserProfile.objects.get(pk=pk)
		food_logs = FoodLog.objects.filter(user_profile__user=profile.user)
		serializer = FoodLogSerializer(food_logs, many=True)
		return Response(serializer.data)
	except UserProfile.DoesNotExist:
		return Response(status=status.HTTP_404_NOT_FOUND)

