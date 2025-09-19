import React, { useState } from "react";
import "./Reports.css";
// import { Line, Pie, Bar } from 'react-chartjs-2'; // Uncomment if using charts

// Demo/mock data
const demoMetrics = {
  calories: 1850,
  protein: 90,
  carbs: 220,
  fats: 55,
};
const demoMacros = { protein: 20, carbs: 60, fats: 20 };
const demoMicros = [
  { name: "Vitamin C", value: 80, rda: 100 },
  { name: "Iron", value: 60, rda: 100 },
  { name: "Calcium", value: 90, rda: 100 },
];
const demoFoods = [
  { name: "Paneer Tikka", cals: 320 },
  { name: "Brown Rice", cals: 280 },
  { name: "Chana Salad", cals: 250 },
  { name: "Greek Yogurt", cals: 180 },
  { name: "Banana", cals: 110 },
];
const demoWeightTrend = [80, 79.7, 79.5, 79.2, 78.9, 78.7, 78.5];
const demoDates = ["Sep 1", "Sep 3", "Sep 5", "Sep 7", "Sep 9", "Sep 11", "Sep 13"];
const demoMeasurements = { waist: [90, 89.5, 89, 88.5, 88, 87.5, 87], hips: [100, 99.5, 99, 98.5, 98, 97.5, 97] };
const demoAdherence = 85;
const demoMealLog = [1, 1, 0, 1, 1, 1, 0]; // 1=logged, 0=missed
const demoSkippedMeal = "Breakfast";

export default function Reports() {
  const [preset, setPreset] = useState("Last 7 Days");
  const [dateRange, setDateRange] = useState({ start: "2025-09-01", end: "2025-09-15" });

  // Placeholder for calendar logic
  const handleCalendarChange = (e) => {
    // Implement calendar logic here
  };

  return (
    <div className="reports-page">
      {/* 1. Date Range Selector */}
      <div className="reports-section">
        <div className="reports-section-title">Custom Date Range 📅</div>
        <div className="reports-date-range-row">
          {["Last 7 Days", "Last 30 Days", "This Month", "Last Month"].map(p => (
            <button key={p} className={"reports-date-preset" + (preset === p ? " active" : "")} onClick={() => setPreset(p)}>{p}</button>
          ))}
          <input type="date" className="reports-date-calendar" value={dateRange.start} onChange={handleCalendarChange} />
          <span>to</span>
          <input type="date" className="reports-date-calendar" value={dateRange.end} onChange={handleCalendarChange} />
        </div>
      </div>
      {/* 2. Nutritional Analysis */}
      <div className="reports-section">
        <div className="reports-section-title">Nutritional Analysis Report 🍽️</div>
        <div className="reports-metrics-row">
          <div className="reports-metric-card">{demoMetrics.calories} kcal<br /><span style={{ fontWeight: 400, fontSize: '1rem' }}>Avg Calories</span></div>
          <div className="reports-metric-card">{demoMetrics.protein}g<br /><span style={{ fontWeight: 400, fontSize: '1rem' }}>Avg Protein</span></div>
          <div className="reports-metric-card">{demoMetrics.carbs}g<br /><span style={{ fontWeight: 400, fontSize: '1rem' }}>Avg Carbs</span></div>
          <div className="reports-metric-card">{demoMetrics.fats}g<br /><span style={{ fontWeight: 400, fontSize: '1rem' }}>Avg Fats</span></div>
        </div>
        <div className="reports-chart-container">
          {/* Pie chart for macros (use react-chartjs-2) */}
          <div style={{ textAlign: 'center', color: '#888' }}>[Pie Chart: Macronutrient Ratio]</div>
        </div>
        <div className="reports-section-title" style={{ fontSize: '1.2rem', marginTop: 24 }}>Top Calorie Sources</div>
        <ul>
          {demoFoods.map((f, i) => (
            <li key={i}>{f.name}: {f.cals} kcal</li>
          ))}
        </ul>
        <div className="reports-chart-container">
          {/* Bar chart for micronutrients (use react-chartjs-2) */}
          <div style={{ textAlign: 'center', color: '#888' }}>[Bar Chart: Micronutrient Summary vs RDA]</div>
        </div>
      </div>
      {/* 3. Progress & Trends */}
      <div className="reports-section">
        <div className="reports-section-title">Progress & Trends Report 📈</div>
        <div className="reports-chart-container">
          {/* Line chart for weight trend (with trend line) */}
          <div style={{ textAlign: 'center', color: '#888' }}>[Line Chart: Weight Trend & Trend Line]</div>
        </div>
        <div className="reports-metrics-row">
          <div className="reports-metric-card">Waist: -2 cm</div>
          <div className="reports-metric-card">Hips: -1.5 cm</div>
        </div>
        <div className="reports-chart-container">
          {/* Overlay chart for calories vs weight */}
          <div style={{ textAlign: 'center', color: '#888' }}>[Overlay Chart: Calories vs Weight]</div>
        </div>
      </div>
      {/* 4. Adherence & Consistency */}
      <div className="reports-section">
        <div className="reports-section-title">Adherence & Consistency Report ✅</div>
        <div className="reports-metrics-row">
          <div className="reports-metric-card">{demoAdherence}%<br /><span style={{ fontWeight: 400, fontSize: '1rem' }}>Plan Adherence</span></div>
        </div>
        <div className="reports-chart-container">
          {/* Calendar view for meal logging */}
          <div style={{ textAlign: 'center', color: '#888' }}>[Calendar: Meal Logging Consistency]</div>
        </div>
        <div className="reports-metric-card" style={{ margin: '1.2rem 0' }}>
          Most Skipped Meal: <b>{demoSkippedMeal}</b>
        </div>
      </div>
      {/* 5. Download & Share */}
      <button className="reports-download-btn">Download as PDF</button>
    </div>
  );
}
