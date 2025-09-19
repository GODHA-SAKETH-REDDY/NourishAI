import { FaAppleAlt } from "react-icons/fa";
import './MainPage.css';
import Onboarding from "./Onboarding";
import MealPlans from "./MealPlans";
import AIChat from "./AIChat";
import Tracking from "./Tracking";
import Community from "./Community";

import Reports from "./Reports";
import Profile from "./Profile";

export default function MainPage({ setPage, page, onLogout }) {
  let content;
  if (page === 'onboarding') content = <Onboarding onComplete={setPage} />;
  else if (page === 'mealplans') content = <MealPlans />;
  else if (page === 'aichat') content = <AIChat />;
  else if (page === 'tracking') content = <Tracking />;
  else if (page === 'community') content = <Community />;
  else if (page === 'reports') content = <Reports />;
  else if (page === 'profile') content = <Profile onBack={() => setPage('main')} />;
  else content = (
    <div className="main-content">
      <div className="main-left-col">
        <div className="main-hero">
          <span className="main-badge">AI-Powered Nutrition Assistant</span>
          <h1 className="main-title">Personalized, adaptive, and holistic meal planning</h1>
          <p className="main-desc">
            NourishAI learns your lifestyle, goals, and preferences to create evolving nutrition plans—backed by science, powered by AI, and designed for real life.
          </p>
          <div className="main-cta-row">
            <button className="main-cta main-cta-primary">Start free personalization</button>
            <button className="main-cta main-cta-secondary">Try the calculator</button>
          </div>
          <div className="main-feature-list">
            <span>Adaptive meal plans</span>
            <span>Grocery lists & recipes</span>
            <span>Wearable integrations</span>
            <span>Secure & private</span>
          </div>
        </div>
      </div>
      <div className="main-right-col">
        <div className="main-card">
          <div className="main-card-header">Today</div>
          <div className="main-card-meals">
            <div className="main-meal-row">
              <span>Breakfast</span>
              <span className="main-meal-bold">Oats & berries</span>
            </div>
            <div className="main-meal-row">
              <span>Lunch</span>
              <span className="main-meal-bold">Paneer bowl</span>
            </div>
            <div className="main-meal-row">
              <span>Snack</span>
              <span className="main-meal-bold">Greek yogurt</span>
            </div>
            <div className="main-meal-row">
              <span>Dinner</span>
              <span className="main-meal-bold">Salmon & rice</span>
            </div>
          </div>
          <div className="main-card-macros">
            <div className="main-card-header" style={{ marginBottom: '0.5rem' }}>Macros</div>
            <div className="main-macro-row">
              <span>Protein</span>
              <div className="main-macro-bar protein">
                <div className="main-macro-fill" style={{ width: '72%' }}></div>
              </div>
              <span className="main-macro-val">72%</span>
            </div>
            <div className="main-macro-row">
              <span>Carbs</span>
              <div className="main-macro-bar carbs">
                <div className="main-macro-fill" style={{ width: '54%' }}></div>
              </div>
              <span className="main-macro-val">54%</span>
            </div>
            <div className="main-macro-row">
              <span>Fat</span>
              <div className="main-macro-bar fat">
                <div className="main-macro-fill" style={{ width: '36%' }}></div>
              </div>
              <span className="main-macro-val">36%</span>
            </div>
          </div>
          <div className="main-card-calories">
            <div>
              Calories <span className="main-calories-val">1,987 kcal</span>
            </div>
            <div className="main-card-calories-note">Auto-adjusted after yesterday's workout</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="main-bg">
      <nav className="main-navbar">
        <div className="main-logo">
          <FaAppleAlt className="main-logo-icon" />
          NourishAI
        </div>
        <ul className="main-nav-links">
          <li onClick={() => setPage('onboarding')}>Onboarding</li>
          <li onClick={() => setPage('mealplans')}>Meal Plans</li>
          <li onClick={() => setPage('aichat')}>AI Chat</li>
          <li onClick={() => setPage('tracking')}>Tracking</li>
          <li onClick={() => setPage('community')}>Community</li>
          <li onClick={() => setPage('reports')}>Reports</li>
          <li onClick={() => setPage('profile')}>Profile</li>
        </ul>
        <div className="main-profile-dot" onClick={() => setPage('profile')} title="Profile"></div>
        <button className="main-logout-btn" onClick={onLogout} title="Logout">Logout</button>
      </nav>
      {content}
    </div>
  );
}
