from django.urls import path
from . import views
from .gemini_api import gemini_chat
from .views import (
    RecipeListView,
    RecipeDetailView,
    FoodLogListCreateView,
    FoodLogRetrieveUpdateDestroyView,
    WeightLogListCreateView,
    WeightLogRetrieveUpdateDestroyView,
    MeasurementLogListCreateView,
    MeasurementLogRetrieveUpdateDestroyView,
    CommunityPostListCreateView,
    CommunityPostRetrieveUpdateDestroyView,
    CommunityCommentListCreateView,
    CommunityGroupListView,
    CommunityChallengeListView,
)
from rest_framework_simplejwt.views import TokenRefreshView
from .custom_token_view import EmailTokenObtainPairView

urlpatterns = [
    path('register/', views.register, name='register'),
    path('gemini-chat/', gemini_chat, name='gemini_chat'),
    path('onboarding/', views.onboarding, name='onboarding'),
    path('generate-meal-plan/<int:profile_id>/', views.generate_meal_plan, name='generate_meal_plan'),
    path('token/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('recipes/', RecipeListView.as_view(), name='recipe-list'),
    path('recipes/<int:pk>/', RecipeDetailView.as_view(), name='recipe-detail'),
    path('foodlogs/', FoodLogListCreateView.as_view(), name='foodlog-list-create'),
    path('foodlogs/<int:pk>/', FoodLogRetrieveUpdateDestroyView.as_view(), name='foodlog-detail'),
    path('weightlogs/', WeightLogListCreateView.as_view(), name='weightlog-list-create'),
    path('weightlogs/<int:pk>/', WeightLogRetrieveUpdateDestroyView.as_view(), name='weightlog-detail'),
    path('measurements/', MeasurementLogListCreateView.as_view(), name='measurement-list-create'),
    path('measurements/<int:pk>/', MeasurementLogRetrieveUpdateDestroyView.as_view(), name='measurement-detail'),
    path('userprofile/<int:pk>/', views.userprofile_detail, name='userprofile-detail'),
    path('user/tracking/<int:pk>/', views.tracking_data, name='tracking-data'),
    # Community endpoints
    path('community/posts/', CommunityPostListCreateView.as_view(), name='community-posts'),
    path('community/posts/<int:pk>/', CommunityPostRetrieveUpdateDestroyView.as_view(), name='community-post-detail'),
    path('community/posts/<int:pk>/like-toggle/', views.community_toggle_like, name='community-like-toggle'),
    path('community/posts/<int:post_pk>/comments/', CommunityCommentListCreateView.as_view(), name='community-comments'),
    path('community/groups/', CommunityGroupListView.as_view(), name='community-groups'),
    path('community/challenges/', CommunityChallengeListView.as_view(), name='community-challenges'),
    path('me/userprofile/', views.me_userprofile, name='me-userprofile'),
]
