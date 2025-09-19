# Ensure models is imported for all model classes
from django.db import models
# FoodLog model for food logging (placed at end for import order)

class FoodLog(models.Model):
	user_profile = models.ForeignKey('UserProfile', on_delete=models.CASCADE)
	recipe = models.ForeignKey('Recipe', on_delete=models.SET_NULL, null=True, blank=True)
	custom_food = models.CharField(max_length=200, blank=True)
	date = models.DateField()
	meal_type = models.CharField(max_length=20, choices=[('breakfast','Breakfast'),('lunch','Lunch'),('dinner','Dinner'),('snack','Snack')])
	calories = models.FloatField(null=True, blank=True)
	protein = models.FloatField(null=True, blank=True)
	carbs = models.FloatField(null=True, blank=True)
	fats = models.FloatField(null=True, blank=True)

	def __str__(self):
		if self.recipe:
			return f"{self.user_profile} - {self.recipe.name} ({self.meal_type}) on {self.date}"
		return f"{self.user_profile} - {self.custom_food} ({self.meal_type}) on {self.date}"

from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
	age = models.PositiveIntegerField()
	gender = models.CharField(max_length=10)
	height_cm = models.FloatField()
	weight_kg = models.FloatField()
	activity_level = models.CharField(max_length=30)
	dietary_preferences = models.CharField(max_length=100, blank=True)
	restrictions_allergies = models.CharField(max_length=200, blank=True)
	health_data = models.TextField(blank=True)
	cuisine_preferences = models.CharField(max_length=100, blank=True)
	budget = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
	time_constraints = models.CharField(max_length=100, blank=True)
	goals = models.CharField(max_length=100)

	def __str__(self):
		if self.user:
			return f"{self.user.username} Profile"
		return "Anonymous Profile"

class Recipe(models.Model):
	name = models.CharField(max_length=100)
	description = models.TextField()
	ingredients = models.TextField()
	instructions = models.TextField()
	cuisine = models.CharField(max_length=50, blank=True)
	prep_time = models.PositiveIntegerField(help_text="Preparation time in minutes")
	calories = models.PositiveIntegerField()
	protein = models.FloatField()
	carbs = models.FloatField()
	fats = models.FloatField()

	def __str__(self):
		return self.name

class MealPlan(models.Model):
	user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
	date = models.DateField()
	breakfast = models.ManyToManyField(Recipe, related_name='breakfast_meals')
	lunch = models.ManyToManyField(Recipe, related_name='lunch_meals')
	dinner = models.ManyToManyField(Recipe, related_name='dinner_meals')
	snacks = models.ManyToManyField(Recipe, related_name='snack_meals')

	def __str__(self):
		return f"Meal Plan for {self.user_profile.user.username} on {self.date}"

class Feedback(models.Model):
	user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
	meal_plan = models.ForeignKey(MealPlan, on_delete=models.CASCADE)
	feedback_text = models.TextField()
	rating = models.PositiveIntegerField(default=5)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"Feedback by {self.user_profile.user.username} on {self.meal_plan.date}"
