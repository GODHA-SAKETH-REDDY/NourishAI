// Update user profile
export async function updateUserProfile(userId, data) {
  const res = await fetch(`${API_BASE}/api/userprofile/${userId}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update user profile');
  return res.json();
}
// API utility for frontend-backend communication
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

export async function fetchUserProfile(userId) {
  const res = await fetch(`${API_BASE}/api/userprofile/${userId}/`);
  if (!res.ok) throw new Error('Failed to fetch user profile');
  return res.json();
}

export async function fetchMealPlan(userId) {
  const res = await fetch(`${API_BASE}/api/generate-meal-plan/${userId}/`);
  if (!res.ok) throw new Error('Failed to fetch meal plan');
  return res.json();
}

export async function fetchRecipes(query) {
  const res = await fetch(`${API_BASE}/api/recipes/?search=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to fetch recipes');
  return res.json();
}

export async function fetchRecipeDetail(recipeId) {
  const res = await fetch(`${API_BASE}/api/recipes/${recipeId}/`);
  if (!res.ok) throw new Error('Failed to fetch recipe detail');
  return res.json();
}

// New code block
const BASE_URL = "http://127.0.0.1:8000/api";

export const fetchData = async () => {
    const response = await fetch(`${BASE_URL}/some-endpoint/`);
    const data = await response.json();
    return data;
};

// Add more API functions as needed
