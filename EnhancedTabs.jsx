import { useState, useEffect, useRef } from "react";
import {
  youtubeAPI, newsAPI, deezerAPI,
  FALLBACK_VIDEOS, FALLBACK_NEWS, FALLBACK_MUSIC,
  isYouTubeConfigured, isNewsConfigured,
} from "./apiConfig";

/* ═══════════════════════════════════════════════════════════════
   GLOBAL CONNECT — ENHANCED TABS
   ReelsTab    → Real YouTube videos
   ExploreTab  → Real African news + trending
   MusicTab    → Real African music via Deezer
═══════════════════════════════════════════════════════════════ */

const FF = "'Sora', sans-serif";

// ── Helpers ───────────────────────────────────────────────────────
const fmtViews = (n) => {
  const num = parseInt(n) || 0;
  if (num >= 1000000) return `${(num/1000000).toFixed(1)}M`;
  if (num >= 1000)    return `${(num/1000).toFixed(1)}K`;
  return num.toString();
};
const fmtDur = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff/3600000);
  if (h < 1)  return "Just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
};

// ── Loading Spinner ───────────────────────────────────────────────
const Loader = ({ text = "Loading…" }) => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 20px", gap:12 }}>
    <div style={{ width:32, height:32, borderRadius:"50%", border:"3px solid rgba(0,212,168,0.2)", borderTop:"3px solid #00D4A8", animation:"spin 0.8s linear infinite" }} />
    <div style={{ color:"rgba(255,255,255,0.4)", fontSize:13, fontFamily:FF }}>{text}</div>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

// ── Empty State ───────────────────────────────────────────────────
const Empty = ({ icon, text, sub }) => (
  <div style={{ textAlign:"center", padding:"40px 20px" }}>
    <div style={{ fontSize:40, marginBottom:12 }}>{icon}</div>
    <div style={{ color:"rgba(255,255,255,0.5)", fontSize:14, fontFamily:FF, fontWeight:700, marginBottom:6 }}>{text}</div>
    <div style={{ color:"rgba(255,255,255,0.28)", fontSize:12, fontFamily:FF, lineHeight:1.6 }}>{sub}</div>
  </div>
);

// ── API Setup Banner ──────────────────────────────────────────────
const SetupBanner = ({ apiName, url, onDismiss }) => (
  <div style={{ background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.25)", borderRadius:12, padding:"10px 14px", marginBottom:14, display:"flex", gap:10, alignItems:"flex-start" }}>
    <span style={{ fontSize:18, flexShrink:0 }}>⚙️</span>
    <div style={{ flex:1 }}>
      <div style={{ color:"#F59E0B", fontSize:12, fontWeight:700, fontFamily:FF, marginBottom:3 }}>{apiName} Not Configured</div>
      <div style={{ color:"rgba(255,255,255,0.5)", fontSize:11, fontFamily:FF, lineHeight:1.5 }}>
        Get your free API key at <span style={{ color:"#F59E0B" }}>{url}</span> and add it to apiConfig.js. Showing sample content for now.
      </div>
    </div>
    <button onClick={onDismiss} style={{ background:"transparent", border:"none", color:"rgba(255,255,255,0.3)", cursor:"pointer", fontSize:14, flexShrink:0 }}>✕</button>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   REELS TAB — YouTube Videos
═══════════════════════════════════════════════════════════════ */
export function ReelsTab() {
  const [videos,    setVideos]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [category,  setCategory]  = useState("trending");
  const [showBanner,setShowBanner]= useState(!isYouTubeConfigured());
  const [playing,   setPlaying]   = useState(null);
  const [liked,     setLiked]     = useState({});

  const cats = [
    { id:"trending", label:"🔥 Trending", query:"Africa trending 2026" },
    { id:"music",    label:"🎵 Music",    query:"African music afrobeats 2026" },
    { id:"comedy",   label:"😂 Comedy",   query:"African comedy funny 2026" },
    { id:"fashion",  label:"👗 Fashion",   query:"African fashion style 2026" },
    { id:"food",     label:"🍲 Food",     query:"African food recipe cooking" },
    { id:"tech",     label:"💻 Tech",     query:"Africa technology startup 2026" },
    { id:"travel",   label:"✈️ Travel",   query:"Africa travel vlog 2026" },
    { id:"news",     label:"📰 News",     query:"Africa news today 2026" },
  ];

  const loadVideos = async (cat) => {
    setLoading(true);
    setPlaying(null);
    try {
      let items = [];
      if (isYouTubeConfigured()) {
        const q = cats.find(c => c.id === cat)?.query || "Africa 2026";
        items = await youtubeAPI.search(q, 15);
        items = items.map(youtubeAPI.formatVideo);
      } else {
        items = FALLBACK_VIDEOS;
      }
      setVideos(items);
    } catch { setVideos(FALLBACK_VIDEOS); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadVideos(category); }, [category]);

  return (
    <div style={{ fontFamily:FF }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={{ color:"#fff", fontWeight:800, fontSize:18 }}>Reels</div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:"#FF0000" }} />
          <span style={{ color:"rgba(255,255,255,0.5)", fontSize:11 }}>YouTube</span>
        </div>
      </div>

      {/* API Banner */}
      {showBanner && <SetupBanner apiName="YouTube API" url="console.cloud.google.com" onDismiss={() => setShowBanner(false)} />}

      {/* Category tabs */}
      <div style={{ display:"flex", gap:8, overflowX:"auto", scrollbarWidth:"none", marginBottom:16, paddingBottom:4 }}>
        {cats.map(c => (
          <button key={c.id} onClick={() => setCategory(c.id)} style={{ flexShrink:0, background:category===c.id?"linear-gradient(135deg,#00D4A8,#006B52)":"rgba(255,255,255,0.06)", border:category===c.id?"none":"1px solid rgba(255,255,255,0.1)", borderRadius:20, padding:"6px 14px", color:"#fff", fontSize:12, cursor:"pointer", fontFamily:FF, fontWeight:category===c.id?700:400, whiteSpace:"nowrap" }}>{c.label}</button>
        ))}
      </div>

      {loading && <Loader text="Loading videos…" />}

      {!loading && videos.length === 0 && (
        <Empty icon="🎬" text="No videos found" sub="Try a different category or check your YouTube API key" />
      )}

      {/* Videos */}
      {!loading && videos.map((video, i) => (
        <div key={video.id || i} style={{ marginBottom:16, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, overflow:"hidden" }}>
          {/* Thumbnail / Player */}
          {playing === video.id && video.embedUrl ? (
            <div style={{ position:"relative", paddingTop:"56.25%" }}>
              <iframe src={`${video.embedUrl}?autoplay=1`} title={video.title} style={{ position:"absolute", inset:0, width:"100%", height:"100%", border:"none" }} allowFullScreen allow="autoplay" />
            </div>
          ) : (
            <div onClick={() => setPlaying(video.id)} style={{ position:"relative", background:"linear-gradient(135deg,#1a1a2e,#16213e)", minHeight:200, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              {video.thumbnail ? (
                <img src={video.thumbnail} alt={video.title} style={{ width:"100%", height:200, objectFit:"cover", display:"block" }} onError={e => e.target.style.display="none"} />
              ) : (
                <div style={{ fontSize:60, opacity:.3 }}>▶</div>
              )}
              {/* Play button overlay */}
              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.3)" }}>
                <div style={{ width:52, height:52, borderRadius:"50%", background:"rgba(255,255,255,0.9)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>▶</div>
              </div>
              {/* YouTube badge */}
              <div style={{ position:"absolute", top:8, right:8, background:"#FF0000", borderRadius:6, padding:"2px 8px", color:"#fff", fontSize:10, fontWeight:700 }}>YouTube</div>
            </div>
          )}

          {/* Info */}
          <div style={{ padding:"12px 14px" }}>
            <div style={{ color:"#fff", fontWeight:700, fontSize:13, marginBottom:6, lineHeight:1.4 }}>{video.title}</div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <div style={{ color:"rgba(255,255,255,0.45)", fontSize:11 }}>📺 {video.channel}</div>
              <div style={{ color:"rgba(255,255,255,0.35)", fontSize:11 }}>{fmtViews(video.viewCount)} views</div>
            </div>
            {/* Actions */}
            <div style={{ display:"flex", gap:6 }}>
              {[
                { icon: liked[video.id] ? "❤️" : "🤍", label: liked[video.id] ? "Liked" : "Like", fn: () => setLiked(l => ({...l, [video.id]: !l[video.id]})) },
                { icon:"💬", label:"Comment", fn:()=>{} },
                { icon:"↗", label:"Share", fn: () => window.open(video.url, "_blank") },
                { icon:"🔖", label:"Save", fn:()=>{} },
              ].map(b => (
                <button key={b.label} onClick={b.fn} style={{ flex:1, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"7px 4px", color:b.label==="Liked"?"#00D4A8":"rgba(255,255,255,0.55)", fontSize:10, cursor:"pointer", fontFamily:FF, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:3 }}>
                  {b.icon} {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EXPLORE TAB — Real African News + Trending
═══════════════════════════════════════════════════════════════ */
export function ExploreTab({ setActiveTab, setViewProfile, users = [] }) {
  const [news,       setNews]       = useState([]);
  const [loadingNews,setLoadingNews]= useState(true);
  const [category,   setCategory]   = useState("africa");
  const [showBanner, setShowBanner] = useState(!isNewsConfigured());
  const [search,     setSearch]     = useState("");

  const cats = [
    { id:"africa",     label:"🌍 Africa",    query:"Africa 2026" },
    { id:"business",   label:"💼 Business",  query:"Africa business economy" },
    { id:"tech",       label:"📱 Tech",      query:"Africa technology" },
    { id:"sports",     label:"⚽ Sports",    query:"Africa sports football" },
    { id:"health",     label:"💊 Health",    query:"Africa health medicine" },
    { id:"politics",   label:"🏛 Politics",  query:"Africa politics government" },
    { id:"culture",    label:"🎨 Culture",   query:"African culture arts" },
    { id:"environment",label:"🌿 Climate",   query:"Africa environment climate" },
  ];

  const loadNews = async (cat) => {
    setLoadingNews(true);
    try {
      let articles = [];
      if (isNewsConfigured()) {
        const q = cats.find(c => c.id === cat)?.query || "Africa";
        articles = await newsAPI.search(q, 20);
        articles = articles.map(newsAPI.formatArticle);
      } else {
        articles = FALLBACK_NEWS;
      }
      setNews(articles.filter(a => a.title && a.title !== "[Removed]"));
    } catch { setNews(FALLBACK_NEWS); }
    finally { setLoadingNews(false); }
  };

  useEffect(() => { loadNews(category); }, [category]);

  const trending = [
    "#AfricaTech2026", "#MpesaRevolution", "#GlobalConnect",
    "#NairobiStartups", "#AfricanCreatives", "#Amapiano2026",
    "#AfrobeatsWorldwide", "#AfricaRising",
  ];

  return (
    <div style={{ fontFamily:FF }}>
      <div style={{ color:"#fff", fontWeight:800, fontSize:18, marginBottom:14 }}>Explore</div>

      {/* Search bar */}
      <div style={{ position:"relative", marginBottom:14 }}>
        <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", opacity:.4, fontSize:15 }}>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search news, topics, people…" style={{ width:"100%", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"11px 14px 11px 40px", color:"#fff", fontSize:13, outline:"none", fontFamily:FF }} />
      </div>

      {/* Trending hashtags */}
      <div style={{ marginBottom:16 }}>
        <div style={{ color:"rgba(255,255,255,0.45)", fontSize:11, fontWeight:700, letterSpacing:1.2, textTransform:"uppercase", marginBottom:8 }}>🔥 Trending</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {trending.map(tag => (
            <button key={tag} style={{ background:"rgba(0,212,168,0.08)", border:"1px solid rgba(0,212,168,0.2)", borderRadius:20, padding:"5px 12px", color:"#00D4A8", fontSize:12, cursor:"pointer", fontFamily:FF, fontWeight:600 }}>{tag}</button>
          ))}
        </div>
      </div>

      {/* People You May Know */}
      {users.length > 0 && (
        <div style={{ marginBottom:16 }}>
          <div style={{ color:"rgba(255,255,255,0.45)", fontSize:11, fontWeight:700, letterSpacing:1.2, textTransform:"uppercase", marginBottom:10 }}>👥 People You May Know</div>
          <div style={{ display:"flex", gap:10, overflowX:"auto", scrollbarWidth:"none", paddingBottom:4 }}>
            {users.slice(0, 8).map((u, i) => (
              <div key={u.id || i} onClick={() => { setViewProfile && setViewProfile(u); setActiveTab && setActiveTab("viewprofile"); }} style={{ flexShrink:0, width:110, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, overflow:"hidden", cursor:"pointer" }}>
                <div style={{ height:44, background:`linear-gradient(135deg,${u.cover_color||u.coverColor||"#006B52"},#080E1A)` }} />
                <div style={{ padding:"0 8px 10px", marginTop:-18 }}>
                  <div style={{ width:36, height:36, borderRadius:"50%", background:`linear-gradient(135deg,${u.cover_color||u.coverColor||"#006B52"},#00D4A8)`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:13, border:"2px solid #080E1A" }}>{(u.full_name||u.name||"U")[0]}</div>
                  <div style={{ color:"#fff", fontWeight:700, fontSize:11, marginTop:4, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>{u.full_name||u.name||"User"}</div>
                  <div style={{ color:"rgba(255,255,255,0.35)", fontSize:10 }}>@{u.username||"user"}</div>
                  <button style={{ marginTop:6, width:"100%", background:"linear-gradient(135deg,#00D4A8,#006B52)", border:"none", borderRadius:8, padding:"4px", color:"#fff", fontWeight:700, fontSize:10, cursor:"pointer" }}>Follow</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* News section */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <div style={{ color:"rgba(255,255,255,0.45)", fontSize:11, fontWeight:700, letterSpacing:1.2, textTransform:"uppercase" }}>📰 African News</div>
        {showBanner && <button onClick={() => setShowBanner(false)} style={{ background:"transparent", border:"none", color:"rgba(245,158,11,0.7)", fontSize:11, cursor:"pointer", fontFamily:FF }}>⚙️ Setup API</button>}
      </div>

      {/* News categories */}
      <div style={{ display:"flex", gap:6, overflowX:"auto", scrollbarWidth:"none", marginBottom:14, paddingBottom:2 }}>
        {cats.map(c => (
          <button key={c.id} onClick={() => setCategory(c.id)} style={{ flexShrink:0, background:category===c.id?"linear-gradient(135deg,#00D4A8,#006B52)":"rgba(255,255,255,0.06)", border:category===c.id?"none":"1px solid rgba(255,255,255,0.1)", borderRadius:20, padding:"5px 12px", color:"#fff", fontSize:11, cursor:"pointer", fontFamily:FF, fontWeight:category===c.id?700:400, whiteSpace:"nowrap" }}>{c.label}</button>
        ))}
      </div>

      {loadingNews && <Loader text="Loading news…" />}

      {/* News cards */}
      {!loadingNews && news.map((article, i) => (
        <div key={article.id || i} onClick={() => article.url && article.url !== "#" && window.open(article.url, "_blank")} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, marginBottom:10, overflow:"hidden", cursor:"pointer", display:"flex", gap:0 }}>
          {/* Image */}
          {article.image && (
            <div style={{ width:90, flexShrink:0 }}>
              <img src={article.image} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", minHeight:80 }} onError={e => e.target.parentElement.style.display="none"} />
            </div>
          )}
          {/* Content */}
          <div style={{ padding:"10px 12px", flex:1 }}>
            <div style={{ color:"#fff", fontWeight:700, fontSize:12, lineHeight:1.4, marginBottom:5 }}>{article.title}</div>
            {article.description && <div style={{ color:"rgba(255,255,255,0.45)", fontSize:11, lineHeight:1.4, marginBottom:6, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{article.description}</div>}
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ color:"#00D4A8", fontSize:10, fontWeight:600 }}>{article.source}</span>
              <span style={{ color:"rgba(255,255,255,0.25)", fontSize:10 }}>{timeAgo(article.publishedAt)}</span>
            </div>
          </div>
        </div>
      ))}

      {!loadingNews && news.length === 0 && (
        <Empty icon="📰" text="No news found" sub="Set up your News API key at newsapi.org to get real African news" />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MUSIC TAB — Deezer African Music
═══════════════════════════════════════════════════════════════ */
export function MusicTab() {
  const [tracks,    setTracks]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [genre,     setGenre]     = useState("afrobeats");
  const [playing,   setPlaying]   = useState(null);
  const [liked,     setLiked]     = useState({});
  const audioRef = useRef(null);

  const genres = [
    { id:"afrobeats",  label:"🔥 Afrobeats",  query:"afrobeats 2026" },
    { id:"amapiano",   label:"🎹 Amapiano",   query:"amapiano south africa" },
    { id:"bongo",      label:"🎵 Bongo Flava", query:"bongo flava Tanzania" },
    { id:"gengetone",  label:"🇰🇪 Gengetone",  query:"gengetone Kenya" },
    { id:"highlife",   label:"🇬🇭 Highlife",   query:"highlife Ghana" },
    { id:"gospel",     label:"🙏 Gospel",     query:"African gospel music" },
    { id:"hiphop",     label:"🎤 Hip Hop",    query:"African hip hop rap" },
    { id:"reggae",     label:"🌿 Reggae",     query:"African reggae dancehall" },
  ];

  const loadMusic = async (g) => {
    setLoading(true);
    setPlaying(null);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    try {
      const q = genres.find(x => x.id === g)?.query || "Africa music";
      const items = await deezerAPI.search(q, 20);
      setTracks(items.length > 0 ? items.map(deezerAPI.formatTrack) : FALLBACK_MUSIC);
    } catch { setTracks(FALLBACK_MUSIC); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadMusic(genre); return () => { if (audioRef.current) audioRef.current.pause(); }; }, [genre]);

  const handlePlay = (track) => {
    if (playing === track.id) {
      audioRef.current?.pause();
      setPlaying(null);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    if (track.preview) {
      audioRef.current = new Audio(track.preview);
      audioRef.current.play();
      audioRef.current.onended = () => setPlaying(null);
    }
    setPlaying(track.id);
  };

  return (
    <div style={{ fontFamily:FF }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={{ color:"#fff", fontWeight:800, fontSize:18 }}>Music 🎵</div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:"#A855F7" }} />
          <span style={{ color:"rgba(255,255,255,0.5)", fontSize:11 }}>Deezer</span>
        </div>
      </div>

      {/* Now playing bar */}
      {playing && (
        <div style={{ background:"linear-gradient(135deg,rgba(168,85,247,0.2),rgba(168,85,247,0.05))", border:"1px solid rgba(168,85,247,0.3)", borderRadius:12, padding:"10px 14px", marginBottom:14, display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:"#A855F7", animation:"ping 1s ease-out infinite" }} />
          <div style={{ flex:1, color:"#fff", fontSize:12, fontWeight:700 }}>
            Now Playing: {tracks.find(t => t.id === playing)?.title || ""}
          </div>
          <button onClick={() => { audioRef.current?.pause(); setPlaying(null); }} style={{ background:"transparent", border:"none", color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:16 }}>⏹</button>
          <style>{`@keyframes ping{0%{transform:scale(1);opacity:.7}100%{transform:scale(2);opacity:0}}`}</style>
        </div>
      )}

      {/* Genre tabs */}
      <div style={{ display:"flex", gap:6, overflowX:"auto", scrollbarWidth:"none", marginBottom:16, paddingBottom:4 }}>
        {genres.map(g => (
          <button key={g.id} onClick={() => setGenre(g.id)} style={{ flexShrink:0, background:genre===g.id?"linear-gradient(135deg,#A855F7,#7C3AED)":"rgba(255,255,255,0.06)", border:genre===g.id?"none":"1px solid rgba(255,255,255,0.1)", borderRadius:20, padding:"6px 14px", color:"#fff", fontSize:12, cursor:"pointer", fontFamily:FF, fontWeight:genre===g.id?700:400, whiteSpace:"nowrap" }}>{g.label}</button>
        ))}
      </div>

      {loading && <Loader text="Loading music…" />}

      {/* Track list */}
      {!loading && tracks.map((track, i) => (
        <div key={track.id || i} style={{ display:"flex", alignItems:"center", gap:12, background:playing===track.id?"rgba(168,85,247,0.1)":"rgba(255,255,255,0.04)", border:`1px solid ${playing===track.id?"rgba(168,85,247,0.3)":"rgba(255,255,255,0.07)"}`, borderRadius:14, padding:"10px 12px", marginBottom:8, transition:"all 0.2s" }}>
          {/* Number / play indicator */}
          <div style={{ width:28, textAlign:"center", flexShrink:0 }}>
            {playing === track.id
              ? <div style={{ color:"#A855F7", fontSize:16, animation:"pulse 1s ease-in-out infinite" }}>▶</div>
              : <div style={{ color:"rgba(255,255,255,0.3)", fontSize:13, fontWeight:700 }}>{i+1}</div>
            }
          </div>

          {/* Cover art */}
          <div style={{ width:44, height:44, borderRadius:10, background:"linear-gradient(135deg,#A855F7,#7C3AED)", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, overflow:"hidden" }}>
            {track.cover ? <img src={track.cover} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e => e.target.parentElement.innerHTML="🎵"} /> : "🎵"}
          </div>

          {/* Info */}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ color:"#fff", fontWeight:700, fontSize:13, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>{track.title}</div>
            <div style={{ color:"rgba(255,255,255,0.45)", fontSize:11, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>{track.artist}</div>
          </div>

          {/* Duration */}
          {track.duration > 0 && <div style={{ color:"rgba(255,255,255,0.3)", fontSize:11, flexShrink:0 }}>{fmtDur(track.duration)}</div>}

          {/* Actions */}
          <div style={{ display:"flex", gap:6, flexShrink:0 }}>
            <button onClick={() => setLiked(l => ({...l,[track.id]:!l[track.id]}))} style={{ background:"transparent", border:"none", cursor:"pointer", fontSize:16 }}>{liked[track.id]?"❤️":"🤍"}</button>
            {track.preview && (
              <button onClick={() => handlePlay(track)} style={{ background:playing===track.id?"rgba(168,85,247,0.3)":"rgba(255,255,255,0.08)", border:`1px solid ${playing===track.id?"rgba(168,85,247,0.5)":"rgba(255,255,255,0.12)"}`, borderRadius:8, width:32, height:32, cursor:"pointer", color:"#fff", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>
                {playing === track.id ? "⏸" : "▶"}
              </button>
            )}
          </div>
        </div>
      ))}

      {!loading && tracks.length === 0 && (
        <Empty icon="🎵" text="No music found" sub="Check your internet connection and try again" />
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   GROUPS TAB
═══════════════════════════════════════════════════════════════ */
export function GroupsTab() {
  const groups = [
    { id:1, name:"African Entrepreneurs Network", members:12400, posts:"24/day", emoji:"💼", color:"#00B894" },
    { id:2, name:"Tech in Africa",                members:8900,  posts:"18/day", emoji:"💻", color:"#0984E3" },
    { id:3, name:"Kenyan Foodies",                members:5600,  posts:"30/day", emoji:"🍲", color:"#E17055" },
    { id:4, name:"African Fashion & Style",       members:21000, posts:"45/day", emoji:"👗", color:"#A855F7" },
    { id:5, name:"StartUp Pitches Africa",        members:3200,  posts:"12/day", emoji:"🚀", color:"#F59E0B" },
    { id:6, name:"Pan-African Culture",           members:15700, posts:"22/day", emoji:"🌍", color:"#EF4444" },
    { id:7, name:"Music Lovers Africa",           members:9800,  posts:"35/day", emoji:"🎵", color:"#A855F7" },
    { id:8, name:"African Students Network",      members:7400,  posts:"20/day", emoji:"🎓", color:"#00D4A8" },
  ];

  return (
    <div style={{ fontFamily:FF }}>
      <div style={{ color:"#fff", fontWeight:800, fontSize:18, marginBottom:14 }}>Groups</div>
      <button style={{ width:"100%", background:"rgba(0,212,168,0.07)", border:"2px dashed rgba(0,212,168,0.28)", borderRadius:14, padding:"13px", color:"#00D4A8", fontSize:14, fontWeight:700, cursor:"pointer", marginBottom:14, fontFamily:FF }}>＋ Create New Group</button>
      {groups.map(g => (
        <div key={g.id} style={{ display:"flex", alignItems:"center", gap:12, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:"12px 13px", marginBottom:8, cursor:"pointer" }}>
          <div style={{ width:48, height:48, borderRadius:12, background:g.color+"2A", border:`2px solid ${g.color}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{g.emoji}</div>
          <div style={{ flex:1 }}>
            <div style={{ color:"#fff", fontWeight:700, fontSize:13 }}>{g.name}</div>
            <div style={{ color:"rgba(255,255,255,0.38)", fontSize:11 }}>{g.members.toLocaleString()} members · {g.posts}</div>
          </div>
          <button style={{ background:"linear-gradient(135deg,#00D4A8,#006B52)", border:"none", borderRadius:20, padding:"5px 12px", color:"#fff", fontSize:11, cursor:"pointer", fontWeight:700, fontFamily:FF }}>Join</button>
        </div>
      ))}
    </div>
  );
}
