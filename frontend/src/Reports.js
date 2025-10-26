import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./Reports.css";
import { fetchFoodLogs, createFoodLog } from "./api";
import { fetchWeightLogs, fetchMeasurementLogs } from "./api";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Filler } from 'chart.js';
import { Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
);

// Utility: format Date to YYYY-MM-DD
function fmt(d) {
  return d.toISOString().slice(0, 10);
}

// Utility: get start/end for presets
function presetToRange(preset) {
  const today = new Date();
  const end = fmt(today);
  const startDate = new Date(today);
  if (preset === "Last 7 Days") {
    startDate.setDate(today.getDate() - 6);
  } else if (preset === "Last 30 Days") {
    startDate.setDate(today.getDate() - 29);
  } else if (preset === "This Month") {
    startDate.setDate(1);
  } else if (preset === "Last Month") {
    const d = new Date(today.getFullYear(), today.getMonth(), 0); // last day prev month
    const s = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    return { start: fmt(s), end: fmt(d) };
  }
  return { start: fmt(startDate), end };
}

// Aggregate logs within a date range
function aggregateLogs(logs, start, end) {
  const inRange = logs.filter((l) => l.date >= start && l.date <= end);
  const byDay = new Map();
  const byFood = new Map();
  const mealTypeByDay = new Map(); // date -> Set(meal_type)

  let totals = { calories: 0, protein: 0, carbs: 0, fats: 0 };
  inRange.forEach((l) => {
    const day = l.date;
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day).push(l);

    // totals
    totals.calories += l.calories || 0;
    totals.protein += l.protein || 0;
    totals.carbs += l.carbs || 0;
    totals.fats += l.fats || 0;

    // top foods
    const label = l.recipe?.name || l.custom_food || "Custom Food";
    const prev = byFood.get(label) || 0;
    byFood.set(label, prev + (l.calories || 0));

    // meal types presence per day
    if (!mealTypeByDay.has(day)) mealTypeByDay.set(day, new Set());
    mealTypeByDay.get(day).add(l.meal_type || "");
  });

  const distinctDays = byDay.size || 1; // avoid divide by zero
  const averages = {
    calories: Math.round(totals.calories / distinctDays),
    protein: Math.round(totals.protein / distinctDays),
    carbs: Math.round(totals.carbs / distinctDays),
    fats: Math.round(totals.fats / distinctDays),
  };

  // macro ratio
  const macroTotal = totals.protein + totals.carbs + totals.fats || 1;
  const macroPct = {
    protein: Math.round((totals.protein / macroTotal) * 100),
    carbs: Math.round((totals.carbs / macroTotal) * 100),
    fats: Math.round((totals.fats / macroTotal) * 100),
  };

  // top foods by calories
  const topFoods = Array.from(byFood.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, cals]) => ({ name, cals: Math.round(cals) }));

  // adherence: % of days in range with any log
  const daysInRange = (() => {
    const out = [];
    let cursor = new Date(start);
    const last = new Date(end);
    while (cursor <= last) {
      out.push(fmt(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    return out;
  })();
  const daysWithLogs = daysInRange.filter((d) => byDay.has(d)).length;
  const adherence = Math.round((daysWithLogs / daysInRange.length) * 100);

  // most skipped meal type across days
  const MEALS = ["breakfast", "lunch", "dinner", "snack"]; // FoodLog choice uses 'snack'
  const skippedCount = Object.fromEntries(MEALS.map((m) => [m, 0]));
  daysInRange.forEach((d) => {
    const set = mealTypeByDay.get(d) || new Set();
    MEALS.forEach((m) => {
      if (!set.has(m)) skippedCount[m] += 1;
    });
  });
  const mostSkipped = Object.entries(skippedCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "";

  return { inRange, totals, averages, macroPct, topFoods, adherence, mostSkipped };
}

export default function Reports() {
  const [preset, setPreset] = useState("Last 7 Days");
  const [dateRange, setDateRange] = useState(() => presetToRange("Last 7 Days"));
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [weightLogs, setWeightLogs] = useState([]);
  const [measurementLogs, setMeasurementLogs] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const hasToken = () => !!localStorage.getItem('access');

  // Load logs from backend (persisted across refresh)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchFoodLogs();
        // Normalize date to YYYY-MM-DD strings
        const normalized = (data || []).map((l) => ({
          ...l,
          date: (l.date || "").slice(0, 10),
        }));
        if (mounted) setLogs(normalized);

        // Attempt to sync any offline cached meals to backend (if logged in)
        try {
          const rawLocal = localStorage.getItem("loggedMeals");
          const offline = rawLocal ? JSON.parse(rawLocal) : [];
          if (Array.isArray(offline)) {
            const serverSignatures = new Set(normalized.map(l => `${l.date}|${(l.recipe?.name || l.custom_food || '').trim()}|${(l.meal_type||'').toLowerCase()}`));
            const toSync = offline.filter(m => {
              const date = (m.date||'').slice(0,10);
              const mealType = (m.mealType === 'snacks') ? 'snack' : (m.mealType||'').toLowerCase();
              const name = (m.name||'').trim();
              if (!date || !name || !mealType) return false;
              const sig = `${date}|${name}|${mealType}`;
              return !serverSignatures.has(sig);
            });
            if (mounted) setUnsyncedCount(toSync.length);
          }
        } catch(_) {}
        // Try optional progress endpoints
        try {
          const wl = await fetchWeightLogs();
          if (mounted) setWeightLogs((wl || []).map(w => ({ ...w, date: (w.date||'').slice(0,10) })));
        } catch(_) {}
        try {
          const ml = await fetchMeasurementLogs();
          if (mounted) setMeasurementLogs((ml || []).map(m => ({ ...m, date: (m.date||'').slice(0,10) })));
        } catch(_) {}
      } catch (e) {
        // Fallback to local offline cache if present
        try {
          const raw = localStorage.getItem("loggedMeals");
          const local = raw ? JSON.parse(raw) : [];
          const mapped = local.map((m) => ({
            id: m.id,
            recipe: { name: m.name },
            custom_food: m.name,
            date: (m.date || "").slice(0, 10),
            meal_type: m.mealType === "snacks" ? "snack" : (m.mealType || ""),
            calories: m.calories,
            protein: m.protein,
            fats: m.fats,
          }));
          if (mounted) setLogs(mapped);
          if (mounted) setUnsyncedCount(mapped.length);
        } catch (_) {
          if (mounted) setError("Couldn't load meal logs. Log in and try again.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Auto-sync when user has token and unsynced items are detected
  useEffect(() => {
    if (!loading && unsyncedCount > 0 && hasToken() && !syncing) {
      syncOfflineNow();
    }
  }, [loading, unsyncedCount, syncing]);

  const syncOfflineNow = useCallback(async () => {
    try {
      setSyncing(true);
      const data = await fetchFoodLogs();
      const normalized = (data || []).map(l => ({ ...l, date: (l.date||'').slice(0,10) }));
      const rawLocal = localStorage.getItem('loggedMeals');
      const offline = rawLocal ? JSON.parse(rawLocal) : [];
      const serverSignatures = new Set(normalized.map(l => `${l.date}|${(l.recipe?.name || l.custom_food || '').trim()}|${(l.meal_type||'').toLowerCase()}`));
      const toSync = (Array.isArray(offline) ? offline : []).filter(m => {
        const date = (m.date||'').slice(0,10);
        const mealType = (m.mealType === 'snacks') ? 'snack' : (m.mealType||'').toLowerCase();
        const name = (m.name||'').trim();
        if (!date || !name || !mealType) return false;
        const sig = `${date}|${name}|${mealType}`;
        return !serverSignatures.has(sig);
      });
      for (const m of toSync) {
        const date = (m.date||'').slice(0,10);
        const meal_type = (m.mealType === 'snacks') ? 'snack' : (m.mealType||'').toLowerCase();
        const payload = { date, meal_type, calories: m.calories, protein: m.protein, carbs: m.carbs, fats: m.fats };
        const rid = (typeof m.id === 'number') ? m.id : (typeof m.id === 'string' && /^\d+$/.test(m.id) ? parseInt(m.id,10) : null);
        if (rid != null && rid < 1000000) payload['recipe_id'] = rid; else payload['custom_food'] = m.name;
        try { await createFoodLog(payload); } catch(_) {}
      }
      const refreshed = await fetchFoodLogs();
      const normalized2 = (refreshed || []).map(l => ({ ...l, date: (l.date||'').slice(0,10) }));
      setLogs(normalized2);
      setUnsyncedCount(0);
    } catch (e) {
      // no-op, UI can remain unchanged
    } finally {
      setSyncing(false);
    }
  }, []);

  // Update custom range when preset changes
  useEffect(() => {
    setDateRange(presetToRange(preset));
  }, [preset]);

  const agg = useMemo(() => aggregateLogs(logs, dateRange.start, dateRange.end), [logs, dateRange]);

  // Build day array for charts and adherence heatmap
  const daysInRange = useMemo(() => {
    const out = [];
    let c = new Date(dateRange.start);
    const last = new Date(dateRange.end);
    while (c <= last) { out.push(fmt(c)); c.setDate(c.getDate()+1); }
    return out;
  }, [dateRange]);

  // Calories per day series
  const caloriesByDay = useMemo(() => {
    const map = new Map();
    agg.inRange.forEach(l => {
      map.set(l.date, (map.get(l.date)||0) + (l.calories||0));
    });
    return daysInRange.map(d => Math.round(map.get(d)||0));
  }, [agg.inRange, daysInRange]);

  // (removed) Meal type distribution counts - not used in UI

  // Streaks (current and best)
  const { currentStreak, longestStreak } = useMemo(() => {
    let cur = 0, best = 0, prev = false;
    daysInRange.forEach(d => {
      const has = agg.inRange.some(l => l.date===d);
      if (has) { cur = prev ? cur+1 : 1; best = Math.max(best, cur); prev = true; }
      else { cur = 0; prev = false; }
    });
    return { currentStreak: cur, longestStreak: best };
  }, [agg.inRange, daysInRange]);

  // Weight and measurement summaries
  const weightSeries = useMemo(() => {
    const byDay = new Map();
    (weightLogs||[]).forEach(w => { if (w.date>=dateRange.start && w.date<=dateRange.end) byDay.set(w.date, w.weight); });
    return daysInRange.map(d => byDay.get(d) ?? null);
  }, [weightLogs, dateRange, daysInRange]);

  const measurementSummary = useMemo(() => {
    const filtered = (measurementLogs||[]).filter(m => m.date>=dateRange.start && m.date<=dateRange.end);
    if (filtered.length<2) return { waistDelta: null, hipsDelta: null };
    const first = filtered[0], last = filtered[filtered.length-1];
    return { waistDelta: +(last.waist-first.waist).toFixed(1), hipsDelta: +(last.hips-first.hips).toFixed(1) };
  }, [measurementLogs, dateRange]);

  // Chart datasets
  const caloriesLineData = useMemo(() => ({
    labels: daysInRange,
    datasets: [
      {
        label: 'Calories',
        data: caloriesByDay,
        borderColor: '#f39c12',
        backgroundColor: 'rgba(243,156,18,0.2)',
        fill: true,
        tension: 0.3,
        pointRadius: 2,
        yAxisID: 'y',
      },
      ...(weightSeries.some(v=>v!=null) ? [{
        label: 'Weight (kg)',
        data: weightSeries,
        borderColor: '#23d5ab',
        backgroundColor: 'rgba(35,213,171,0.1)',
        tension: 0.3,
        pointRadius: 2,
        yAxisID: 'y1',
      }] : []),
    ]
  }), [daysInRange, caloriesByDay, weightSeries]);

  const caloriesLineOptions = useMemo(() => ({
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    stacked: false,
    plugins: { legend: { position: 'top' } },
    scales: {
      y: { type: 'linear', display: true, position: 'left' },
      y1: { type: 'linear', display: weightSeries.some(v=>v!=null), position: 'right', grid: { drawOnChartArea: false } },
    }
  }), [weightSeries]);

  const macroDoughnutData = useMemo(() => ({
    labels: ['Protein','Carbs','Fats'],
    datasets: [{
      label: 'Macro %',
      data: [agg.macroPct.protein, agg.macroPct.carbs, agg.macroPct.fats],
      backgroundColor: ['#23d5ab','#3498db','#f39c12'],
      borderWidth: 2,
    }]
  }), [agg.macroPct]);

  // Removed unused mealTypeBarData to avoid eslint no-unused-vars

  const handleCalendarChange = (which) => (e) => {
    const val = e.target.value;
    setDateRange((r) => ({ ...r, [which]: val }));
  };

  return (
    <div className="reports-page">
      {/* 1. Date Range Selector */}
      <div className="reports-section">
        <div className="reports-section-title">Custom Date Range 📅</div>
        <div className="reports-date-range-row">
          {["Last 7 Days", "Last 30 Days", "This Month", "Last Month"].map((p) => (
            <button
              key={p}
              className={"reports-date-preset" + (preset === p ? " active" : "")}
              onClick={() => setPreset(p)}
            >
              {p}
            </button>
          ))}
          <input
            type="date"
            className="reports-date-calendar"
            value={dateRange.start}
            onChange={handleCalendarChange("start")}
            max={dateRange.end}
          />
          <span>to</span>
          <input
            type="date"
            className="reports-date-calendar"
            value={dateRange.end}
            onChange={handleCalendarChange("end")}
            min={dateRange.start}
          />
        </div>
      </div>

      {/* Loading / error states */}
      {loading && <div className="reports-section">Loading logs…</div>}
      {error && !loading && <div className="reports-section" style={{ color: "#c33" }}>{error}</div>}
      {!loading && unsyncedCount > 0 && (
        <div className="reports-section" style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div className="reports-section-title" style={{ marginBottom: 0 }}>Unsynced meals detected</div>
          <div>
            <span style={{ marginRight: 12, fontWeight: 700 }}>{unsyncedCount} pending</span>
            <button className="reports-date-preset" onClick={syncOfflineNow} disabled={syncing || !hasToken()}>{syncing ? 'Syncing…' : (hasToken() ? 'Sync now' : 'Login to sync')}</button>
          </div>
        </div>
      )}

  {/* 2. Executive Summary */}
      <div className="reports-section">
        <div className="reports-section-title">Executive Summary ✨</div>
        <div className="reports-metrics-row">
          <div className="reports-metric-card">{agg.averages.calories} kcal<br /><span style={{ fontWeight: 400, fontSize: '1rem' }}>Avg Calories</span></div>
          <div className="reports-metric-card">{agg.averages.protein} g<br /><span style={{ fontWeight: 400, fontSize: '1rem' }}>Avg Protein</span></div>
          <div className="reports-metric-card">{agg.averages.carbs} g<br /><span style={{ fontWeight: 400, fontSize: '1rem' }}>Avg Carbs</span></div>
          <div className="reports-metric-card">{agg.averages.fats} g<br /><span style={{ fontWeight: 400, fontSize: '1rem' }}>Avg Fats</span></div>
          <div className="reports-metric-card">{agg.adherence}%<br /><span style={{ fontWeight: 400, fontSize: '1rem' }}>Adherence</span></div>
          <div className="reports-metric-card">Streak: {currentStreak}d<br /><span style={{ fontWeight: 400, fontSize: '1rem' }}>Best: {longestStreak}d</span></div>
        </div>
        <div className="reports-metrics-row">
          <div className="reports-chart-container" style={{ flex: 1 }}>
            <Doughnut data={macroDoughnutData} options={{ plugins: { legend: { position: 'bottom' } } }} />
          </div>
          <div className="reports-chart-container" style={{ flex: 2 }}>
            <Line data={caloriesLineData} options={caloriesLineOptions} />
          </div>
        </div>
      </div>

      {/* 4. Progress & Trends */}
      <div className="reports-section">
        <div className="reports-section-title">Progress & Trends 📈</div>
        <div className="reports-metrics-row">
          <div className="reports-metric-card">Waist Δ: {measurementSummary.waistDelta == null ? '—' : `${measurementSummary.waistDelta} cm`}</div>
          <div className="reports-metric-card">Hips Δ: {measurementSummary.hipsDelta == null ? '—' : `${measurementSummary.hipsDelta} cm`}</div>
        </div>
        <div className="reports-chart-container">
          <Line data={caloriesLineData} options={caloriesLineOptions} />
        </div>
      </div>

      {/* 4. Adherence & Consistency */}
      <div className="reports-section">
        <div className="reports-section-title">Adherence & Consistency Report ✅</div>
        <div className="reports-metrics-row">
          <div className="reports-metric-card">{agg.adherence}%<br /><span style={{ fontWeight: 400, fontSize: '1rem' }}>Plan Adherence</span></div>
        </div>
        <div className="reports-chart-container">
          <div className="reports-heatmap">
            {daysInRange.map((d) => {
              const has = agg.inRange.some((l) => l.date === d);
              return <div key={d} className={"reports-heatmap-cell" + (has ? " on" : "")} title={`${d} — ${has ? 'Logged' : 'No logs'}`}></div>;
            })}
          </div>
        </div>
        <div className="reports-metric-card" style={{ margin: '1.2rem 0' }}>
          Most Skipped Meal: <b>{agg.mostSkipped ? agg.mostSkipped[0].toUpperCase() + agg.mostSkipped.slice(1) : '—'}</b>
        </div>
      </div>

      {/* 5. Download & Share */}
      <button className="reports-download-btn" disabled={logs.length === 0}>Download as PDF</button>
    </div>
  );
}
