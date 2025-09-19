import React, { useState } from "react";
import './Onboarding.css';

const initialState = {
  age: '',
  gender: '',
  height: '',
  weight: '',
  goal: '',
  targetWeight: '',
  activity: '',
  dietaryStyle: '',
  cuisines: [],
  allergies: [],
  otherAllergy: '',
};

const cuisineOptions = [
  'North Indian', 'South Indian', 'Italian', 'Mexican', 'Continental', 'Asian (Chinese, Thai, etc.)'
];
const allergyOptions = [
  'Lactose Intolerant', 'Gluten-Free', 'Nut Allergy', 'Shellfish Allergy'
];
const dietaryOptions = [
  'Omnivore', 'Vegetarian', 'Eggetarian', 'Vegan', 'Pescatarian'
];
const activityOptions = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise, desk job' },
  { value: 'light', label: 'Lightly Active', desc: 'Light exercise/sports 1-3 days/week' },
  { value: 'moderate', label: 'Moderately Active', desc: 'Moderate exercise/sports 3-5 days/week' },
  { value: 'very', label: 'Very Active', desc: 'Hard exercise/sports 6-7 days a week' },
];
const goalOptions = [
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'maintain', label: 'Maintain Current Weight' },
  { value: 'general_health', label: 'Improve General Health' },
  { value: 'condition', label: 'Manage a Health Condition' },
];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [dynamicText, setDynamicText] = useState('');

  // Step navigation
  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);

  // Handlers
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm(f => ({ ...f, [name]: checked ? [...f[name], value] : f[name].filter(v => v !== value) }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };
  const handleCuisineToggle = cuisine => {
    setForm(f => ({ ...f, cuisines: f.cuisines.includes(cuisine) ? f.cuisines.filter(c => c !== cuisine) : [...f.cuisines, cuisine] }));
  };
  const handleAllergyToggle = allergy => {
    setForm(f => ({ ...f, allergies: f.allergies.includes(allergy) ? f.allergies.filter(a => a !== allergy) : [...f.allergies, allergy] }));
  };

  // Step 7: Simulate loading and redirect
  React.useEffect(() => {
    if (step === 7 && loading) {
      const messages = [
        'Calculating your Basal Metabolic Rate...',
        'Adjusting for your activity level...',
        `Selecting delicious ${form.cuisines[0] || 'healthy'} recipes...`,
        'Building your personalized grocery list...'
      ];
      let i = 0;
      setDynamicText(messages[0]);
      const interval = setInterval(() => {
        i++;
        if (i < messages.length) setDynamicText(messages[i]);
        else {
          clearInterval(interval);
          setTimeout(() => {
            setLoading(false);
            if (onComplete) onComplete();
          }, 1200);
        }
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [step, loading, form.cuisines, onComplete]);

  // When loading finishes, redirect to Meal Plans
  React.useEffect(() => {
    if (step === 7 && !loading && onComplete) {
      onComplete('mealplans');
    }
  }, [step, loading, onComplete]);

  // Step content
  return (
    <div className="onboarding-flow">
      {step === 1 && (
        <div className="onboarding-step onboarding-welcome">
          <h1>Welcome! Your journey to smarter, healthier eating starts now.</h1>
          <p>Let's create a personalized nutrition plan that adapts to your body, goals, and tastes. No more guesswork.</p>
          {/* You can add a background image with CSS for .onboarding-welcome */}
          <button className="main-cta main-cta-primary" onClick={next}>Let's Get Started</button>
        </div>
      )}
      {step === 2 && (
        <div className="onboarding-step onboarding-basics">
          <h2>Let's start with the basics.</h2>
          <div className="onboarding-fields">
            <label>Age <input type="number" name="age" value={form.age} onChange={handleChange} min="10" max="100" /></label>
            <label>Gender
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Prefer not to say</option>
              </select>
            </label>
            <label>Height (cm) <input type="number" name="height" value={form.height} onChange={handleChange} min="100" max="250" /></label>
            <label>Current Weight (kg) <input type="number" name="weight" value={form.weight} onChange={handleChange} min="30" max="250" /></label>
            <span className="onboarding-tooltip">Why do we need this? <span className="onboarding-tooltip-text">This helps us calculate your unique metabolic rate to set accurate calorie goals.</span></span>
          </div>
          <div className="onboarding-nav">
            <button onClick={back}>Back</button>
            <button className="main-cta main-cta-primary" onClick={next} disabled={!form.age || !form.gender || !form.height || !form.weight}>Next</button>
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="onboarding-step onboarding-goal">
          <h2>What is your primary health goal?</h2>
          <div className="onboarding-goal-options">
            {goalOptions.map(opt => (
              <div key={opt.value} className={`onboarding-goal-card${form.goal === opt.value ? ' selected' : ''}`} onClick={() => setForm(f => ({ ...f, goal: opt.value }))}>
                {opt.label}
              </div>
            ))}
          </div>
          {(form.goal === 'weight_loss' || form.goal === 'muscle_gain') && (
            <label>Target Weight (kg) <input type="number" name="targetWeight" value={form.targetWeight} onChange={handleChange} min="30" max="250" /></label>
          )}
          <div className="onboarding-nav">
            <button onClick={back}>Back</button>
            <button className="main-cta main-cta-primary" onClick={next} disabled={!form.goal || ((form.goal === 'weight_loss' || form.goal === 'muscle_gain') && !form.targetWeight)}>Next</button>
          </div>
        </div>
      )}
      {step === 4 && (
        <div className="onboarding-step onboarding-activity">
          <h2>How active are you on a typical day?</h2>
          <div className="onboarding-activity-options">
            {activityOptions.map(opt => (
              <div key={opt.value} className={`onboarding-activity-card${form.activity === opt.value ? ' selected' : ''}`} onClick={() => setForm(f => ({ ...f, activity: opt.value }))}>
                <div className="onboarding-activity-label">{opt.label}</div>
                <div className="onboarding-activity-desc">{opt.desc}</div>
              </div>
            ))}
          </div>
          <div className="onboarding-nav">
            <button onClick={back}>Back</button>
            <button className="main-cta main-cta-primary" onClick={next} disabled={!form.activity}>Next</button>
          </div>
        </div>
      )}
      {step === 5 && (
        <div className="onboarding-step onboarding-dietary">
          <h2>How do you prefer to eat?</h2>
          <div className="onboarding-dietary-options">
            {dietaryOptions.map(opt => (
              <div key={opt} className={`onboarding-dietary-card${form.dietaryStyle === opt ? ' selected' : ''}`} onClick={() => setForm(f => ({ ...f, dietaryStyle: opt }))}>
                {opt}
              </div>
            ))}
          </div>
          <div className="onboarding-nav">
            <button onClick={back}>Back</button>
            <button className="main-cta main-cta-primary" onClick={next} disabled={!form.dietaryStyle}>Next</button>
          </div>
        </div>
      )}
      {step === 6 && (
        <div className="onboarding-step onboarding-cuisines">
          <h2>What cuisines do you enjoy?</h2>
          <div className="onboarding-cuisine-options">
            {cuisineOptions.map(opt => (
              <label key={opt} className={`onboarding-cuisine-card${form.cuisines.includes(opt) ? ' selected' : ''}`}>
                <input type="checkbox" checked={form.cuisines.includes(opt)} onChange={() => handleCuisineToggle(opt)} />
                {opt}
              </label>
            ))}
          </div>
          <h3>Do you have any allergies or dietary restrictions?</h3>
          <div className="onboarding-allergy-options">
            {allergyOptions.map(opt => (
              <label key={opt} className={`onboarding-allergy-card${form.allergies.includes(opt) ? ' selected' : ''}`}>
                <input type="checkbox" checked={form.allergies.includes(opt)} onChange={() => handleAllergyToggle(opt)} />
                {opt}
              </label>
            ))}
            <label className="onboarding-allergy-card">
              <input type="text" placeholder="Other (please specify)" value={form.otherAllergy} onChange={e => setForm(f => ({ ...f, otherAllergy: e.target.value }))} />
            </label>
          </div>
          <div className="onboarding-nav">
            <button onClick={back}>Back</button>
            <button className="main-cta main-cta-primary" onClick={() => { setLoading(true); next(); }} disabled={form.cuisines.length === 0}>Next</button>
          </div>
        </div>
      )}
      {step === 7 && (
        <div className="onboarding-step onboarding-final">
          <h2>Crafting your perfect plan...</h2>
          <div className="onboarding-loading">
            <div className="onboarding-spinner"></div>
            <div className="onboarding-dynamic-text">{dynamicText}</div>
          </div>
        </div>
      )}
    </div>
  );
}
