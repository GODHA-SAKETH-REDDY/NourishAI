import React, { useState, useRef, useEffect } from "react";
import './AIChat.css';
import { fetchUserProfile, fetchMealPlan, fetchRecipes, fetchRecipeDetail } from './api';
import { fetchLLMResponse } from './llm';

const WELCOME = {
  ai: "Hi Alex! I'm your personal nutrition assistant. Ask me anything about your meal plan, or for a healthy snack suggestion!"
};
const QUICK_REPLIES = [
  "Can I swap my lunch?",
  "Suggest a healthy snack.",
  "How many calories are left today?"
];

const USER_ID = 1; // TODO: Replace with real user ID from auth/session

export default function AIChat() {
  const [messages, setMessages] = useState([
    { from: 'ai', text: WELCOME.ai }
  ]);
  const [input, setInput] = useState("");
  const [showQuick, setShowQuick] = useState(true);
  const [profile, setProfile] = useState(null);
  const [mealPlan, setMealPlan] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Fetch user profile and meal plan on mount
    fetchUserProfile(USER_ID).then(setProfile).catch(() => {});
    fetchMealPlan(USER_ID).then(setMealPlan).catch(() => {});
  }, []);

  async function sendMessage(text) {
    if (!text.trim()) return;
    setMessages(msgs => [...msgs, { from: 'user', text }]);
    setInput("");
    setShowQuick(false);
    // AI logic: try to answer with real data
    const aiText = await getAIResponse(text, { profile, mealPlan });
    setMessages(msgs => [...msgs, { from: 'ai', text: aiText }]);
  }

  function handleInputKey(e) {
    if (e.key === 'Enter') sendMessage(input);
  }

  function handleQuickReply(q) {
    sendMessage(q);
  }

  return (
    <div className="aichat-container">
      <div className="aichat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`aichat-message ${msg.from}`}>
            <div className="aichat-bubble">{msg.text}</div>
          </div>
        ))}
        {showQuick && (
          <div>
            <div className="aichat-welcome">{WELCOME.ai}</div>
            <div className="aichat-quick-replies">
              {QUICK_REPLIES.map((q, i) => (
                <button key={i} className="aichat-quick-reply-btn" onClick={() => handleQuickReply(q)}>{q}</button>
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="aichat-input-row">
        <input
          className="aichat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleInputKey}
          placeholder="Type your message..."
        />
        <button className="aichat-send-btn" onClick={() => sendMessage(input)}>Send</button>
      </div>
    </div>
  );
}

// AI logic using real data
async function getAIResponse(text, { profile, mealPlan }) {
  text = text.toLowerCase();
  if (!profile || !mealPlan) return "Loading your data... Please try again in a moment.";
  // Try keyword-based logic first
  if (text.includes("swap") && text.includes("lunch")) {
    const lunchOptions = mealPlan.meals.lunch || [];
    // Show recipe names, not objects
    const lunchNames = lunchOptions.map(m => m.name || m.title || JSON.stringify(m));
    return `Sure! Here are some lunch options for you: ${lunchNames.join(', ')}.`;
  }
  if (text.includes("snack")) {
    const snacks = mealPlan.meals.snacks || [];
    const snackNames = snacks.map(m => m.name || m.title || JSON.stringify(m));
    return `You have about 300 calories left for a snack. Try: ${snackNames.join(', ')}.`;
  }
  if (text.includes("calories") && text.includes("left")) {
    return `You have ${mealPlan.calories} calories for today. Protein: ${mealPlan.protein_g}g, Carbs: ${mealPlan.carbs_g}g, Fats: ${mealPlan.fats_g}g.`;
  }
  if (text.includes("how do i make") || text.includes("recipe for")) {
    const match = text.match(/(?:make|recipe for) (.+)/);
    if (match && match[1]) {
      const name = match[1].replace(/\?$/, '').trim();
      const recipes = await fetchRecipes(name);
      if (recipes.length > 0) {
        const detail = await fetchRecipeDetail(recipes[0].id);
        return `Here are the steps for ${detail.name}:\n${detail.instructions || detail.steps || 'Recipe steps not available.'}`;
      }
      return `Sorry, I couldn't find a recipe for ${name}.`;
    }
  }
  if (text.includes("how am i doing") || text.includes("progress")) {
    return `You're on track! Your goal: ${profile.goal}. Calories today: ${mealPlan.calories}. Protein: ${mealPlan.protein_g}g.`;
  }
  // If not matched, call LLM API
  try {
    const contextMsgs = [
      { from: 'system', text: `You are a helpful nutrition assistant. User's goal: ${profile.goal}. Dietary preferences: ${profile.dietary_preferences || 'none'}. Allergies: ${profile.allergies || 'none'}.` },
      { from: 'user', text }
    ];
    const llmReply = await fetchLLMResponse(contextMsgs);
    if (!llmReply || llmReply.trim().length < 2) {
      console.warn('Gemini LLM returned empty or invalid response:', llmReply);
      return "I'm here to help with anything about your meal plan, nutrition, or recipes!";
    }
    return llmReply;
  } catch (e) {
    console.error('Gemini LLM error:', e);
    // fallback if LLM fails
    return "I'm here to help with anything about your meal plan, nutrition, or recipes!";
  }
}
