/* ═══════════════════════════════════════════════════════════════
   GLOBAL CONNECT — API CONFIGURATION
   YouTube · NewsAPI · Deezer Music
   All free tiers — no credit card needed

   HOW TO GET YOUR FREE API KEYS:
   ─────────────────────────────────
   1. YOUTUBE API KEY (Free — 10,000 requests/day)
      → Go to: console.cloud.google.com
      → Create a project
      → Enable "YouTube Data API v3"
      → Create credentials → API Key
      → Copy and paste below

   2. NEWS API KEY (Free — 100 requests/day)
      → Go to: newsapi.org
      → Click "Get API Key"
      → Sign up free
      → Copy and paste below

   3. DEEZER API (Completely Free — No key needed!)
      → Works immediately out of the box
      → No signup required
═══════════════════════════════════════════════════════════════ */

// ── YouTube Data API v3 ───────────────────────────────────────────
// Get free key at: console.cloud.google.com
export const YOUTUBE_API_KEY = "AIzaSyAMsSEsNUL9xZLj_0p1dydRrndWOf_7Y34";
export const YOUTUBE_BASE    = "https://www.googleapis.com/youtube/v3";

// Search African content on YouTube
export const youtubeAPI = {
  // Search videos
  async search(query, maxResults = 10) {
    try {
      const res = await fetch(
        `${YOUTUBE_BASE}/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=${maxResults}&type=video&regionCode=KE&key=${YOUTUBE_API_KEY}`
      );
      const data = await res.json();
      return data.items || [];
    } catch { return []; }
  },

  // Get trending videos in Africa
  async trending(maxResults = 20) {
    try {
      const res = await fetch(
        `${YOUTUBE_BASE}/videos?part=snippet,statistics&chart=mostPopular&regionCode=KE&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
      );
      const data = await res.json();
      return data.items || [];
    } catch { return []; }
  },

  // Get African music videos
  async africanMusic(maxResults = 15) {
    return this.search("African music 2026 Kenya Nigeria Ghana", maxResults);
  },

  // Get African news videos
  async africanNews(maxResults = 10) {
    return this.search("Africa news today 2026", maxResults);
  },

  // Format video for display
  formatVideo(item) {
    const isSearch = item.id?.videoId;
    return {
      id:          isSearch ? item.id.videoId : item.id,
      title:       item.snippet?.title || "",
      description: item.snippet?.description || "",
      thumbnail:   item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url || "",
      channel:     item.snippet?.channelTitle || "",
      publishedAt: item.snippet?.publishedAt || "",
      viewCount:   item.statistics?.viewCount || "0",
      likeCount:   item.statistics?.likeCount || "0",
      url:         `https://www.youtube.com/watch?v=${isSearch ? item.id.videoId : item.id}`,
      embedUrl:    `https://www.youtube.com/embed/${isSearch ? item.id.videoId : item.id}`,
    };
  },
};

// ── News API ──────────────────────────────────────────────────────
// Get free key at: newsapi.org
export const NEWS_API_KEY  = "801667a8e3194f919065fd3f09b112c5";
export const NEWS_BASE     = "https://newsapi.org/v2";

export const newsAPI = {
  // Get top headlines for Africa
  async africanHeadlines(pageSize = 20) {
    try {
      const res = await fetch(
        `${NEWS_BASE}/everything?q=Africa+Kenya+Nigeria+Ghana&sortBy=publishedAt&pageSize=${pageSize}&language=en&apiKey=${NEWS_API_KEY}`
      );
      const data = await res.json();
      return data.articles || [];
    } catch { return []; }
  },

  // Get trending topics by category
  async byCategory(category = "technology", pageSize = 10) {
    try {
      const res = await fetch(
        `${NEWS_BASE}/top-headlines?category=${category}&pageSize=${pageSize}&language=en&apiKey=${NEWS_API_KEY}`
      );
      const data = await res.json();
      return data.articles || [];
    } catch { return []; }
  },

  // Search news
  async search(query, pageSize = 10) {
    try {
      const res = await fetch(
        `${NEWS_BASE}/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`
      );
      const data = await res.json();
      return data.articles || [];
    } catch { return []; }
  },

  // Format article for display
  formatArticle(article) {
    return {
      id:          article.url,
      title:       article.title || "",
      description: article.description || "",
      image:       article.urlToImage || "",
      source:      article.source?.name || "",
      author:      article.author || "",
      publishedAt: article.publishedAt || "",
      url:         article.url || "",
      content:     article.content || "",
    };
  },
};

// ── Deezer Music API (No key needed!) ────────────────────────────
export const DEEZER_BASE = "https://api.deezer.com";

export const deezerAPI = {
  // Search tracks
  async search(query, limit = 20) {
    try {
      const res = await fetch(
        `https://corsproxy.io/?${encodeURIComponent(`${DEEZER_BASE}/search?q=${encodeURIComponent(query)}&limit=${limit}`)}`
      );
      const data = await res.json();
      return data.data || [];
    } catch { return []; }
  },

  // Get African music charts
  async africanChart(limit = 20) {
    return this.search("afrobeats amapiano bongo flava", limit);
  },

  // Get Kenyan music
  async kenyanMusic(limit = 15) {
    return this.search("Kenya music gengetone", limit);
  },

  // Get Nigerian music
  async nigerianMusic(limit = 15) {
    return this.search("Nigeria afrobeats 2026", limit);
  },

  // Get Ghanaian music
  async ghanaianMusic(limit = 15) {
    return this.search("Ghana highlife afrobeats", limit);
  },

  // Format track for display
  formatTrack(track) {
    return {
      id:       track.id,
      title:    track.title || "",
      artist:   track.artist?.name || "",
      album:    track.album?.title || "",
      cover:    track.album?.cover_medium || track.album?.cover || "",
      preview:  track.preview || "", // 30 second preview URL
      duration: track.duration || 0,
      rank:     track.rank || 0,
      url:      track.link || "",
    };
  },
};

// ── Fallback data (when APIs are not configured) ──────────────────
export const FALLBACK_VIDEOS = [
  { id:"1", title:"African Tech Revolution 2026 🌍", channel:"TechAfrica", thumbnail:"", viewCount:"125000", description:"How African startups are changing the world" },
  { id:"2", title:"Best of Afrobeats 2026 🎵", channel:"AfrobeatsTV", thumbnail:"", viewCount:"890000", description:"Top African music hits this year" },
  { id:"3", title:"Nairobi Street Food Guide 🍲", channel:"FoodieKenya", thumbnail:"", viewCount:"234000", description:"Best street food spots in Nairobi" },
  { id:"4", title:"Lagos to Accra Travel Vlog ✈️", channel:"AfriTravel", thumbnail:"", viewCount:"445000", description:"Epic road trip across West Africa" },
  { id:"5", title:"African Fashion Week Highlights 👗", channel:"AfriStyle", thumbnail:"", viewCount:"678000", description:"Best looks from this year's fashion week" },
];

export const FALLBACK_NEWS = [
  { id:"1", title:"M-Pesa Expands to 5 New African Countries", source:"TechCrunch Africa", description:"Safaricom's mobile money platform reaches new markets", image:"", publishedAt:"2026-05-29", url:"#" },
  { id:"2", title:"Kenya Becomes Africa's Top Tech Hub in 2026", source:"Business Daily Africa", description:"Silicon Savannah attracts record investment", image:"", publishedAt:"2026-05-29", url:"#" },
  { id:"3", title:"Afrobeats Breaks Global Streaming Records", source:"Music Africa", description:"African artists dominate global music charts", image:"", publishedAt:"2026-05-28", url:"#" },
  { id:"4", title:"Pan-African Free Trade Zone Shows Results", source:"African Business", description:"Trade volumes increase by 40% across the continent", image:"", publishedAt:"2026-05-28", url:"#" },
  { id:"5", title:"African Youth Entrepreneurship on the Rise", source:"Forbes Africa", description:"18-25 age group leads startup creation across Africa", image:"", publishedAt:"2026-05-27", url:"#" },
];

export const FALLBACK_MUSIC = [
  { id:"1", title:"Essence (2026 Mix)", artist:"Wizkid ft Tems", cover:"", preview:"", duration:214 },
  { id:"2", title:"Amapiano Vibes", artist:"DJ Maphorisa", cover:"", preview:"", duration:187 },
  { id:"3", title:"Bongo Flava Hits", artist:"Diamond Platnumz", cover:"", preview:"", duration:234 },
  { id:"4", title:"Gengetone Classics", artist:"Ethic Entertainment", cover:"", preview:"", duration:198 },
  { id:"5", title:"Highlife Gold", artist:"Sarkodie", cover:"", preview:"", duration:221 },
  { id:"6", title:"Afro Gospel", artist:"Sinach", cover:"", preview:"", duration:265 },
];

// ── Check if APIs are configured ─────────────────────────────────
export const isYouTubeConfigured = () => YOUTUBE_API_KEY !== "YOUR_YOUTUBE_API_KEY_HERE";
export const isNewsConfigured    = () => NEWS_API_KEY    !== "YOUR_NEWS_API_KEY_HERE";
