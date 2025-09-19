import React from 'react';
import './LandingPage.css';

function LandingPage({ onSignup }) {
  return (
    <div className="compact-landing">
      <div className="compact-bg" />
      <div className="compact-content">
        <h1 className="compact-title">Your Personal AI Nutritionist</h1>
        <button className="compact-cta" onClick={onSignup}>Start Your Journey</button>
        <div className="compact-features">
          <div className="compact-feature">
            <img src="https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=80&q=80" alt="Personalized Plans" />
            <span>Personalized Plans</span>
          </div>
          <div className="compact-feature">
            <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=80&q=80" alt="AI Food Chatbot" />
            <span>AI Chatbot</span>
          </div>
          <div className="compact-feature">
            <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4dd.svg" alt="Meal Tracking" />
            <span>Meal Tracking</span>
          </div>
          <div className="compact-feature">
            <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=80&q=80" alt="Progress Monitoring" />
            <span>Progress Monitoring</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
