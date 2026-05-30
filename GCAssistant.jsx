import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   GLOBAL CONNECT — GC ASSISTANT
   Powered by Claude (Anthropic API)
   Features: Smart chat · Post writer · Ad copy · Data advisor
             Content moderator · Swahili/English · Voice-style UX
═══════════════════════════════════════════════════════════════ */

const SYSTEM_PROMPT = `You are GC Assistant, the official AI helper for Global Connect — Africa's #1 social media platform. You are friendly, smart, and culturally aware of African communities.

You help users with:
1. SOCIAL MEDIA: Writing posts, captions, hashtags, bios for their profile
2. BUSINESS & ADS: Writing ad copy, choosing the right ad tier, marketing advice
3. DATA BUNDLES: Recommending the best M-Pesa data plan based on their usage
4. CONTENT IDEAS: Suggesting what to post, trending topics in Africa
5. PLATFORM HELP: How to use Global Connect features, troubleshooting
6. GENERAL CHAT: Friendly conversation, motivation, advice

Personality:
- Warm, encouraging, and culturally aware
- Use occasional African expressions naturally (e.g. "Sawa!", "Asante", "Poa!")
- Keep responses concise and mobile-friendly (short paragraphs)
- Use emojis naturally but not excessively
- Always be helpful and solution-focused

Data Bundle Prices on Global Connect:
- Micro: KES 5 (1 Hour, Unlimited)
- Daily: KES 20 (24 Hours, 500MB)
- Active: KES 50 (3 Days, 1.5GB)
- Creator: KES 150 (7 Days, 5GB)
- Pro: KES 500 (30 Days, 20GB)
- Unlimited: KES 999 (30 Days, Unlimited)

Ad Tier Prices:
- Starter: KES 150 (24 Hours, ~500 reach)
- Growth: KES 500 (3 Days, ~2,000 reach)
- Boost: KES 1,500 (7 Days, ~10,000 reach)
- Regional Pro: KES 5,000 (14 Days, ~50,000 reach)
- Continental Pro: KES 25,000 (30 Days, 500K+ reach)

Always respond in the same language the user writes in (English or Swahili).`;

const QUICK_PROMPTS = [
  { icon: "✍️", label: "Write a post",       text: "Write me an engaging social media post about my new business launch" },
  { icon: "📢", label: "Ad copy",             text: "Help me write ad copy for my product on Global Connect" },
  { icon: "📶", label: "Best data bundle",    text: "Which data bundle should I buy? I mainly use social media daily" },
  { icon: "💡", label: "Content ideas",       text: "Give me 5 trending content ideas for African creators right now" },
  { icon: "🌍", label: "Grow followers",      text: "How do I grow my followers fast on Global Connect?" },
  { icon: "💼", label: "Business advice",     text: "I want to promote my small business on Global Connect. What's the best strategy?" },
  { icon: "🏷️", label: "Write hashtags",     text: "Give me the best hashtags for a fashion post targeting African audience" },
  { icon: "🤖", label: "What can you do?",   text: "What can you help me with as GC Assistant?" },
];

const WELCOME_MSG = {
  id:   "welcome",
  role: "assistant",
  text: "Habari! 👋 I'm **GC Assistant**, your personal AI helper on Global Connect.\n\nI can help you write posts, choose the right data bundle, create ad campaigns, grow your audience, and much more!\n\nWhat can I help you with today? 🌍",
  time: new Date(),
};

// ── Helpers ───────────────────────────────────────────────────────
const formatTime = (d) => d.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });

const parseMarkdown = (text) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g,     '<em>$1</em>')
    .replace(/\n/g,            '<br/>');
};

// ── Typing Indicator ──────────────────────────────────────────────
const TypingDots = () => (
  <div style={{ display:"flex", gap:5, alignItems:"center", padding:"12px 16px" }}>
    {[0,1,2].map(i => (
      <div key={i} style={{
        width:8, height:8, borderRadius:"50%", background:"#00D4A8",
        animation:`typingBounce 1.2s ease-in-out ${i*0.18}s infinite`,
      }} />
    ))}
  </div>
);

// ── Message Bubble ────────────────────────────────────────────────
const Bubble = ({ msg }) => {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display:       "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom:  12,
      animation:     "bubbleIn 0.22s ease both",
      gap:           8,
      alignItems:    "flex-end",
    }}>
      {/* Avatar for assistant */}
      {!isUser && (
        <div style={{
          width:30, height:30, borderRadius:"50%", flexShrink:0,
          background:"linear-gradient(135deg,#00D4A8,#006B52)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:14, boxShadow:"0 2px 8px rgba(0,212,168,0.3)",
        }}>🤖</div>
      )}

      <div style={{ maxWidth:"78%", display:"flex", flexDirection:"column", alignItems: isUser?"flex-end":"flex-start" }}>
        {/* Bubble */}
        <div style={{
          background:   isUser
            ? "linear-gradient(135deg,#00D4A8,#006B52)"
            : "rgba(255,255,255,0.07)",
          border:       isUser ? "none" : "1px solid rgba(255,255,255,0.1)",
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          padding:      "10px 14px",
          color:        "#fff",
          fontSize:     13.5,
          lineHeight:   1.6,
          fontFamily:   "'Sora', sans-serif",
          boxShadow:    isUser
            ? "0 4px 16px rgba(0,212,168,0.25)"
            : "0 2px 8px rgba(0,0,0,0.3)",
        }}
          dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) }}
        />
        {/* Time */}
        <div style={{
          color:"rgba(255,255,255,0.28)", fontSize:10,
          marginTop:4, fontFamily:"'Sora',sans-serif",
          paddingLeft: isUser ? 0 : 4,
          paddingRight: isUser ? 4 : 0,
        }}>{formatTime(msg.time)}</div>
      </div>

      {/* Avatar for user */}
      {isUser && (
        <div style={{
          width:30, height:30, borderRadius:"50%", flexShrink:0,
          background:"linear-gradient(135deg,#006B52,#004D3A)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:13, fontWeight:700, color:"#fff", fontFamily:"'Sora',sans-serif",
          border:"1.5px solid rgba(0,212,168,0.3)",
        }}>GU</div>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────
export default function GCAssistant() {
  const [messages,    setMessages]    = useState([WELCOME_MSG]);
  const [input,       setInput]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [showQuick,   setShowQuick]   = useState(true);
  const [error,       setError]       = useState(null);
  const [charCount,   setCharCount]   = useState(0);
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const MAX_CHARS  = 500;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || loading) return;

    setShowQuick(false);
    setError(null);
    setInput("");
    setCharCount(0);

    const userMsg = { id: Date.now(), role:"user", text: trimmed, time: new Date() };
    const history = [...messages, userMsg];
    setMessages(history);
    setLoading(true);

    try {
      const apiMessages = history
        .filter(m => m.id !== "welcome")
        .map(m => ({ role: m.role, content: m.text }));

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model:      "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system:     SYSTEM_PROMPT,
          messages:   apiMessages,
        }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      const replyText = data.content?.map(b => b.text || "").join("") || "Sorry, I couldn't get a response. Please try again.";

      setMessages(prev => [...prev, {
        id:   Date.now() + 1,
        role: "assistant",
        text: replyText,
        time: new Date(),
      }]);
    } catch (err) {
      setError("Connection issue. Please check your internet and try again.");
      setMessages(prev => [...prev, {
        id:   Date.now() + 1,
        role: "assistant",
        text: "Oops! I had a connection issue. Please try again 🙏",
        time: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([WELCOME_MSG]);
    setShowQuick(true);
    setError(null);
    setInput("");
    setCharCount(0);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080E1A; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,212,168,0.3); border-radius: 4px; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.28); }

        @keyframes bubbleIn {
          from { opacity:0; transform:translateY(8px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes typingBounce {
          0%,60%,100% { transform:translateY(0); opacity:.4; }
          30%          { transform:translateY(-6px); opacity:1; }
        }
        @keyframes headerPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(0,212,168,0); }
          50%      { box-shadow: 0 0 20px 2px rgba(0,212,168,0.15); }
        }
        @keyframes quickFade {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes glowPulse {
          0%,100% { opacity:.6; }
          50%      { opacity:1; }
        }

        .quick-btn:hover {
          background: rgba(0,212,168,0.14) !important;
          border-color: rgba(0,212,168,0.4) !important;
          transform: translateY(-1px);
        }
        .send-btn:hover:not(:disabled) {
          filter: brightness(1.1);
          transform: scale(1.05);
        }
        .send-btn:disabled { opacity:0.4; cursor:not-allowed; }
      `}</style>

      <div style={{
        display:"flex", flexDirection:"column",
        height:"100vh", background:"#080E1A",
        fontFamily:"'Sora',sans-serif",
      }}>

        {/* ── HEADER ──────────────────────────────────── */}
        <div style={{
          background:    "linear-gradient(135deg,rgba(0,212,168,0.12),rgba(0,107,82,0.08))",
          borderBottom:  "1px solid rgba(0,212,168,0.2)",
          padding:       "14px 16px",
          display:       "flex",
          alignItems:    "center",
          gap:           12,
          animation:     "headerPulse 4s ease-in-out infinite",
          flexShrink:    0,
        }}>
          {/* Logo */}
          <div style={{
            width:46, height:46, borderRadius:14, flexShrink:0,
            background:"linear-gradient(135deg,#00D4A8,#006B52)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:22, boxShadow:"0 4px 16px rgba(0,212,168,0.35)",
          }}>🤖</div>

          <div style={{ flex:1 }}>
            <div style={{
              color:"#fff", fontWeight:800, fontSize:16, letterSpacing:-.3,
              display:"flex", alignItems:"center", gap:8,
            }}>
              GC Assistant
              <span style={{
                background:"linear-gradient(135deg,#00D4A8,#006B52)",
                color:"#fff", fontSize:9, fontWeight:700, borderRadius:6,
                padding:"2px 7px", letterSpacing:.5,
              }}>AI POWERED</span>
            </div>
            <div style={{
              display:"flex", alignItems:"center", gap:5,
              color:"rgba(255,255,255,0.5)", fontSize:11, marginTop:2,
            }}>
              <span style={{
                width:6, height:6, borderRadius:"50%", background:"#00E676",
                display:"inline-block", animation:"glowPulse 2s ease-in-out infinite",
              }} />
              Powered by Claude · Always online
            </div>
          </div>

          {/* Clear button */}
          <button onClick={clearChat} title="Clear chat" style={{
            background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)",
            borderRadius:10, padding:"7px 12px", color:"rgba(255,255,255,0.55)",
            fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"'Sora',sans-serif",
            transition:"all 0.18s",
          }}>🗑 Clear</button>
        </div>

        {/* ── CHAT AREA ────────────────────────────────── */}
        <div style={{ flex:1, overflowY:"auto", padding:"16px 14px 8px" }}>

          {/* Messages */}
          {messages.map(msg => <Bubble key={msg.id} msg={msg} />)}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display:"flex", alignItems:"flex-end", gap:8, marginBottom:12 }}>
              <div style={{ width:30, height:30, borderRadius:"50%", background:"linear-gradient(135deg,#00D4A8,#006B52)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🤖</div>
              <div style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"18px 18px 18px 4px" }}>
                <TypingDots />
              </div>
            </div>
          )}

          {/* Quick prompts */}
          {showQuick && !loading && (
            <div style={{ marginTop:16, marginBottom:8 }}>
              <div style={{ color:"rgba(255,255,255,0.38)", fontSize:11, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", marginBottom:10, textAlign:"center" }}>
                Quick Actions
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {QUICK_PROMPTS.map((q, i) => (
                  <button
                    key={q.label}
                    onClick={() => sendMessage(q.text)}
                    className="quick-btn"
                    style={{
                      background:    "rgba(255,255,255,0.05)",
                      border:        "1px solid rgba(255,255,255,0.1)",
                      borderRadius:  12, padding:"10px 10px",
                      cursor:        "pointer", textAlign:"left",
                      transition:    "all 0.18s",
                      animation:     `quickFade 0.3s ease ${i * 0.05}s both`,
                    }}
                  >
                    <div style={{ fontSize:18, marginBottom:4 }}>{q.icon}</div>
                    <div style={{ color:"#fff", fontSize:12, fontWeight:700, fontFamily:"'Sora',sans-serif", lineHeight:1.3 }}>{q.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div style={{ background:"rgba(255,71,87,0.1)", border:"1px solid rgba(255,71,87,0.25)", borderRadius:10, padding:"8px 12px", marginBottom:10, color:"#FF4757", fontSize:12, textAlign:"center" }}>
              ⚠️ {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── SUGGESTED FOLLOW-UPS (after response) ── */}
        {messages.length > 2 && !loading && !showQuick && (
          <div style={{ padding:"6px 14px 4px", display:"flex", gap:7, overflowX:"auto", scrollbarWidth:"none", flexShrink:0 }}>
            {["Tell me more", "Give an example", "How much does it cost?", "What else can I do?"].map(s => (
              <button key={s} onClick={() => sendMessage(s)} style={{
                flexShrink:0, background:"rgba(0,212,168,0.08)", border:"1px solid rgba(0,212,168,0.22)",
                borderRadius:20, padding:"5px 12px", color:"#00D4A8", fontSize:11,
                fontWeight:600, cursor:"pointer", fontFamily:"'Sora',sans-serif",
                whiteSpace:"nowrap", transition:"all 0.18s",
              }}>{s}</button>
            ))}
          </div>
        )}

        {/* ── INPUT BAR ───────────────────────────────── */}
        <div style={{
          background:   "rgba(8,14,26,0.98)",
          backdropFilter:"blur(20px)",
          borderTop:    "1px solid rgba(255,255,255,0.08)",
          padding:      "10px 14px 16px",
          flexShrink:   0,
        }}>
          <div style={{ display:"flex", gap:10, alignItems:"flex-end" }}>
            {/* Textarea */}
            <div style={{ flex:1, position:"relative" }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => {
                  if (e.target.value.length <= MAX_CHARS) {
                    setInput(e.target.value);
                    setCharCount(e.target.value.length);
                  }
                }}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask me anything… ✨"
                rows={1}
                style={{
                  width:        "100%",
                  background:   "rgba(255,255,255,0.07)",
                  border:       "1.5px solid rgba(0,212,168,0.22)",
                  borderRadius: 16,
                  padding:      "11px 14px",
                  color:        "#fff",
                  fontSize:     14,
                  outline:      "none",
                  fontFamily:   "'Sora',sans-serif",
                  resize:       "none",
                  lineHeight:   1.5,
                  minHeight:    46,
                  maxHeight:    120,
                  transition:   "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = "rgba(0,212,168,0.55)"}
                onBlur={e  => e.target.style.borderColor = "rgba(0,212,168,0.22)"}
              />
              {/* Char counter */}
              {charCount > 400 && (
                <div style={{ position:"absolute", bottom:8, right:10, color:charCount > 480?"#FF4757":"rgba(255,255,255,0.3)", fontSize:10 }}>
                  {MAX_CHARS - charCount}
                </div>
              )}
            </div>

            {/* Send button */}
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="send-btn"
              style={{
                width:46, height:46, borderRadius:"50%", flexShrink:0,
                background: !input.trim() || loading
                  ? "rgba(255,255,255,0.08)"
                  : "linear-gradient(135deg,#00D4A8,#006B52)",
                border:"none", cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:18, transition:"all 0.18s",
                boxShadow: !input.trim() || loading ? "none" : "0 4px 16px rgba(0,212,168,0.3)",
              }}
            >
              {loading
                ? <div style={{ width:18, height:18, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.3)", borderTop:"2px solid #fff", animation:"spin 0.8s linear infinite" }} />
                : "➤"
              }
            </button>
          </div>

          {/* Footer hint */}
          <div style={{ textAlign:"center", marginTop:8, color:"rgba(255,255,255,0.2)", fontSize:10 }}>
            Press Enter to send · Shift+Enter for new line · Powered by Claude AI
          </div>
        </div>

      </div>
    </>
  );
}
