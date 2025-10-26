import React, { useState, useEffect, useMemo } from 'react';
import './Tracking.css';
import { fetchFoodLogs, fetchWeightLogs, fetchMeasurementLogs, createWeightLog, createMeasurementLog } from './api';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

// TrackingPage derives progress from Food Logs (backend + in-memory), since the backend
// currently doesn't provide weight/measurement history. We compute streaks and daily totals.
const TrackingPage = ({ loggedMeals: propLoggedMeals = [] }) => {
    const [backendMeals, setBackendMeals] = useState([]);
    const [weightLogs, setWeightLogs] = useState([]);
    const [measurementLogs, setMeasurementLogs] = useState([]);
    // Controlled inputs for add forms
    const todayKey = new Date().toISOString().slice(0, 10);
    const [weightDate, setWeightDate] = useState(todayKey);
    const [weightValue, setWeightValue] = useState('');
    const [measDate, setMeasDate] = useState(todayKey);
    const [measWaist, setMeasWaist] = useState('');
    const [measHips, setMeasHips] = useState('');

    useEffect(() => {
        const fetchMeals = async () => {
            try {
                const data = await fetchFoodLogs();
                const normalized = (Array.isArray(data) ? data : []).map((log) => ({
                    id: log.id,
                    name: log.recipe?.name || log.custom_food || 'Logged Meal',
                    date: log.date,
                    calories: log.calories,
                    protein: log.protein,
                    carbs: log.carbs,
                    fats: log.fats,
                }));
                setBackendMeals(normalized);
            } catch (e) {
                console.warn('Could not fetch backend food logs:', e);
            }
        };
        const fetchWeights = async () => {
            try {
                const data = await fetchWeightLogs();
                setWeightLogs(Array.isArray(data) ? data : []);
            } catch (e) {
                console.warn('Could not fetch weight logs:', e);
            }
        };
        const fetchMeasures = async () => {
            try {
                const data = await fetchMeasurementLogs();
                setMeasurementLogs(Array.isArray(data) ? data : []);
            } catch (e) {
                console.warn('Could not fetch measurement logs:', e);
            }
        };
        fetchMeals();
        fetchWeights();
        fetchMeasures();
    }, []);

    // Merge backend meals and in-app logged meals (avoid duplicates by id+name+date)
    const mergedMeals = useMemo(() => {
        const key = (m) => `${m.id ?? ''}|${m.name}|${(m.date || '').slice(0,10)}`;
        const map = new Map();
        [...backendMeals, ...propLoggedMeals].forEach((m) => {
            if (!m) return;
            map.set(key(m), m);
        });
        return Array.from(map.values());
    }, [backendMeals, propLoggedMeals]);

    // Build day-keyed totals
    const dayTotals = useMemo(() => {
        const totals = {};
        mergedMeals.forEach((m) => {
            const day = (m.date ? new Date(m.date) : new Date());
            const key = day.toISOString().slice(0, 10);
            if (!totals[key]) totals[key] = { calories: 0, protein: 0, carbs: 0, fats: 0 };
            totals[key].calories += Number(m.calories || 0);
            totals[key].protein += Number(m.protein || 0);
            totals[key].carbs += Number(m.carbs || 0);
            totals[key].fats += Number(m.fats || 0);
        });
        return totals;
    }, [mergedMeals]);

    // Last N days labels helper
    const buildLastNDays = (n) => {
        const days = [];
        const today = new Date();
        for (let i = n - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            days.push(d.toISOString().slice(0, 10));
        }
        return days;
    };

    const last14 = useMemo(() => buildLastNDays(14), []);
    const last7 = useMemo(() => buildLastNDays(7), []);

    // Datasets for charts
    const caloriesSeries = last14.map((d) => dayTotals[d]?.calories || 0);
    const proteinSeries = last14.map((d) => dayTotals[d]?.protein || 0);
    const carbsSeries = last14.map((d) => dayTotals[d]?.carbs || 0);
    const fatsSeries = last14.map((d) => dayTotals[d]?.fats || 0);

    // Weekly stacked macros chart (last 7 days)
    const weeklyStackedMacros = {
        labels: last7,
        datasets: [
            { label: 'Protein (g)', data: last7.map(d => dayTotals[d]?.protein || 0), backgroundColor: 'rgba(16,185,129,0.8)', stack: 'stack1' },
            { label: 'Carbs (g)', data: last7.map(d => dayTotals[d]?.carbs || 0), backgroundColor: 'rgba(245,158,11,0.85)', stack: 'stack1' },
            { label: 'Fats (g)', data: last7.map(d => dayTotals[d]?.fats || 0), backgroundColor: 'rgba(239,68,68,0.85)', stack: 'stack1' },
        ]
    };
    const weeklyStackedOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { stacked: true },
            y: { stacked: true, beginAtZero: true }
        },
        plugins: { legend: { position: 'bottom' } }
    };

    // Progress metrics
    const uniqueLoggedDays = Object.keys(dayTotals).length;
    const currentStreak = useMemo(() => {
        let streak = 0;
        let d = new Date();
        while (true) {
            const key = d.toISOString().slice(0, 10);
            if (dayTotals[key] && (dayTotals[key].calories > 0)) {
                streak += 1;
                d.setDate(d.getDate() - 1);
            } else {
                break;
            }
        }
        return streak;
    }, [dayTotals]);
    const targetStreak = 7;
    const toNextGoal = Math.max(0, targetStreak - currentStreak);

    const caloriesChartData = {
        labels: last14,
        datasets: [
            {
                label: 'Calories',
                data: caloriesSeries,
                borderColor: 'green',
                backgroundColor: 'rgba(16,185,129,0.2)'
            }
        ]
    };

    const macrosChartData = {
        labels: last14,
        datasets: [
            { label: 'Protein (g)', data: proteinSeries, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.2)' },
            { label: 'Carbs (g)', data: carbsSeries, borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.2)' },
            { label: 'Fats (g)', data: fatsSeries, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.2)' }
        ]
    };

    // Today macro goal cards (simple targets; can be personalized later)
    const todayTotals = dayTotals[todayKey] || { protein: 0, carbs: 0, fats: 0 };
    const targets = { protein: 150, carbs: 250, fats: 70 };
    const pct = (val, goal) => Math.min(100, Math.round((val / goal) * 100));

    // Weight chart from logs
    const sortedWeights = [...weightLogs].sort((a, b) => new Date(a.date) - new Date(b.date));
    const weightLabels = sortedWeights.map(w => w.date);
    const weightValues = sortedWeights.map(w => w.weight);
    const weightChartData = {
        labels: weightLabels,
        datasets: [{ label: 'Weight (kg)', data: weightValues, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.2)' }]
    };

    // Measurements charts from logs
    const sortedMeas = [...measurementLogs].sort((a, b) => new Date(a.date) - new Date(b.date));
    const measLabels = sortedMeas.map(m => m.date);
    const waistSeries = sortedMeas.map(m => m.waist);
    const hipsSeries = sortedMeas.map(m => m.hips);
    const measurementsChartData = {
        labels: measLabels,
        datasets: [
            { label: 'Waist (cm)', data: waistSeries, borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,0.2)' },
            { label: 'Hips (cm)', data: hipsSeries, borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.2)' }
        ]
    };

    if (!mergedMeals || mergedMeals.length === 0) {
        return <div className="tracking-page">No meals logged yet.</div>;
    }

    return (
        <div className="tracking-page">
            <h1>Progress Overview</h1>
            <div className="progress-summary">
                <div className="progress-item">
                    <h2>{uniqueLoggedDays}</h2>
                    <p>Total Logged Days</p>
                </div>
                <div className="progress-item">
                    <h2>{currentStreak} Days</h2>
                    <p>Current Streak</p>
                </div>
                <div className="progress-item">
                    <h2>{toNextGoal}</h2>
                    <p>to 7-Day Streak</p>
                </div>
            </div>
            <div className="charts">
                <div className="chart">
                    <h3>Calories (last 14 days)</h3>
                    <Line data={caloriesChartData} options={{ maintainAspectRatio: false }} />
                </div>
                <div className="chart">
                    <h3>Macros (last 14 days)</h3>
                    <Line data={macrosChartData} options={{ maintainAspectRatio: false }} />
                </div>
            </div>

            <h2 style={{ marginTop: '1rem' }}>Nutritional Tracking (weekly)</h2>
            <div className="weekly-chart">
                {/* Stacked macros per day for last 7 days */}
                <Line data={weeklyStackedMacros} options={weeklyStackedOptions} />
            </div>

            <div className="metric-cards">
                <div className="metric-card">
                    <div className="metric-title">Protein</div>
                    <div className="metric-sub">{todayTotals.protein || 0}g • {pct(todayTotals.protein, targets.protein)}%</div>
                    <div className="metric-bar"><div className="fill protein" style={{ width: pct(todayTotals.protein, targets.protein) + '%' }} /></div>
                </div>
                <div className="metric-card">
                    <div className="metric-title">Carbs</div>
                    <div className="metric-sub">{todayTotals.carbs || 0}g • {pct(todayTotals.carbs, targets.carbs)}%</div>
                    <div className="metric-bar"><div className="fill carbs" style={{ width: pct(todayTotals.carbs, targets.carbs) + '%' }} /></div>
                </div>
                <div className="metric-card">
                    <div className="metric-title">Fats</div>
                    <div className="metric-sub">{todayTotals.fats || 0}g • {pct(todayTotals.fats, targets.fats)}%</div>
                    <div className="metric-bar"><div className="fill fats" style={{ width: pct(todayTotals.fats, targets.fats) + '%' }} /></div>
                </div>
            </div>

            {/* Quick Add Panels */}
            <div className="tracking-controls">
                <div className="control-group">
                    <input type="date" value={weightDate} onChange={(e) => setWeightDate(e.target.value)} />
                    <input type="number" step="0.1" value={weightValue} onChange={(e) => setWeightValue(e.target.value)} placeholder="Weight (kg)" />
                    <button className="btn-add" onClick={async () => {
                        const w = parseFloat(weightValue);
                        if (Number.isNaN(w)) return;
                        try {
                            const saved = await createWeightLog({ date: weightDate || todayKey, weight: w });
                            setWeightLogs((prev) => [...prev, saved]);
                        } catch (e) {
                            setWeightLogs((prev) => [...prev, { id: Date.now(), date: weightDate || todayKey, weight: w }]);
                        }
                        setWeightValue('');
                    }}>Add Weight</button>
                </div>
                <div className="control-group">
                    <input type="date" value={measDate} onChange={(e) => setMeasDate(e.target.value)} />
                    <input type="number" step="0.1" value={measWaist} onChange={(e) => setMeasWaist(e.target.value)} placeholder="Waist (cm)" />
                    <input type="number" step="0.1" value={measHips} onChange={(e) => setMeasHips(e.target.value)} placeholder="Hips (cm)" />
                    <button className="btn-add" onClick={async () => {
                        const waist = parseFloat(measWaist);
                        const hips = parseFloat(measHips);
                        if (Number.isNaN(waist) || Number.isNaN(hips)) return;
                        try {
                            const saved = await createMeasurementLog({ date: measDate || todayKey, waist, hips });
                            setMeasurementLogs((prev) => [...prev, saved]);
                        } catch (e) {
                            setMeasurementLogs((prev) => [...prev, { id: Date.now(), date: measDate || todayKey, waist, hips }]);
                        }
                        setMeasWaist('');
                        setMeasHips('');
                    }}>Add Measurements</button>
                </div>
            </div>

            {/* Weight and Measurements Charts */}
            <div className="charts">
                <div className="chart">
                    <h3>Weight Progress</h3>
                    <Line data={weightChartData} options={{ maintainAspectRatio: false }} />
                </div>
                <div className="chart">
                    <h3>Measurements Progress</h3>
                    <Line data={measurementsChartData} options={{ maintainAspectRatio: false }} />
                </div>
            </div>
            <h2>Logged Meals</h2>
            <div className="logged-meals-list">
                {mergedMeals.map((meal) => (
                    <div key={meal.id} className="logged-meal-card">
                        <h3>{meal.name}</h3>
                        <p>Logged on: {new Date(meal.date).toLocaleString()}</p>
                        <div className="meal-macros">
                            <span>🔥 {meal.calories} kcal</span>
                            <span>💪 {meal.protein}g</span>
                            <span>🍞 {meal.carbs}g</span>
                            <span>🥑 {meal.fats}g</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TrackingPage;