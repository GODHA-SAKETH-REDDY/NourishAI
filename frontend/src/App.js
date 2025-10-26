import './App.css';


import MainPage from './MainPage';
import Profile from './Profile';
import Signup from './Signup';
import Login from './Login';
import LandingPage from './LandingPage';


import React, { useState, useEffect } from 'react';



function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access'));
  const [page, setPage] = useState(() => !!localStorage.getItem('access') ? 'main' : 'landing');
  const [loggedMeals, setLoggedMeals] = useState(() => {
    try {
      const raw = localStorage.getItem('loggedMeals');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  const handleLogMeal = (meal) => {
    const newLoggedMeal = {
      ...meal,
      // keep original recipe id intact; use a separate localId for client cache
      date: new Date().toISOString(),
      localId: Date.now(),
    };
    setLoggedMeals((prevLoggedMeals) => [...prevLoggedMeals, newLoggedMeal]);
  };

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

  // Persist logged meals across refresh (offline-friendly)
  useEffect(() => {
    try {
      localStorage.setItem('loggedMeals', JSON.stringify(loggedMeals));
    } catch (e) {
      // ignore quota errors
    }
  }, [loggedMeals]);

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
            <MainPage setPage={setPage} page={page} onLogout={handleLogout} onLogMeal={handleLogMeal} loggedMeals={loggedMeals} />
          )}
        </main>
      </div>
    );
  }

  // Fallback (should not happen)
  return null;
}

export default App;
