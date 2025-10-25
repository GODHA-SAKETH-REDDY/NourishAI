import React, { useState, useEffect } from 'react';
import './Tracking.css';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const TrackingPage = () => {
    const [progressData, setProgressData] = useState({
        totalLost: 0,
        currentStreak: 0,
        nextGoal: 0,
        weightHistory: [],
        measurementsHistory: []
    });

    const [loggedMeals, setLoggedMeals] = useState([]);

    useEffect(() => {
        // Fetch progress data from backend API
        const fetchProgressData = async () => {
            try {
                const response = await fetch('http://localhost:8000/user/tracking/1/'); // Corrected API endpoint
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setProgressData(data);
            } catch (error) {
                console.error('Error fetching progress data:', error);
            }
        };

        // Fetch logged meals from backend API
        const fetchLoggedMeals = async () => {
            try {
                const response = await fetch('http://localhost:8000/user/meals/1/'); // Corrected API endpoint for meals
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setLoggedMeals(data);
            } catch (error) {
                console.error('Error fetching logged meals:', error);
            }
        };

        fetchProgressData();
        fetchLoggedMeals();
    }, []);

    const weightChartData = {
        labels: progressData.weightHistory?.map((entry) => entry.date) || [],
        datasets: [
            {
                label: 'Weight (kg)',
                data: progressData.weightHistory?.map((entry) => entry.weight) || [],
                borderColor: 'green',
                backgroundColor: 'rgba(0, 255, 0, 0.2)',
            },
        ],
    };

    const measurementsChartData = {
        labels: progressData.measurementsHistory?.map((entry) => entry.date) || [],
        datasets: [
            {
                label: 'Waist (cm)',
                data: progressData.measurementsHistory?.map((entry) => entry.waist) || [],
                borderColor: 'orange',
                backgroundColor: 'rgba(255, 165, 0, 0.2)',
            },
            {
                label: 'Hips (cm)',
                data: progressData.measurementsHistory?.map((entry) => entry.hips) || [],
                borderColor: 'blue',
                backgroundColor: 'rgba(0, 0, 255, 0.2)',
            },
        ],
    };

    if (!loggedMeals || loggedMeals.length === 0) {
        return <div className="tracking-page">No meals logged yet.</div>;
    }

    return (
        <div className="tracking-page">
            <h1>Progress Overview</h1>
            <div className="progress-summary">
                <div className="progress-item">
                    <h2>{progressData.totalLost} kg</h2>
                    <p>Total Lost</p>
                </div>
                <div className="progress-item">
                    <h2>{progressData.currentStreak} Days</h2>
                    <p>Current Streak</p>
                </div>
                <div className="progress-item">
                    <h2>{progressData.nextGoal} kg</h2>
                    <p>to Next Goal</p>
                </div>
            </div>
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
                {loggedMeals.map((meal) => (
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