import React, { useState } from "react";
import "./Community.css";

// Demo/mock data
const demoUsers = [
  { username: "Priya", avatar: "https://randomuser.me/api/portraits/women/44.jpg", badges: ["1-Month Streak", "Community Helper"] },
  { username: "Rahul", avatar: "https://randomuser.me/api/portraits/men/32.jpg", badges: ["First 5 Kgs Lost"] },
];
const demoPosts = [
  {
    id: 1,
    user: demoUsers[0],
    content: "Down 2 kgs this week! The Grilled Paneer Salad recipe was amazing.",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
    likes: 12,
    liked: false,
    comments: [
      { user: demoUsers[1], text: "Congrats! That’s awesome progress!" },
    ],
    topic: "Weight Loss Journeys",
    date: "2025-09-14"
  },
  {
    id: 2,
    user: demoUsers[1],
    content: "Tried the Vegan Buddha Bowl today. Super filling and tasty!",
    image: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80",
    likes: 7,
    liked: true,
    comments: [],
    topic: "Vegetarian Recipes",
    date: "2025-09-13"
  }
];
const demoChallenges = [
  { name: "Hydration Hero", desc: "Drink 8 glasses of water daily for 7 days.", leaderboard: ["Priya", "Rahul", "Asha"] },
  { name: "Step Up Challenge", desc: "Most steps in a week!", leaderboard: ["Rahul", "Priya", "Asha"] },
  { name: "Meal Prep Master", desc: "Log 5 home-cooked meals in a week.", leaderboard: ["Asha", "Priya", "Rahul"] },
];
const demoGroups = [
  { name: "Weight Loss Warriors", desc: "Share your journey and tips!" },
  { name: "Indian Vegetarian Recipes", desc: "Swap your favorite veg recipes." },
  { name: "Managing PCOD/PCOS Together", desc: "Support and advice for PCOD/PCOS." },
  { name: "Hyderabad Foodies", desc: "Local healthy food finds in Hyderabad." },
];
const demoRecipes = [
  { name: "Grilled Paneer Salad", by: "Priya", likes: 8 },
  { name: "Vegan Buddha Bowl", by: "Rahul", likes: 5 },
];
const demoExpertAdvice = [
  { question: "How much protein do I need daily?", answer: "It depends on your weight and activity level, but a general guideline is 0.8-1g per kg of body weight." },
  { question: "Best snacks for weight loss?", answer: "Try roasted chana, Greek yogurt, or fruit with nut butter." },
];

export default function Community() {
  const [filter, setFilter] = useState("Trending");
  const [posts, setPosts] = useState(demoPosts);
  const [commentInputs, setCommentInputs] = useState({});

  // Filter logic
  const filteredPosts = posts.filter(
    p => filter === "Trending" || filter === "Newest" || p.topic === filter
  );

  // Like handler
  const handleLike = (id) => {
    setPosts(posts => posts.map(p => p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p));
  };

  // Comment handler
  const handleComment = (id) => {
    if (!commentInputs[id]) return;
    setPosts(posts => posts.map(p => p.id === id ? { ...p, comments: [...p.comments, { user: demoUsers[0], text: commentInputs[id] }] } : p));
    setCommentInputs(inputs => ({ ...inputs, [id]: "" }));
  };

  return (
    <div className="community-page">
      {/* 1. Community Feed */}
      <div className="community-section">
        <div className="community-section-title">Community Feed 🤝</div>
        <div className="community-feed-filters">
          {["Trending", "Newest", "Weight Loss Journeys", "Vegetarian Recipes"].map(f => (
            <button key={f} className={"community-feed-filter" + (filter === f ? " active" : "")} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
        {filteredPosts.map(post => (
          <div className="community-post" key={post.id}>
            <div className="community-post-header">
              <img src={post.user.avatar} alt="avatar" className="community-post-avatar" />
              <span className="community-post-username">{post.user.username}</span>
              <div className="community-post-badges">
                {post.user.badges && post.user.badges.map(b => <span className="community-post-badge" key={b}>{b}</span>)}
              </div>
              <span style={{ marginLeft: "auto", color: "#888", fontSize: 13 }}>{post.date}</span>
            </div>
            <div className="community-post-content">{post.content}</div>
            {post.image && <img src={post.image} alt="post" className="community-post-image" />}
            <div className="community-post-actions">
              <span className={"community-post-like" + (post.liked ? " liked" : "")} onClick={() => handleLike(post.id)}>
                ♥ {post.likes}
              </span>
            </div>
            <div className="community-post-comments">
              {post.comments.map((c, i) => (
                <div className="community-post-comment" key={i}>
                  <span className="community-post-comment-username">{c.user.username}:</span> {c.text}
                </div>
              ))}
              <div className="community-post-add-comment">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentInputs[post.id] || ""}
                  onChange={e => setCommentInputs(inputs => ({ ...inputs, [post.id]: e.target.value }))}
                  onKeyDown={e => { if (e.key === "Enter") handleComment(post.id); }}
                />
                <button onClick={() => handleComment(post.id)}>Post</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* 2. Challenges & Leaderboards */}
      <div className="community-section">
        <div className="community-section-title">Challenges & Leaderboards 🏆</div>
        <div className="community-challenges-row">
          {demoChallenges.map((ch, i) => (
            <div className="community-challenge-card" key={i}>
              <div style={{ fontWeight: 800, color: "#23d5ab", fontSize: "1.15rem" }}>{ch.name}</div>
              <div style={{ color: "#232526", margin: "0.5rem 0 1rem 0" }}>{ch.desc}</div>
              <div className="community-leaderboard">
                <div className="community-leaderboard-title">Leaderboard</div>
                {ch.leaderboard.map((u, j) => (
                  <div key={j} style={{ fontWeight: 700, color: j === 0 ? "#fda085" : "#23d5ab" }}>{j + 1}. {u}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* 3. Groups/Forums */}
      <div className="community-section">
        <div className="community-section-title">Groups & Forums 💬</div>
        <div className="community-groups-row">
          {demoGroups.map((g, i) => (
            <div className="community-group-card" key={i}>
              <div style={{ fontWeight: 800, color: "#23d5ab", fontSize: "1.1rem" }}>{g.name}</div>
              <div style={{ color: "#232526", marginTop: 6 }}>{g.desc}</div>
            </div>
          ))}
        </div>
      </div>
      {/* 4. User Profiles & Badges */}
      <div className="community-section">
        <div className="community-section-title">User Profiles & Badges ⭐</div>
        {demoUsers.map((u, i) => (
          <div className="community-user-profile" key={i}>
            <img src={u.avatar} alt="avatar" className="community-user-avatar" />
            <div className="community-user-info">
              <div style={{ fontWeight: 800, color: "#23d5ab", fontSize: "1.1rem" }}>{u.username}</div>
              <div className="community-user-badges">
                {u.badges.map(b => <span className="community-user-badge" key={b}>{b}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* 5. Recipe Sharing & Expert Advice */}
      <div className="community-section">
        <div className="community-section-title">Recipe Sharing & Expert Advice 🧑‍🍳</div>
        <div className="community-recipes-row">
          {demoRecipes.map((r, i) => (
            <div className="community-recipe-card" key={i}>
              <div style={{ fontWeight: 800, color: "#23d5ab", fontSize: "1.1rem" }}>{r.name}</div>
              <div style={{ color: "#232526", marginTop: 6 }}>By {r.by}</div>
              <div style={{ color: "#fda085", fontWeight: 700, marginTop: 8 }}>♥ {r.likes}</div>
            </div>
          ))}
        </div>
        <div className="community-expert-advice">
          <div style={{ fontWeight: 800, color: "#23d5ab", fontSize: "1.1rem", marginBottom: 8 }}>Ask a Nutritionist (Premium)</div>
          {demoExpertAdvice.map((qa, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <b>Q:</b> {qa.question}<br />
              <b style={{ color: "#fda085" }}>A:</b> {qa.answer}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
