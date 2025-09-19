import React, { useState, useEffect } from 'react';

function FoodLog() {
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState({
    date: '',
    meal_type: 'breakfast',
    custom_food: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get JWT token from localStorage
  const token = localStorage.getItem('access');

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8000/api/foodlogs/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      } else {
        setError('Failed to fetch food logs.');
      }
    } catch (err) {
      setError('Failed to fetch food logs.');
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Ensure date is in YYYY-MM-DD format
      let date = form.date;
      if (date && date.includes('-')) {
        const parts = date.split('-');
        if (parts[0].length === 2) {
          // If format is DD-MM-YYYY, convert to YYYY-MM-DD
          date = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }
      const response = await fetch('http://localhost:8000/api/foodlogs/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          date,
          calories: form.calories ? parseFloat(form.calories) : null,
          protein: form.protein ? parseFloat(form.protein) : null,
          carbs: form.carbs ? parseFloat(form.carbs) : null,
          fats: form.fats ? parseFloat(form.fats) : null,
        }),
      });
      if (response.ok) {
        setSuccess('Food log added!');
        setForm({
          date: '',
          meal_type: 'breakfast',
          custom_food: '',
          calories: '',
          protein: '',
          carbs: '',
          fats: '',
        });
        fetchLogs();
      } else {
        let msg = 'Failed to add food log.';
        try {
          const data = await response.json();
          if (data && data.detail) msg = data.detail;
          else if (typeof data === 'object') msg = JSON.stringify(data);
        } catch {}
        setError(msg);
      }
    } catch (err) {
      setError('Failed to add food log.');
    }
    setLoading(false);
  };

  return (
    <div className="card fade-in" style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h2>Food Logging</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 8 }}>
          <label>Date: <input type="date" name="date" value={form.date} onChange={handleChange} required /></label>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Meal Type: 
            <select name="meal_type" value={form.meal_type} onChange={handleChange}>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </label>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Custom Food: <input type="text" name="custom_food" value={form.custom_food} onChange={handleChange} placeholder="e.g. Apple" /></label>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Calories: <input type="number" name="calories" value={form.calories} onChange={handleChange} /></label>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Protein (g): <input type="number" name="protein" value={form.protein} onChange={handleChange} /></label>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Carbs (g): <input type="number" name="carbs" value={form.carbs} onChange={handleChange} /></label>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Fats (g): <input type="number" name="fats" value={form.fats} onChange={handleChange} /></label>
        </div>
        <button type="submit" disabled={loading} style={{ marginTop: 8 }}>Add Food Log</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <h3>Food Log History</h3>
      {loading && <p>Loading...</p>}
      {!loading && logs.length === 0 && <p>No food logs found.</p>}
      <ul style={{ padding: 0, listStyle: 'none' }}>
        {logs.map(log => (
          <li key={log.id} style={{ background: '#fff', borderRadius: 8, marginBottom: 8, padding: 12, boxShadow: '0 2px 8px #0001' }}>
            <b>{log.date}</b> - {log.meal_type} - {log.custom_food || (log.recipe && log.recipe.name)}<br />
            Calories: {log.calories || '-'} | Protein: {log.protein || '-'}g | Carbs: {log.carbs || '-'}g | Fats: {log.fats || '-'}g
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FoodLog;
