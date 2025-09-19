

import './App.css';


import MainPage from './MainPage';
import Profile from './Profile';
import Onboarding from './Onboarding';
import MealPlans from './MealPlans';
import AIChat from './AIChat';
import Tracking from './Tracking';
import Community from './Community';
import Reports from './Reports';
// removed duplicate useState import
import Signup from './Signup';
import Login from './Login';
import RecipeBrowser from './RecipeBrowser';
import FoodLog from './FoodLog';
import LandingPage from './LandingPage';
import logo from './logo.svg';


import React, { useState } from 'react';



function App() {
  const [profileId, setProfileId] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access'));
  const [page, setPage] = useState(() => !!localStorage.getItem('access') ? 'main' : 'landing');

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setIsLoggedIn(false);
    setShowLogin(false);
    setShowSignup(false);
    setPage('landing');
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setShowLogin(false);
    setShowSignup(false);
    setPage('main');
  };

  // Always show landing page first if not logged in
  if (!isLoggedIn && !showLogin && !showSignup && page === 'landing') {
    return (
      <div className="App">
        <LandingPage onLogin={() => setShowLogin(true)} onSignup={() => setShowSignup(true)} />
        <footer className="footer">
          &copy; {new Date().getFullYear()} AI Nutritionist Platform &mdash; Eat smart. Live better.
        </footer>
      </div>
    );
  }

  // Show signup page
  if (showSignup && !isLoggedIn) {
    return (
      <div className="App">
        <main>
          <section className="card fade-in">
            <Signup
              onSignup={() => { setShowSignup(false); setShowLogin(true); }}
              onShowLogin={() => { setShowSignup(false); setShowLogin(true); }}
            />
          </section>
        </main>
      </div>
    );
  }

  // Show login page
  if (showLogin && !isLoggedIn) {
    return (
      <div className="App">
        <main>
          <section className="card fade-in"><Login onLogin={handleLogin} /></section>
        </main>
      </div>
    );
  }

  // Show main app after login
  if (isLoggedIn) {
    return (
      <div className="App">
        <main>
          {page === 'profile' ? (
            <Profile onBack={() => setPage('main')} />
          ) : (
            <MainPage setPage={setPage} page={page} onLogout={handleLogout} />
          )}
        </main>
      </div>
    );
  }

  // Fallback (should not happen)
  return null;
}

export default App;
