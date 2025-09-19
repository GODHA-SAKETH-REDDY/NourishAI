import React, { useState } from 'react';

function OnboardingForm({ onProfileCreated }) {
  const [form, setForm] = useState({
    age: '',
    gender: '',
    height_cm: '',
    weight_kg: '',
    goals: '',
    activity_level: '',
    dietary_preferences: '',
    restrictions_allergies: '',
    health_data: '',
    cuisine_preferences: '',
    budget: '',
    time_constraints: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/onboarding/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      if (response.ok) {
        const data = await response.json();
        alert('Onboarding data submitted successfully!');
        if (onProfileCreated && data.id) {
          onProfileCreated(data.id);
        }
        setForm({
          age: '', gender: '', height_cm: '', weight_kg: '', goals: '', activity_level: '', dietary_preferences: '', restrictions_allergies: '', health_data: '', cuisine_preferences: '', budget: '', time_constraints: ''
        });
      } else {
        const errorData = await response.json();
        alert('Submission failed: ' + JSON.stringify(errorData));
      }
    } catch (error) {
      alert('Error submitting form: ' + error);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: '0 auto', textAlign: 'left' }}>
      <h3>Onboarding Questionnaire</h3>
      <label>Age:<input type="number" name="age" value={form.age} onChange={handleChange} required /></label><br />
      <label>Gender:<input type="text" name="gender" value={form.gender} onChange={handleChange} required /></label><br />
      <label>Height (cm):<input type="number" name="height_cm" value={form.height_cm} onChange={handleChange} required /></label><br />
      <label>Weight (kg):<input type="number" name="weight_kg" value={form.weight_kg} onChange={handleChange} required /></label><br />
      <label>Goals:<input type="text" name="goals" value={form.goals} onChange={handleChange} required /></label><br />
      <label>Activity Level:<input type="text" name="activity_level" value={form.activity_level} onChange={handleChange} required /></label><br />
      <label>Dietary Preferences:<input type="text" name="dietary_preferences" value={form.dietary_preferences} onChange={handleChange} /></label><br />
      <label>Restrictions & Allergies:<input type="text" name="restrictions_allergies" value={form.restrictions_allergies} onChange={handleChange} /></label><br />
      <label>Health Data:<input type="text" name="health_data" value={form.health_data} onChange={handleChange} /></label><br />
      <label>Cuisine Preferences:<input type="text" name="cuisine_preferences" value={form.cuisine_preferences} onChange={handleChange} /></label><br />
      <label>Budget:<input type="number" name="budget" value={form.budget} onChange={handleChange} /></label><br />
      <label>Time Constraints:<input type="text" name="time_constraints" value={form.time_constraints} onChange={handleChange} /></label><br />
      <button type="submit">Submit</button>
    </form>
  );
}

export default OnboardingForm;
