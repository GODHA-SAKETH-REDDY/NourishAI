import React, { useState } from 'react';


import { useEffect } from 'react';

function Dashboard({ profileId }) {
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!profileId) return;
    const fetchMealPlan = async () => {
      setLoading(true);
      setError('');
      setMealPlan(null);
      try {
        const response = await fetch(`http://localhost:8000/api/generate-meal-plan/${profileId}/`);
        if (response.ok) {
          const data = await response.json();
          setMealPlan(data);
        } else {
          setError('Meal plan not found or error occurred.');
        }
      } catch (err) {
        setError('Failed to fetch meal plan.');
      }
      setLoading(false);
    };
    fetchMealPlan();
  }, [profileId]);

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', textAlign: 'left' }}>
      <h2>Dashboard</h2>
      {profileId ? <p>Profile ID: {profileId}</p> : <p>Submit onboarding to see your meal plan.</p>}
      {loading && <p>Loading meal plan...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {mealPlan && (
        <div style={{ marginTop: 24 }}>
          <h3>Recommended Daily Intake</h3>
          <ul>
            <li>Calories: {mealPlan.calories}</li>
            <li>Protein: {mealPlan.protein_g}g</li>
            <li>Carbs: {mealPlan.carbs_g}g</li>
            <li>Fats: {mealPlan.fats_g}g</li>
          </ul>
          <h3>Meal Plan</h3>
          <ul>
            <li><b>Breakfast:</b> {mealPlan.meals.breakfast.join(', ')}</li>
            <li><b>Lunch:</b> {mealPlan.meals.lunch.join(', ')}</li>
            <li><b>Dinner:</b> {mealPlan.meals.dinner.join(', ')}</li>
            <li><b>Snacks:</b> {mealPlan.meals.snacks.join(', ')}</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
