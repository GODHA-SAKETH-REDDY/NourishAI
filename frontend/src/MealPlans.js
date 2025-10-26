import React, { useState, useEffect, useRef } from "react";
import './MealPlans.css';
import { fetchMealPlan, fetchUserProfile, createFoodLog } from './api';

const userName = "Alex";
const today = new Date();
const fallbackImg = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80";

export default function MealPlans({ onLogMeal }) {
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRecipe, setShowRecipe] = useState(null);
  const [groceryList, setGroceryList] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const toastTimerRef = useRef(null);

  useEffect(() => {
    // Use the correct UserProfile id (14) for testing
    const userId = '14';
    setLoading(true);
    fetchUserProfile(userId)
      .then(profile => {
        if (!profile.id) throw new Error('No profile id');
        return fetchMealPlan(profile.id);
      })
      .then(data => {
        setMealPlan(data);
        setLoading(false);
      })
      .catch(e => {
        setError('Failed to load meal plan');
        setLoading(false);
      });
  }, []);

  // Helper to show a temporary toast
  const showToast = (message, type = 'success', durationMs = 2500) => {
    // Clear any existing timer first
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ visible: true, message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
      toastTimerRef.current = null;
    }, durationMs);
  };

  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

  if (loading) return <div className="mealplans-dashboard">Loading...</div>;
  if (error) return <div className="mealplans-dashboard">{error}</div>;
  if (!mealPlan) return <div className="mealplans-dashboard">No meal plan data</div>;

  // Group meals by type for display
  const mealTypes = [
    { key: 'breakfast', label: 'Breakfast', icon: '🍳' },
    { key: 'lunch', label: 'Lunch', icon: '🥗' },
    { key: 'dinner', label: 'Dinner', icon: '🍽️' },
    { key: 'snacks', label: 'Snacks', icon: '🍎' },
  ];

  const progress = {
    kcal: mealPlan.calories,
    protein: mealPlan.protein_g,
    carbs: mealPlan.carbs_g,
    fat: mealPlan.fats_g
  };

  return (
    <div className="mealplans-dashboard">
      <div className="mealplans-header">
        <div>
          <div className="mealplans-greeting">Here's Your Plan for Today, {userName}!</div>
          <div className="mealplans-date">{today.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
        <div className="mealplans-goals">
          <span>🔥 {progress.kcal} kcal</span>
          <span>💪 {progress.protein}g</span>
          <span>🍞 {progress.carbs}g</span>
          <span>🥑 {progress.fat}g</span>
        </div>
      </div>

      {/* Grouped meal cards by meal type */}
      {mealTypes.map(({ key, label, icon }) => (
        (mealPlan.meals[key] && mealPlan.meals[key].length > 0) && (
          <div key={key} className="mealplans-meal-group">
            <h2 className="mealplans-meal-group-title">{icon} {label}</h2>
            <div className="mealplans-meals-row">
              {mealPlan.meals[key].map((meal, idx) => (
                <div className="mealplans-meal-card" key={idx}>
                  <img
                    className="mealplans-meal-img"
                    src={fallbackImg}
                    alt={meal.name}
                    onError={e => { e.target.onerror = null; e.target.src = fallbackImg; }}
                  />
                  <div className="mealplans-meal-title" style={{ fontWeight: 700, fontSize: '1.08rem', marginBottom: 0 }}>{meal.name}</div>
                  <div className="mealplans-meal-macros">
                    <span className="mealplans-meal-macro">🔥 {meal.calories} kcal</span>
                    <span className="mealplans-meal-macro">💪 {meal.protein}g</span>
                    <span className="mealplans-meal-macro">🍞 {meal.carbs}g</span>
                    <span className="mealplans-meal-macro">🥑 {meal.fats}g</span>
                  </div>
                  <div className="mealplans-meal-preptime">⏰ {meal.prep_time} mins</div>
                  <div className="mealplans-meal-actions">
                    <button className="mealplans-meal-action-btn primary" onClick={() => setShowRecipe({ ...meal, mealType: key })}>📖 View Recipe</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ))}
      {showRecipe && (
        <div className="mealplans-modal-overlay" onClick={() => setShowRecipe(null)}>
          <div className="mealplans-modal-content" onClick={e => e.stopPropagation()}>
            <h2>{showRecipe.name}</h2>
            <div style={{ display: 'flex', gap: '1.1rem', marginBottom: '1.1rem', fontWeight: 700, fontSize: '1.08rem', color: '#888' }}>
              <span>🔥 {showRecipe.calories} kcal</span>
              <span>💪 {showRecipe.protein}g</span>
              <span>🍞 {showRecipe.carbs}g</span>
              <span>🥑 {showRecipe.fats}g</span>
            </div>
            <h3>Ingredients</h3>
            <ul>
              {(showRecipe.ingredients || '').split('\n').map((ing, i) => <li key={i}>{ing}</li>)}
            </ul>
            <h3>Instructions</h3>
            <ol>
              {(showRecipe.instructions || '').split('\n').map((step, i) => <li key={i}>{step}</li>)}
            </ol>
            <button className="mealplans-modal-content button primary" onClick={async () => {
              try {
                const dateStr = new Date().toISOString().slice(0, 10);
                const meal_type = (showRecipe.mealType === 'snacks') ? 'snack' : showRecipe.mealType;
                // Create backend food log (if authenticated, server attaches user_profile)
                await createFoodLog({
                  recipe_id: showRecipe.id,
                  date: dateStr,
                  meal_type,
                  calories: showRecipe.calories,
                  protein: showRecipe.protein,
                  carbs: showRecipe.carbs,
                  fats: showRecipe.fats,
                });
                showToast('Meal logged to Tracking', 'success');
              } catch (e) {
                // Non-fatal: continue to update UI even if backend fails
                console.warn('Failed to persist food log, showing in UI only:', e);
                showToast('Saved locally. Log in to sync.', 'warning');
              }
              onLogMeal(showRecipe);
              setShowRecipe(null);
            }}>Log Meal</button>
            <button className="mealplans-modal-content button" onClick={() => setShowRecipe(null)}>Close</button>
          </div>
        </div>
      )}
      <button
        className="mealplans-grocery-btn"
        onClick={() => {
          // Aggregate all ingredients from all meals
          const allIngredients = [];
          Object.values(mealPlan.meals).forEach(mealArr => {
            mealArr.forEach(meal => {
              if (meal.ingredients) {
                meal.ingredients.split('\n').forEach(ing => {
                  const trimmed = ing.trim();
                  if (trimmed) allIngredients.push(trimmed);
                });
              }
            });
          });
          // Count unique ingredients
          const ingredientMap = {};
          allIngredients.forEach(ing => {
            ingredientMap[ing] = (ingredientMap[ing] || 0) + 1;
          });
          const list = Object.entries(ingredientMap).map(([ing, count]) =>
            count > 1 ? `${ing} (x${count})` : ing
          );
          setGroceryList(list);
        }}
      >🛒 Generate Grocery List</button>

      {/* Grocery List Modal */}
      {groceryList && (
        <div className="mealplans-modal-overlay" onClick={() => setGroceryList(null)}>
          <div className="mealplans-modal-content" onClick={e => e.stopPropagation()}>
            <h2>Grocery List</h2>
            <ul style={{ textAlign: 'left', maxHeight: 300, overflowY: 'auto' }}>
              {groceryList.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
            <button className="mealplans-modal-content button" onClick={() => setGroceryList(null)}>Close</button>
          </div>
        </div>
      )}
      {toast.visible && (
        <div className={`mealplans-toast ${toast.type}`} role="status" aria-live="polite">
          {toast.message}
        </div>
      )}
    </div>
  );
}
