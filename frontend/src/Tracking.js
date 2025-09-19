import React, { useState } from "react";
import './Tracking.css';

// Chart.js registration (required for v3+)
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Demo data
const weightData = [80, 79.5, 79, 78.7, 78.2, 77.8, 77.5];
const weightLabels = ["Day 1", "Day 5", "Day 10", "Day 15", "Day 20", "Day 25", "Today"];
const bodyMeasurements = {
  waist: [90, 89, 88.5, 88, 87.5, 87, 86.5],
  hips: [100, 99.5, 99, 98.5, 98, 97.5, 97]
};
const calorieIntake = [1800, 1950, 2100, 1700, 2000, 1850, 2200];
const calorieTarget = 2000;
const macros = { protein: 35, carbs: 45, fat: 20 };
const micronutrients = { Fiber: 80, Sugar: 60, Sodium: 70, VitaminC: 90 };
const activityLog = [
  { date: "2025-09-10", activity: "Morning Walk", steps: 3500, kcal: 120 },
  { date: "2025-09-11", activity: "Gym Session", steps: 0, kcal: 350 },
  { date: "2025-09-12", activity: "Yoga", steps: 0, kcal: 90 },
];
const progressPhotos = [
  { url: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80", date: "2025-08-15" },
  { url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", date: "2025-09-15" }
];

export default function Tracking() {
  const [hydration, setHydration] = useState(5);
  const [notes, setNotes] = useState("");

  // Chart.js configs
  const weightChart = {
    labels: weightLabels,
    datasets: [
      {
        label: "Weight (kg)",
        data: weightData,
        borderColor: "#23d5ab",
        backgroundColor: "rgba(35,213,171,0.1)",
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: "#23d5ab",
        fill: true,
      },
      {
        label: "Goal",
        data: Array(weightLabels.length).fill(75),
        borderDash: [8, 6],
        borderColor: "#fda085",
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
      }
    ]
  };
  const bodyChart = {
    labels: weightLabels,
    datasets: [
      {
        label: "Waist (cm)",
        data: bodyMeasurements.waist,
        borderColor: "#fda085",
        backgroundColor: "rgba(253,160,133,0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Hips (cm)",
        data: bodyMeasurements.hips,
        borderColor: "#23d5ab",
        backgroundColor: "rgba(35,213,171,0.1)",
        tension: 0.4,
        fill: true,
      }
    ]
  };
  const calorieChart = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Calories",
        data: calorieIntake,
        backgroundColor: calorieIntake.map(c => c <= calorieTarget ? "#23d5ab" : "#fda085"),
        borderRadius: 8,
      }
    ]
  };
  const macroChart = {
    labels: ["Protein", "Carbs", "Fat"],
    datasets: [
      {
        data: [macros.protein, macros.carbs, macros.fat],
        backgroundColor: ["#23d5ab", "#fda085", "#f6d365"],
        borderWidth: 0,
      }
    ]
  };

  return (
    <div className="tracking-dashboard">
      {/* 1. Summary Dashboard */}
      <div className="tracking-section">
        <div className="tracking-section-title">Progress Overview</div>
        <div className="tracking-metrics-row">
          <div className="tracking-metric-card">-2.5 kg<br /><span style={{ fontWeight: 400, fontSize: '1rem' }}>Total Lost</span></div>
          <div className="tracking-metric-card">7 Days<br /><span style={{ fontWeight: 400, fontSize: '1rem' }}>Current Streak</span></div>
          <div className="tracking-metric-card">2 kg<br /><span style={{ fontWeight: 400, fontSize: '1rem' }}>to Next Goal</span></div>
        </div>
        <div className="tracking-chart-container">
          <Line data={weightChart} options={{ plugins: { legend: { display: false } } }} height={80} />
        </div>
        <div className="tracking-chart-container">
          <Line data={bodyChart} options={{ plugins: { legend: { position: 'bottom' } } }} height={60} />
        </div>
      </div>
      {/* 2. Nutritional Tracking */}
      <div className="tracking-section">
        <div className="tracking-section-title">Nutritional Tracking</div>
        <div className="tracking-chart-container">
          <Bar data={calorieChart} options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, suggestedMax: 2500, grid: { color: '#e7f6ef' } } } }} height={60} />
        </div>
        <div className="tracking-chart-container" style={{ maxWidth: 340, margin: '0 auto' }}>
          <Pie data={macroChart} options={{ plugins: { legend: { position: 'bottom' } } }} />
        </div>
        <div className="tracking-metrics-row">
          {Object.entries(micronutrients).map(([k, v]) => (
            <div key={k} className="tracking-metric-card" style={{ minWidth: 120 }}>
              {k}<br /><span style={{ fontWeight: 400, fontSize: '1rem' }}>{v}%</span>
              <div style={{ background: '#e7f6ef', borderRadius: 8, height: 8, marginTop: 6 }}>
                <div style={{ width: `${v}%`, height: 8, background: '#23d5ab', borderRadius: 8, transition: 'width 0.4s' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* 3. Activity & Hydration Logs */}
      <div className="tracking-section">
        <div className="tracking-section-title">Activity & Hydration</div>
        <div style={{ marginBottom: 16 }}>
          <b>Recent Activity:</b>
          <ul>
            {activityLog.map((a, i) => (
              <li key={i}>{a.date}: {a.activity} {a.steps ? `- ${a.steps} steps` : ''} {a.kcal ? `- ${a.kcal} kcal burned` : ''}</li>
            ))}
          </ul>
        </div>
        <div className="tracking-hydration-row">
          <b>Hydration:</b>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`tracking-water-glass${i < hydration ? ' filled' : ''}`}
              onClick={() => setHydration(i + 1)}
              title={`Glass ${i + 1}`}
            >🥛</div>
          ))}
          <span style={{ marginLeft: 8 }}>{hydration}/8 glasses</span>
        </div>
      </div>
      {/* 4. Progress Photos */}
      <div className="tracking-section">
        <div className="tracking-section-title">Progress Photos</div>
        <div className="tracking-photo-row">
          {progressPhotos.map((p, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <img src={p.url} alt={`Progress ${i + 1}`} className="tracking-photo" />
              <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{p.date}</div>
            </div>
          ))}
        </div>
        <button style={{ background: '#e7f6ef', border: 'none', borderRadius: 8, padding: '0.7rem 1.3rem', fontWeight: 700, cursor: 'pointer' }}>Upload New Photo</button>
      </div>
      {/* 5. Notes & Feelings Log */}
      <div className="tracking-section">
        <div className="tracking-section-title">Notes & Feelings</div>
        <textarea
          className="tracking-notes"
          placeholder="How are you feeling today? Any notes about your progress, mood, or challenges?"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </div>
    </div>
  );
}
