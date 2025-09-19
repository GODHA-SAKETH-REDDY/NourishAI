
import React, { useState, useEffect } from "react";
import "./Profile.css";
import { fetchUserProfile, updateUserProfile } from "./api";


// Helper to get userId from localStorage or props
function getUserId() {
  return localStorage.getItem('userId') || '1'; // fallback to 1 for demo
}



export default function Profile({ onBack }) {
  const [user, setUser] = useState(null);
  const [edit, setEdit] = useState(false);
  const [editFields, setEditFields] = useState({ username: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = getUserId();

  useEffect(() => {
    setLoading(true);
    fetchUserProfile(userId)
      .then(data => {
        setUser(data);
        setEditFields({ username: data.username, email: data.email });
        setLoading(false);
      })
      .catch(e => {
        setError('Failed to load profile');
        setLoading(false);
      });
  }, [userId]);

  const handleEdit = () => setEdit(true);
  const handleSave = async () => {
    try {
      setLoading(true);
      const updated = await updateUserProfile(userId, editFields);
      setUser(updated);
      setEdit(false);
      setLoading(false);
    } catch (e) {
      setError('Failed to update profile');
      setLoading(false);
    }
  };

  if (loading) return <div className="profile-page"><div>Loading...</div></div>;
  if (error) return <div className="profile-page"><div>{error}</div><button onClick={onBack}>Back</button></div>;
  if (!user) return <div className="profile-page"><div>No user data</div><button onClick={onBack}>Back</button></div>;

  return (
    <div className="profile-page">
      <button className="profile-back-btn" style={{marginBottom: '1rem'}} onClick={onBack}>&larr; Back</button>
      <div className="profile-card">
        <img
          src={user.avatar && user.avatar.trim() ? user.avatar : "https://api.dicebear.com/7.x/bottts/svg?seed=GoodBoyDog"}
          alt="avatar"
          className="profile-avatar"
        />
        {edit ? (
          <div className="profile-edit-fields">
            <input
              type="text"
              value={editFields.username}
              onChange={e => setEditFields(f => ({ ...f, username: e.target.value }))}
              placeholder="Username"
            />
            <input
              type="email"
              value={editFields.email}
              onChange={e => setEditFields(f => ({ ...f, email: e.target.value }))}
              placeholder="Email"
            />
          </div>
        ) : (
          <>
            <div className="profile-username">{user.username}</div>
            <div className="profile-email">{user.email}</div>
            <div className="profile-section-title"><span className="icon">👤</span> Personal Info</div>
            <div className="profile-info-row">
              <div><span className="icon">🎂</span><b>Age:</b> {user.age}</div>
              <div><span className="icon">⚧️</span><b>Gender:</b> {user.gender}</div>
            </div>
            <div className="profile-info-row">
              <div><span className="icon">📏</span><b>Height:</b> {user.height_cm} cm</div>
              <div><span className="icon">⚖️</span><b>Weight:</b> {user.weight_kg} kg</div>
            </div>
            <div className="profile-section-title"><span className="icon">🏃‍♂️</span> Lifestyle & Preferences</div>
            <div className="profile-info-row">
              <div><span className="icon">🔥</span><b>Activity:</b> {user.activity_level}</div>
              <div><span className="icon">🥗</span><b>Diet:</b> {user.dietary_preferences}</div>
            </div>
            <div className="profile-info-row">
              <div><span className="icon">🚫</span><b>Allergies:</b> {user.restrictions_allergies}</div>
              <div><span className="icon">🍽️</span><b>Cuisine:</b> {user.cuisine_preferences}</div>
            </div>
            <div className="profile-section-title"><span className="icon">🎯</span> Goals & Health</div>
            <div className="profile-info-row">
              <div><span className="icon">🎯</span><b>Goals:</b> {user.goals}</div>
            </div>
            {user.health_data && (
              <div className="profile-info-row"><span className="icon">🩺</span><b>Health Data:</b> {user.health_data}</div>
            )}
          </>
        )}
        <div className="profile-badges">
          {user.badges && user.badges.map(b => <span className="profile-badge" key={b}>{b}</span>)}
        </div>
        <div className="profile-stats-row">
          <div className="profile-stat-card">{user.stats?.weight} kg<br /><span style={{ fontWeight: 400, fontSize: '1rem' }}>Current Weight</span></div>
          <div className="profile-stat-card">{user.stats?.streak} days<br /><span style={{ fontWeight: 400, fontSize: '1rem' }}>Streak</span></div>
          <div className="profile-stat-card">-{user.stats?.totalLost} kg<br /><span style={{ fontWeight: 400, fontSize: '1rem' }}>Total Lost</span></div>
        </div>
        {edit ? (
          <button className="profile-save-btn" onClick={handleSave}>Save</button>
        ) : (
          <button className="profile-edit-btn" onClick={handleEdit}>Edit Profile</button>
        )}
      </div>
    </div>
  );
}
