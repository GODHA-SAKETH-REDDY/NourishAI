import React, { useEffect, useState } from "react";
import "./Community.css";
import { fetchCommunityPosts, toggleLikePost, createCommunityComment, createCommunityPost } from "./api";

// Demo/mock data
const demoUsers = [
  { username: "Priya", avatar: "https://randomuser.me/api/portraits/women/44.jpg", badges: ["1-Month Streak", "Community Helper"] },
  { username: "Rahul", avatar: "https://randomuser.me/api/portraits/men/32.jpg", badges: ["First 5 Kgs Lost"] },
];
// Feed is fetched from backend; demo arrays for other sections remain
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
  const [posts, setPosts] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newPost, setNewPost] = useState({ content: "", image_url: "", topic: "" });

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const sort = filter === "Trending" ? "trending" : undefined;
        const topic = filter;
        const data = await fetchCommunityPosts({ filter: topic, sort });
        if (!active) return;
        setPosts(Array.isArray(data) ? data : []);
      } catch (e) {
        if (active) setError("Failed to load posts");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [filter]);

  // Like handler
  const handleLike = (id) => {
    // optimistic update
    setPosts(ps => ps.map(p => p.id === id ? { ...p, liked: !p.liked, likes_count: (p.likes_count || 0) + (p.liked ? -1 : 1) } : p));
    toggleLikePost(id).then((updated) => {
      setPosts(ps => ps.map(p => p.id === id ? { ...p, liked: updated.liked, likes_count: updated.likes_count } : p));
    }).catch(() => {
      // revert on error
      setPosts(ps => ps.map(p => p.id === id ? { ...p, liked: !p.liked, likes_count: (p.likes_count || 0) + (p.liked ? -1 : 1) } : p));
    });
  };

  const handleCreatePost = async () => {
    const content = newPost.content.trim();
    if (!content) return;
    try {
      const created = await createCommunityPost({
        content,
        image_url: newPost.image_url || undefined,
        topic: newPost.topic || undefined,
      });
      setNewPost({ content: "", image_url: "", topic: "" });
      // Prepend new post
      setPosts(ps => [created, ...ps]);
    } catch (e) {
      setError("Failed to create post");
    }
  };

  // Comment handler
  const handleComment = async (id) => {
    const text = (commentInputs[id] || "").trim();
    if (!text) return;
    try {
      const newComment = await createCommunityComment(id, text);
      setPosts(ps => ps.map(p => p.id === id ? { ...p, comments: [...(p.comments || []), newComment] } : p));
      setCommentInputs(inputs => ({ ...inputs, [id]: "" }));
    } catch (e) {
      // optionally set error UI
    }
  };

  return (
    <div className="community-page">
      {/* 1. Community Feed */}
      <div className="community-section">
        <div className="community-section-title">Community Feed 🤝</div>
        {/* Create new post */}
        <div className="community-post" style={{ background: 'rgba(255,255,255,0.9)' }}>
          <div style={{ fontWeight: 700, color: '#23d5ab', marginBottom: 8 }}>Share something with the community</div>
          <textarea
            rows={3}
            placeholder="What's on your mind?"
            value={newPost.content}
            onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))}
            style={{ width: '100%', borderRadius: 8, border: '1px solid #e7f6ef', padding: 8 }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input
              type="text"
              placeholder="Image URL (optional)"
              value={newPost.image_url}
              onChange={e => setNewPost(p => ({ ...p, image_url: e.target.value }))}
              style={{ flex: 1, borderRadius: 8, border: '1px solid #e7f6ef', padding: 8 }}
            />
            <select
              value={newPost.topic}
              onChange={e => setNewPost(p => ({ ...p, topic: e.target.value }))}
              style={{ borderRadius: 8, border: '1px solid #e7f6ef', padding: 8 }}
            >
              <option value="">Topic (optional)</option>
              <option value="Weight Loss Journeys">Weight Loss Journeys</option>
              <option value="Vegetarian Recipes">Vegetarian Recipes</option>
            </select>
            <button onClick={handleCreatePost} className="community-feed-filter" style={{ whiteSpace: 'nowrap' }}>Post</button>
          </div>
        </div>
        <div className="community-feed-filters">
          {["Trending", "Newest", "Weight Loss Journeys", "Vegetarian Recipes"].map(f => (
            <button key={f} className={"community-feed-filter" + (filter === f ? " active" : "")} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
        {loading && <div style={{padding: '0.5rem 0'}}>Loading posts…</div>}
        {error && <div style={{color:'#b00020', padding:'0.5rem 0'}}>{error}</div>}
        {!loading && posts.length === 0 && (
          <div style={{padding:'0.5rem 0'}}>No posts yet. Be the first to share!</div>
        )}
        {posts.map(post => (
          <div className="community-post" key={post.id}>
            <div className="community-post-header">
              <img src={post.user?.avatar || "https://ui-avatars.com/api/?background=23d5ab&color=fff&name=" + encodeURIComponent(post.user?.username || "U")} alt="avatar" className="community-post-avatar" />
              <span className="community-post-username">{post.user?.username || "User"}</span>
              <div className="community-post-badges"></div>
              <span style={{ marginLeft: "auto", color: "#888", fontSize: 13 }}>{new Date(post.created_at).toLocaleDateString()}</span>
            </div>
            <div className="community-post-content">{post.content}</div>
            {post.image_url && <img src={post.image_url} alt="post" className="community-post-image" />}
            <div className="community-post-actions">
              <span className={"community-post-like" + (post.liked ? " liked" : "")} onClick={() => handleLike(post.id)}>
                ♥ {post.likes_count || 0}
              </span>
            </div>
            <div className="community-post-comments">
              {(post.comments || []).map((c, i) => (
                <div className="community-post-comment" key={i}>
                  <span className="community-post-comment-username">{c.user?.username || "User"}:</span> {c.text}
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
