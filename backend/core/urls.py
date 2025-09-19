from django.urls import path
from . import views
from .gemini_api import gemini_chat
from .views import RecipeListView, RecipeDetailView, FoodLogListCreateView, FoodLogRetrieveUpdateDestroyView
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
    path('userprofile/<int:pk>/', views.userprofile_detail, name='userprofile-detail'),
]
