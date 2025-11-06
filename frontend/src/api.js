import { API_BASE } from './config';

// Update user profile
export async function updateUserProfile(userId, data) {
  const res = await fetch(`${API_BASE}/api/userprofile/${userId}/`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update user profile');
  return res.json();
}
// API utility for frontend-backend communication
// API_BASE comes from config.js; when empty, requests are same-origin

function authHeaders() {
  const token = localStorage.getItem('access');
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
}

function hasAccessToken() {
  return !!localStorage.getItem('access');
}

async function fetchWithAuth(input, init = {}) {
  // attach auth headers
  const headers = { ...(init.headers || {}), ...authHeaders() };
  let res = await fetch(input, { ...init, headers });
  if (res.status !== 401) return res;
  // try refresh once
  const refresh = localStorage.getItem('refresh');
  if (!refresh) return res;
  try {
    const r = await fetch(`${API_BASE}/api/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh })
    });
    if (!r.ok) return res;
    const data = await r.json();
    if (data?.access) {
      localStorage.setItem('access', data.access);
      const retryHeaders = { ...(init.headers || {}), ...authHeaders() };
      res = await fetch(input, { ...init, headers: retryHeaders });
    }
    return res;
  } catch {
    return res;
  }
}

export async function fetchUserProfile(userId) {
  const res = await fetchWithAuth(`${API_BASE}/api/userprofile/${userId}/`);
  if (!res.ok) throw new Error('Failed to fetch user profile');
  return res.json();
}

// Submit onboarding selections to create or update a UserProfile
export async function submitOnboarding(form) {
  // Map onboarding form to backend fields
  const mapActivity = (v) => {
    if (!v) return 'sedentary';
    const t = v.toLowerCase();
    if (t === 'light') return 'lightly active';
    if (t === 'moderate') return 'moderately active';
    if (t === 'very') return 'very active';
    return 'sedentary';
  };
  const mapGoal = (v) => {
    switch (v) {
      case 'weight_loss': return 'weight loss';
      case 'muscle_gain': return 'muscle gain';
      case 'maintain': return 'maintenance';
      case 'general_health': return 'general health';
      case 'condition': return 'manage condition';
      default: return 'general health';
    }
  };

  const payload = {
    age: form.age ? Number(form.age) : null,
    gender: form.gender || '',
    height_cm: form.height ? Number(form.height) : null,
    weight_kg: form.weight ? Number(form.weight) : null,
    activity_level: mapActivity(form.activity),
    goals: mapGoal(form.goal),
    dietary_preferences: form.dietaryStyle || '',
    restrictions_allergies: [
      ...(Array.isArray(form.allergies) ? form.allergies : []),
      ...(form.otherAllergy ? [form.otherAllergy] : []),
    ].filter(Boolean).join(', '),
    cuisine_preferences: (Array.isArray(form.cuisines) ? form.cuisines : []).join(', '),
    health_data: form.targetWeight ? `Target Weight: ${form.targetWeight} kg` : '',
  };

  // If a profile exists, update it; otherwise create one
  const existingId = localStorage.getItem('userId');
  if (existingId) {
    const res = await fetch(`${API_BASE}/api/userprofile/${existingId}/`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update profile from onboarding');
    return res.json();
  }

  const res = await fetch(`${API_BASE}/api/onboarding/`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to submit onboarding');
  const data = await res.json();
  if (data?.id != null) {
    localStorage.setItem('userId', String(data.id));
  }
  return data;
}

export async function fetchMealPlan(userId) {
  const res = await fetchWithAuth(`${API_BASE}/api/generate-meal-plan/${userId}/`);
  if (!res.ok) throw new Error('Failed to fetch meal plan');
  return res.json();
}

export async function fetchRecipes(query) {
  const res = await fetchWithAuth(`${API_BASE}/api/recipes/?search=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to fetch recipes');
  return res.json();
}

export async function fetchRecipeDetail(recipeId) {
  const res = await fetchWithAuth(`${API_BASE}/api/recipes/${recipeId}/`);
  if (!res.ok) throw new Error('Failed to fetch recipe detail');
  return res.json();
}

// FoodLog APIs
export async function createFoodLog(payload) {
  const res = await fetchWithAuth(`${API_BASE}/api/foodlogs/`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create food log');
  return res.json();
}

export async function fetchFoodLogs() {
  if (!hasAccessToken()) return [];
  const res = await fetchWithAuth(`${API_BASE}/api/foodlogs/`);
  if (!res.ok) throw new Error('Failed to fetch food logs');
  return res.json();
}

export const fetchData = async () => {
  const response = await fetch(`${API_BASE}/api/some-endpoint/`);
    const data = await response.json();
    return data;
};

// Add more API functions as needed

// Weight logs
export async function fetchWeightLogs() {
  if (!hasAccessToken()) return [];
  const res = await fetchWithAuth(`${API_BASE}/api/weightlogs/`);
  if (!res.ok) throw new Error('Failed to fetch weight logs');
  return res.json();
}

export async function createWeightLog(payload) {
  if (!hasAccessToken()) throw new Error('Not authenticated');
  const res = await fetchWithAuth(`${API_BASE}/api/weightlogs/`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create weight log');
  return res.json();
}

// Measurement logs
export async function fetchMeasurementLogs() {
  if (!hasAccessToken()) return [];
  const res = await fetchWithAuth(`${API_BASE}/api/measurements/`);
  if (!res.ok) throw new Error('Failed to fetch measurement logs');
  return res.json();
}

export async function createMeasurementLog(payload) {
  if (!hasAccessToken()) throw new Error('Not authenticated');
  const res = await fetchWithAuth(`${API_BASE}/api/measurements/`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create measurement log');
  return res.json();
}

// --- Community APIs ---
export async function fetchCommunityPosts({ filter, sort } = {}) {
  if (!hasAccessToken()) return [];
  const params = new URLSearchParams();
  if (filter) params.set('topic', filter);
  if (sort) params.set('sort', sort);
  const res = await fetchWithAuth(`${API_BASE}/api/community/posts/?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch community posts');
  const data = await res.json();
  // Unwrap pagination if present
  return Array.isArray(data) ? data : (Array.isArray(data?.results) ? data.results : []);
}

export async function createCommunityPost(payload) {
  // payload: { content, image_url?, topic? }
  const res = await fetchWithAuth(`${API_BASE}/api/community/posts/`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create post');
  return res.json();
}

export async function toggleLikePost(postId) {
  const res = await fetchWithAuth(`${API_BASE}/api/community/posts/${postId}/like-toggle/`, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to toggle like');
  return res.json();
}

export async function createCommunityComment(postId, text) {
  const res = await fetchWithAuth(`${API_BASE}/api/community/posts/${postId}/comments/`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error('Failed to post comment');
  return res.json();
}
