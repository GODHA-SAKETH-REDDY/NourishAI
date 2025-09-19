import React, { useState, useEffect } from 'react';

function RecipeBrowser() {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    fetchRecipes();
    // eslint-disable-next-line
  }, []);

  const fetchRecipes = async (query = '') => {
    setLoading(true);
    setError('');
    setSelectedRecipe(null);
    let url = 'http://localhost:8000/api/recipes/';
    if (query) {
      url += `?search=${encodeURIComponent(query)}`;
    }
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setRecipes(data);
      } else {
        setError('Failed to fetch recipes.');
      }
    } catch (err) {
      setError('Failed to fetch recipes.');
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    fetchRecipes(e.target.value);
  };

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', background: '#fff8', borderRadius: 16, padding: 24 }}>
      <h2>Browse Recipes</h2>
      <input
        type="text"
        placeholder="Search by name or cuisine..."
        value={search}
        onChange={handleSearch}
        style={{ width: '100%', padding: 8, marginBottom: 16, borderRadius: 8, border: '1px solid #ccc' }}
      />
      {loading && <p>Loading recipes...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && recipes.length === 0 && <p>No recipes found.</p>}
      {!loading && !error && recipes.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {recipes.map((recipe) => (
            <li key={recipe.id} style={{ marginBottom: 16, cursor: 'pointer' }} onClick={() => setSelectedRecipe(recipe)}>
              <div style={{ background: '#fff', borderRadius: 8, padding: 12, boxShadow: '0 2px 8px #0001' }}>
                <strong>{recipe.name}</strong> <span style={{ color: '#888' }}>({recipe.cuisine})</span>
                <div style={{ fontSize: 13, color: '#666' }}>{recipe.description}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {selectedRecipe && (
        <div style={{ marginTop: 24, background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 2px 8px #0002' }}>
          <h3>{selectedRecipe.name}</h3>
          <p><b>Cuisine:</b> {selectedRecipe.cuisine}</p>
          <p><b>Description:</b> {selectedRecipe.description}</p>
          <p><b>Ingredients:</b> {selectedRecipe.ingredients}</p>
          <p><b>Instructions:</b> {selectedRecipe.instructions}</p>
          <p><b>Prep Time:</b> {selectedRecipe.prep_time} min</p>
          <p><b>Calories:</b> {selectedRecipe.calories} | <b>Protein:</b> {selectedRecipe.protein}g | <b>Carbs:</b> {selectedRecipe.carbs}g | <b>Fats:</b> {selectedRecipe.fats}g</p>
          <button onClick={() => setSelectedRecipe(null)} style={{ marginTop: 8, padding: '6px 16px', borderRadius: 6, border: 'none', background: '#ffb366', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Close</button>
        </div>
      )}
    </div>
  );
}

export default RecipeBrowser;
