// ═══════════════════════════════════════════════
// GLOBAL CONNECT — SUPABASE CLIENT
// Real database connection
// ═══════════════════════════════════════════════

const SUPABASE_URL = "https://nwpaujbduepemvipepsq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cGF1amJkdWVwZW12aXBlcHNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2OTQ2MDQsImV4cCI6MjA5NTI3MDYwNH0.HDH0YtQvSaxS-Jxx1L1_CRQ_72uKuEVitmzEY05fp3k";

// ── Headers ───────────────────────────────────
const headers = {
  "Content-Type":  "application/json",
  "apikey":        SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
};

// ── Auth helpers ──────────────────────────────
export const supabaseAuth = {
  async signUp(email, password, username, fullName) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY },
      body: JSON.stringify({
        email,
        password,
        data: { username, full_name: fullName },
      }),
    });
    return res.json();
  },

  async signIn(email, password) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async signOut(token) {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method:  "POST",
      headers: { ...headers, "Authorization": `Bearer ${token}` },
    });
  },

  async resetPassword(email) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  async getUser(token) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { ...headers, "Authorization": `Bearer ${token}` },
    });
    return res.json();
  },

  signInWithGoogle() {
    window.location.href = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${window.location.origin}`;
  },
};

// ── Database helpers ──────────────────────────
export const db = {
  // Generic select
  async select(table, query = "", token = null) {
    const authHeaders = token
      ? { ...headers, "Authorization": `Bearer ${token}` }
      : headers;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
      headers: { ...authHeaders, "Prefer": "return=representation" },
    });
    return res.json();
  },

  // Generic insert
  async insert(table, data, token = null) {
    const authHeaders = token
      ? { ...headers, "Authorization": `Bearer ${token}` }
      : headers;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method:  "POST",
      headers: { ...authHeaders, "Prefer": "return=representation" },
      body:    JSON.stringify(data),
    });
    return res.json();
  },

  // Generic update
  async update(table, query, data, token = null) {
    const authHeaders = token
      ? { ...headers, "Authorization": `Bearer ${token}` }
      : headers;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
      method:  "PATCH",
      headers: { ...authHeaders, "Prefer": "return=representation" },
      body:    JSON.stringify(data),
    });
    return res.json();
  },

  // Generic delete
  async delete(table, query, token = null) {
    const authHeaders = token
      ? { ...headers, "Authorization": `Bearer ${token}` }
      : headers;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
      method:  "DELETE",
      headers: authHeaders,
    });
    return res.ok;
  },

  // ── Specific helpers ────────────────────────

  // Get all posts with user profiles
  async getPosts(token) {
    return this.select(
      "posts",
      "select=*,profiles(id,username,full_name,avatar_url,cover_color,verified,location,online)&order=created_at.desc&limit=30",
      token
    );
  },

  // Create a post
  async createPost(content, userId, token) {
    return this.insert("posts", { content, user_id: userId }, token);
  },

  // Like a post
  async likePost(postId, userId, token) {
    return this.insert("likes", { post_id: postId, user_id: userId }, token);
  },

  // Unlike a post
  async unlikePost(postId, userId, token) {
    return this.delete("likes", `post_id=eq.${postId}&user_id=eq.${userId}`, token);
  },

  // Get likes for a post
  async getLikes(postId, token) {
    return this.select("likes", `post_id=eq.${postId}`, token);
  },

  // Add comment
  async addComment(postId, userId, content, token) {
    return this.insert("comments", { post_id: postId, user_id: userId, content }, token);
  },

  // Get comments for a post
  async getComments(postId, token) {
    return this.select(
      "comments",
      `post_id=eq.${postId}&select=*,profiles(username,full_name,avatar_url)&order=created_at.asc`,
      token
    );
  },

  // Get messages between two users
  async getMessages(userId, otherId, token) {
    return this.select(
      "messages",
      `or=(and(sender_id.eq.${userId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${userId}))&order=created_at.asc`,
      token
    );
  },

  // Send a message
  async sendMessage(senderId, receiverId, content, token) {
    return this.insert("messages", { sender_id: senderId, receiver_id: receiverId, content }, token);
  },

  // Get user profile
  async getProfile(userId, token) {
    const data = await this.select("profiles", `id=eq.${userId}`, token);
    return Array.isArray(data) ? data[0] : data;
  },

  // Update profile
  async updateProfile(userId, updates, token) {
    return this.update("profiles", `id=eq.${userId}`, updates, token);
  },

  // Get all users (for explore/suggestions)
  async getUsers(token) {
    return this.select("profiles", "select=*&order=followers_count.desc&limit=20", token);
  },

  // Follow a user
  async followUser(followerId, followingId, token) {
    return this.insert("follows", { follower_id: followerId, following_id: followingId }, token);
  },

  // Unfollow a user
  async unfollowUser(followerId, followingId, token) {
    return this.delete("follows", `follower_id=eq.${followerId}&following_id=eq.${followingId}`, token);
  },

  // Get notifications
  async getNotifications(userId, token) {
    return this.select(
      "notifications",
      `user_id=eq.${userId}&select=*,profiles!from_user_id(username,full_name,avatar_url)&order=created_at.desc&limit=20`,
      token
    );
  },

  // Mark notification as read
  async markNotificationRead(notifId, token) {
    return this.update("notifications", `id=eq.${notifId}`, { read: true }, token);
  },

  // Save data purchase
  async saveDataPurchase(data, token) {
    return this.insert("data_purchases", data, token);
  },

  // Get data purchases
  async getDataPurchases(userId, token) {
    return this.select(
      "data_purchases",
      `user_id=eq.${userId}&order=created_at.desc`,
      token
    );
  },

  // Save ad campaign
  async saveAdCampaign(data, token) {
    return this.insert("ad_campaigns", data, token);
  },

  // Get ad campaigns
  async getAdCampaigns(userId, token) {
    return this.select(
      "ad_campaigns",
      `user_id=eq.${userId}&order=created_at.desc`,
      token
    );
  },

  // Get wallet
  async getWallet(userId, token) {
    const data = await this.select("wallets", `user_id=eq.${userId}`, token);
    return Array.isArray(data) ? data[0] : null;
  },

  // Update wallet
  async updateWallet(userId, updates, token) {
    const existing = await this.getWallet(userId, token);
    if (existing) {
      return this.update("wallets", `user_id=eq.${userId}`, { ...updates, updated_at: new Date().toISOString() }, token);
    } else {
      return this.insert("wallets", { user_id: userId, ...updates }, token);
    }
  },

  // Create profile after signup
  async createProfile(userId, username, fullName, token) {
    return this.insert("profiles", {
      id:        userId,
      username,
      full_name: fullName,
      bio:       "",
      location:  "",
      online:    true,
    }, token);
  },
};

// ── Session helpers ───────────────────────────
export const session = {
  get token()  { return localStorage.getItem("gc_token"); },
  get user()   {
    try { return JSON.parse(localStorage.getItem("gc_user")); }
    catch { return null; }
  },
  set(token, user) {
    localStorage.setItem("gc_token", token);
    localStorage.setItem("gc_user", JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem("gc_token");
    localStorage.removeItem("gc_user");
    localStorage.removeItem("gc_profile");
  },
  get profile() {
    try { return JSON.parse(localStorage.getItem("gc_profile")); }
    catch { return null; }
  },
  setProfile(profile) {
    localStorage.setItem("gc_profile", JSON.stringify(profile));
  },
};

export { SUPABASE_URL, SUPABASE_KEY };
