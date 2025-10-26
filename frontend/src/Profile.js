
import React, { useState, useEffect, useMemo } from "react";
import "./Profile.css";
import { fetchUserProfile, updateUserProfile, fetchWeightLogs, fetchFoodLogs } from "./api";

// Helper to get userId from localStorage or props
function getUserId() {
  return localStorage.getItem("userId") || "1"; // fallback to 1 for demo
}

const activityOptions = [
  "sedentary",
  "lightly active",
  "moderately active",
  "very active",
];

export default function Profile({ onBack }) {
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [weightStats, setWeightStats] = useState({ latest: null, start: null, totalLost: null });
  const [streak, setStreak] = useState(0);
  const [avg7Calories, setAvg7Calories] = useState(null);
  const userId = getUserId();

  useEffect(() => {
    setLoading(true);
    setSaved(false);
    fetchUserProfile(userId)
      .then((data) => {
        setProfile(data);
        // Initialize form with backend-supported fields
        setForm({
          age: data.age ?? "",
          gender: data.gender ?? "",
          height_cm: data.height_cm ?? "",
          weight_kg: data.weight_kg ?? "",
          activity_level: data.activity_level ?? "sedentary",
          goals: data.goals ?? "",
          dietary_preferences: data.dietary_preferences ?? "",
          restrictions_allergies: data.restrictions_allergies ?? "",
          cuisine_preferences: data.cuisine_preferences ?? "",
          health_data: data.health_data ?? "",
          budget: data.budget ?? "",
          time_constraints: data.time_constraints ?? "",
        });
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load profile");
        setLoading(false);
      });

    // Also pull progress data from tracking/reports sources
    (async () => {
      try {
        const [wlogs, flogs] = await Promise.all([
          fetchWeightLogs().catch(() => []),
          fetchFoodLogs().catch(() => []),
        ]);

        // Weight stats
        if (Array.isArray(wlogs) && wlogs.length) {
          const sorted = [...wlogs].sort((a, b) => new Date(a.date) - new Date(b.date));
          const start = sorted[0]?.weight ?? null;
          const latest = sorted[sorted.length - 1]?.weight ?? null;
          const totalLost = (start != null && latest != null) ? +(start - latest).toFixed(1) : null;
          setWeightStats({ latest, start, totalLost });
          // If we have a recent log, reflect it in the Overview weight
          if (latest != null) setForm(f => ({ ...f, weight_kg: f.weight_kg || latest }));
        } else {
          setWeightStats({ latest: null, start: null, totalLost: null });
        }

        // Food log streak and 7-day avg
        const map = new Map();
        if (Array.isArray(flogs)) {
          flogs.forEach(l => {
            const key = (l.date || '').slice(0,10);
            const cur = map.get(key) || 0;
            map.set(key, cur + (Number(l.calories || 0)));
          });
        }
        // Streak: consecutive days ending today with any calories
        let s = 0;
        const today = new Date();
        for (let i = 0; i < 365; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const key = d.toISOString().slice(0,10);
          if ((map.get(key) || 0) > 0) s += 1; else break;
        }
        setStreak(s);
        // 7-day average calories (including zeros for missing days)
        let sum = 0;
        for (let i = 0; i < 7; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.toISOString().slice(0,10);
          sum += (map.get(key) || 0);
        }
        setAvg7Calories(Math.round(sum / 7));
      } catch(_) {
        // ignore progress fetch errors
      }
    })();
  }, [userId]);

  const bmi = useMemo(() => {
    const h = parseFloat(form.height_cm);
    const w = parseFloat(form.weight_kg);
    if (!h || !w) return null;
    const meters = h / 100;
    return (w / (meters * meters)).toFixed(1);
  }, [form.height_cm, form.weight_kg]);

  const bmr = useMemo(() => {
    const age = Number(form.age);
    const h = Number(form.height_cm);
    const w = Number(form.weight_kg);
    if (!age || !h || !w || !form.gender) return null;
    const s = (form.gender || "").toLowerCase() === "male" ? 5 : -161;
    return Math.round(10 * w + 6.25 * h - 5 * age + s);
  }, [form.age, form.height_cm, form.weight_kg, form.gender]);

  const tdee = useMemo(() => {
    if (!bmr) return null;
    const factors = {
      sedentary: 1.2,
      "lightly active": 1.375,
      "moderately active": 1.55,
      "very active": 1.725,
    };
    const f = factors[form.activity_level?.toLowerCase?.()] || 1.2;
    return Math.round(bmr * f);
  }, [bmr, form.activity_level]);

  function onChange(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSave() {
    try {
      setLoading(true);
      setError(null);
      const payload = { ...form };
      // coerce numeric fields
      ["age", "height_cm", "weight_kg", "budget"].forEach((k) => {
        if (payload[k] === "" || payload[k] === null || payload[k] === undefined) return;
        const num = k === "budget" ? Number(payload[k]) : parseFloat(payload[k]);
        if (!Number.isNaN(num)) payload[k] = num;
      });
      const updated = await updateUserProfile(userId, payload);
      setProfile(updated);
      setEdit(false);
      setSaved(true);
      setLoading(false);
    } catch (e) {
      setError("Failed to update profile");
      setLoading(false);
    }
  }

  if (loading && !profile)
    return (
      <div className="profile-page">
        <div className="profile-loader">Loading…</div>
      </div>
    );
  if (error)
    return (
      <div className="profile-page">
        <div className="profile-error">{error}</div>
        <button className="profile-back-btn" onClick={onBack}>
          ← Back
        </button>
      </div>
    );
  if (!profile)
    return (
      <div className="profile-page">
        <div className="profile-error">No profile data</div>
        <button className="profile-back-btn" onClick={onBack}>
          ← Back
        </button>
      </div>
    );

  const headerName = profile.username && profile.username.trim()
    ? profile.username
    : `Profile #${profile.id}`;
  const accountId = profile.email && profile.email.trim()
    ? profile.email
    : (profile.user ? `Account ID: ${profile.user}` : "");

  return (
    <div className="profile-page">
      <div className="profile-hero">
        <button className="profile-back-btn" onClick={onBack}>
          ← Back
        </button>
        <div className="profile-hero-main">
          <img
            src={"https://api.dicebear.com/7.x/identicon/svg?seed=" + (profile.user || profile.id)}
            alt="avatar"
            className="profile-avatar"
          />
          <div className="profile-hero-text">
            <h1 className="profile-title">{headerName}</h1>
            {accountId && <div className="profile-subtitle">{accountId}</div>}
          </div>
        </div>
        <div className="profile-hero-actions">
          {edit ? (
            <button className="profile-save-btn" onClick={handleSave} disabled={loading}>
              Save changes
            </button>
          ) : (
            <button className="profile-edit-btn" onClick={() => setEdit(true)}>
              Edit profile
            </button>
          )}
        </div>
      </div>

      {saved && <div className="profile-toast">Saved ✅</div>}

      <div className="profile-grid">
        <section className="profile-card">
          <div className="profile-section-title">Overview</div>
          <div className="profile-stats-row">
            <div className="profile-stat-card">
              <div className="stat-label">Weight</div>
              <div className="stat-value">{(weightStats.latest ?? form.weight_kg) || "—"} kg</div>
            </div>
            <div className="profile-stat-card">
              <div className="stat-label">Height</div>
              <div className="stat-value">{form.height_cm || "—"} cm</div>
            </div>
            <div className="profile-stat-card">
              <div className="stat-label">BMI</div>
              <div className="stat-value">{bmi || "—"}</div>
            </div>
          </div>
          <div className="profile-stats-row">
            <div className="profile-stat-card">
              <div className="stat-label">BMR</div>
              <div className="stat-value">{bmr || "—"} kcal</div>
            </div>
            <div className="profile-stat-card">
              <div className="stat-label">TDEE</div>
              <div className="stat-value">{tdee || "—"} kcal</div>
            </div>
            <div className="profile-stat-card">
              <div className="stat-label">7d Avg</div>
              <div className="stat-value">{avg7Calories == null ? '—' : `${avg7Calories} kcal`}</div>
            </div>
          </div>
          <div className="profile-stats-row">
            <div className="profile-stat-card">
              <div className="stat-label">Streak</div>
              <div className="stat-value">{streak || 0} days</div>
            </div>
            <div className="profile-stat-card">
              <div className="stat-label">Total Lost</div>
              <div className="stat-value">{weightStats.totalLost == null ? '—' : `${weightStats.totalLost} kg`}</div>
            </div>
          </div>
        </section>

        <section className="profile-card">
          <div className="profile-section-title">Basics</div>
          <div className="form-grid">
            <Field label="Age">
              <input
                type="number"
                min="0"
                value={form.age}
                onChange={(e) => onChange("age", e.target.value)}
                disabled={!edit}
              />
            </Field>
            <Field label="Gender">
              <select
                value={form.gender}
                onChange={(e) => onChange("gender", e.target.value)}
                disabled={!edit}
              >
                <option value="">Select…</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Activity level">
              <select
                value={form.activity_level}
                onChange={(e) => onChange("activity_level", e.target.value)}
                disabled={!edit}
              >
                {activityOptions.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Goal">
              <input
                type="text"
                value={form.goals}
                onChange={(e) => onChange("goals", e.target.value)}
                placeholder="e.g., fat loss, muscle gain, maintenance"
                disabled={!edit}
              />
            </Field>
          </div>
        </section>

        <section className="profile-card">
          <div className="profile-section-title">Body metrics</div>
          <div className="form-grid">
            <Field label="Height (cm)">
              <input
                type="number"
                min="0"
                value={form.height_cm}
                onChange={(e) => onChange("height_cm", e.target.value)}
                disabled={!edit}
              />
            </Field>
            <Field label="Weight (kg)">
              <input
                type="number"
                min="0"
                value={form.weight_kg}
                onChange={(e) => onChange("weight_kg", e.target.value)}
                disabled={!edit}
              />
            </Field>
            <Field label="Budget (optional)">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.budget}
                onChange={(e) => onChange("budget", e.target.value)}
                disabled={!edit}
              />
            </Field>
            <Field label="Time constraints">
              <input
                type="text"
                value={form.time_constraints}
                onChange={(e) => onChange("time_constraints", e.target.value)}
                placeholder="e.g., <30 min dinners, meal prep on Sundays"
                disabled={!edit}
              />
            </Field>
          </div>
        </section>

        <section className="profile-card">
          <div className="profile-section-title">Preferences & health</div>
          <div className="form-grid">
            <Field label="Dietary preference">
              <input
                type="text"
                value={form.dietary_preferences}
                onChange={(e) => onChange("dietary_preferences", e.target.value)}
                placeholder="e.g., vegetarian, vegan, keto, omnivore"
                disabled={!edit}
              />
            </Field>
            <Field label="Allergies / restrictions">
              <input
                type="text"
                value={form.restrictions_allergies}
                onChange={(e) => onChange("restrictions_allergies", e.target.value)}
                placeholder="comma-separated list"
                disabled={!edit}
              />
            </Field>
            <Field label="Cuisine preferences">
              <input
                type="text"
                value={form.cuisine_preferences}
                onChange={(e) => onChange("cuisine_preferences", e.target.value)}
                placeholder="e.g., Italian, Indian, Mexican"
                disabled={!edit}
              />
            </Field>
            <Field label="Health notes">
              <textarea
                rows={4}
                value={form.health_data}
                onChange={(e) => onChange("health_data", e.target.value)}
                placeholder="e.g., diabetes, hypertension, medications"
                disabled={!edit}
              />
            </Field>
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}
