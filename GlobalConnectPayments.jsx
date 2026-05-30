import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════
   GLOBAL CONNECT — PAYMENT SYSTEM
   Pulse Wallet · Data Bundles · Ad Promotion · M-Pesa STK
═══════════════════════════════════════════════════════ */

// ── Data ──────────────────────────────────────────────
const DATA_BUNDLES = [
  { id: "micro",     name: "Micro",     price: 5,    duration: "1 Hour",     data: "Unlimited",  best: "Quick browse/chat",         emoji: "⚡", color: "#C8FF00", textDark: true },
  { id: "daily",     name: "Daily",     price: 20,   duration: "24 Hours",   data: "500MB",      best: "Casual users",              emoji: "☀️", color: "#00D4A8", textDark: false },
  { id: "active",    name: "Active",    price: 50,   duration: "3 Days",     data: "1.5GB",      best: "Heavy social engagement",   emoji: "🔥", color: "#FF6B35", textDark: false },
  { id: "creator",   name: "Creator",   price: 150,  duration: "7 Days",     data: "5GB",        best: "Influencers / Uploaders",   emoji: "🎬", color: "#A855F7", textDark: false },
  { id: "pro",       name: "Pro",       price: 500,  duration: "30 Days",    data: "20GB",       best: "Power users",               emoji: "💎", color: "#0EA5E9", textDark: false },
  { id: "unlimited", name: "Unlimited", price: 999,  duration: "30 Days",    data: "Unlimited",  best: "Always-on professionals",   emoji: "∞",  color: "#F59E0B", textDark: false },
];

const AD_TIERS = [
  { id: "starter",      name: "Starter",        price: 150,   duration: "24 Hours", reach: "~500 users",          strategy: "Quick promotion of one product",         emoji: "🌱", color: "#C8FF00", textDark: true  },
  { id: "growth",       name: "Growth",          price: 500,   duration: "3 Days",   reach: "~2,000 users",        strategy: "Reaching local campus/community",        emoji: "📈", color: "#00D4A8", textDark: false },
  { id: "boost",        name: "Boost",           price: 1500,  duration: "7 Days",   reach: "~10,000 users",       strategy: "Regional targeting",                     emoji: "🚀", color: "#FF6B35", textDark: false },
  { id: "regional",     name: "Regional Pro",    price: 5000,  duration: "14 Days",  reach: "~50,000 users",       strategy: "High visibility across counties",        emoji: "🌍", color: "#A855F7", textDark: false },
  { id: "continental",  name: "Continental Pro", price: 25000, duration: "30 Days",  reach: "500,000+ users",      strategy: "Full-brand takeover",                    emoji: "👑", color: "#F59E0B", textDark: false },
];

// Simulated user state
const INITIAL_WALLET = { credits: 0, isPremium: false, activeBundle: null, bundleExpiry: null };

// ── Helpers ───────────────────────────────────────────
const fmt = (n) => `KES ${Number(n).toLocaleString()}`;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ── CSS ───────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Bebas+Neue&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #080E1A; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: #C8FF0044; border-radius: 2px; }
  input::placeholder { color: rgba(255,255,255,0.25); }
  select option { background: #0D1825; }

  @keyframes fadeSlideUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeSlideDown { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes scaleIn       { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }
  @keyframes spin          { to { transform: rotate(360deg) } }
  @keyframes pulse         { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes progressBar   { from{width:0%} to{width:100%} }
  @keyframes shakeX        { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
  @keyframes successPop    { 0%{transform:scale(0);opacity:0} 70%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
  @keyframes scanLine      { 0%{top:0%} 100%{top:100%} }
  @keyframes glow          { 0%,100%{box-shadow:0 0 12px #C8FF0044} 50%{box-shadow:0 0 28px #C8FF0088} }

  .bundle-card:hover  { transform: translateY(-3px); }
  .ad-row:hover       { background: rgba(255,255,255,0.06) !important; }
  .tab-btn:hover      { background: rgba(255,255,255,0.07) !important; }
  .action-btn:hover   { filter: brightness(1.08); transform: scale(1.01); }
`;

// ── Spinner ───────────────────────────────────────────
function Spinner({ size = 28, color = "#C8FF00" }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      border: `3px solid ${color}22`,
      borderTop: `3px solid ${color}`,
      animation: "spin 0.8s linear infinite",
      flexShrink: 0
    }} />
  );
}

// ── Wallet Bar ────────────────────────────────────────
function WalletBar({ wallet, onTopUp }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "linear-gradient(100deg,#0D1825,#111D2E)",
      border: "1px solid rgba(200,255,0,0.18)",
      borderRadius: 14, padding: "12px 16px", marginBottom: 24,
      animation: "fadeSlideDown 0.4s ease both"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: "linear-gradient(135deg,#C8FF00,#7DCC00)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, animation: "glow 2.5s ease-in-out infinite"
        }}>⚡</div>
        <div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase" }}>Pulse Wallet</div>
          <div style={{ color: "#C8FF00", fontSize: 22, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1, lineHeight: 1 }}>
            {fmt(wallet.credits)} <span style={{ fontSize: 13, color: "rgba(200,255,0,0.5)", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 400 }}>credits</span>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {wallet.activeBundle && (
          <div style={{ background: "rgba(0,212,168,0.15)", border: "1px solid rgba(0,212,168,0.3)", borderRadius: 8, padding: "4px 10px", fontSize: 11, color: "#00D4A8", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}>
            ● {wallet.activeBundle} Active
          </div>
        )}
        <button onClick={onTopUp} className="action-btn" style={{
          background: "linear-gradient(135deg,#C8FF00,#7DCC00)",
          border: "none", borderRadius: 10, padding: "8px 16px",
          color: "#080E1A", fontSize: 12, fontWeight: 800,
          fontFamily: "'Space Grotesk',sans-serif", cursor: "pointer",
          transition: "all 0.18s"
        }}>+ Top Up</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MPESA PAYMENT SHEET — Full STK Flow
   States: select → confirm → waiting → success | timeout
═══════════════════════════════════════════════════════ */
function MpesaSheet({ item, type, walletMode, onClose, onSuccess }) {
  const [phase, setPhase] = useState("confirm"); // confirm | waiting | success | timeout
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [progress, setProgress] = useState(0);
  const [shake, setShake] = useState(false);
  const timerRef = useRef(null);
  const progressRef = useRef(null);

  const price = type === "topup" ? item : item.price;
  const label = type === "bundle" ? `${item.name} Bundle (${item.data})` :
                type === "ad"     ? `${item.name} Ad Campaign` :
                type === "topup"  ? `Wallet Top-Up` : "Payment";

  const validatePhone = () => {
    const cleaned = phone.replace(/\s|-/g, "");
    if (!cleaned) { setPhoneError("Please enter your M-Pesa number"); return false; }
    if (!/^(07|01|\+254|254)\d{8,9}$/.test(cleaned)) { setPhoneError("Enter a valid Kenyan number (e.g. 0712 345 678)"); return false; }
    setPhoneError("");
    return true;
  };

  const triggerSTK = () => {
    if (!validatePhone()) { setShake(true); setTimeout(() => setShake(false), 600); return; }
    setPhase("waiting");
    let p = 0;
    progressRef.current = setInterval(() => {
      p += Math.random() * 6 + 2;
      setProgress(Math.min(p, 92));
    }, 220);
    // Simulate webhook after 4s
    timerRef.current = setTimeout(() => {
      clearInterval(progressRef.current);
      setProgress(100);
      setTimeout(() => setPhase("success"), 400);
    }, 4000);
  };

  const triggerTimeout = () => {
    clearInterval(progressRef.current);
    clearTimeout(timerRef.current);
    setPhase("timeout");
  };

  useEffect(() => {
    // Expose timeout trigger at 15s for demo realism
    if (phase === "waiting") {
      const to = setTimeout(triggerTimeout, 15000);
      return () => clearTimeout(to);
    }
  }, [phase]);

  useEffect(() => () => { clearInterval(progressRef.current); clearTimeout(timerRef.current); }, []);

  const overlayClick = (e) => {
    if (e.target === e.currentTarget && phase !== "waiting") onClose();
  };

  return (
    <div onClick={overlayClick} style={{
      position: "fixed", inset: 0,
      background: "rgba(4,8,18,0.92)",
      backdropFilter: "blur(10px)",
      zIndex: 10000,
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      fontFamily: "'Space Grotesk',sans-serif"
    }}>
      <div style={{
        width: "100%", maxWidth: 480,
        background: "linear-gradient(180deg,#0F1C2E 0%,#080E1A 100%)",
        borderRadius: "24px 24px 0 0",
        border: "1px solid rgba(200,255,0,0.12)",
        borderBottom: "none",
        padding: "0 0 40px",
        animation: "fadeSlideUp 0.32s cubic-bezier(.22,.68,0,1.2) both",
        boxShadow: "0 -40px 80px rgba(0,0,0,0.7)"
      }}>
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0" }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />
        </div>

        {/* ── CONFIRM PHASE ── */}
        {phase === "confirm" && (
          <div style={{ padding: "20px 24px 0", animation: "scaleIn 0.25s ease both" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Payment Sheet</div>
                <div style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>Confirm & Pay</div>
              </div>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", color: "rgba(255,255,255,0.5)", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>

            {/* Amount card */}
            <div style={{
              background: "linear-gradient(135deg,rgba(200,255,0,0.1),rgba(200,255,0,0.04))",
              border: "1px solid rgba(200,255,0,0.2)",
              borderRadius: 18, padding: "20px 20px", marginBottom: 20, textAlign: "center",
              position: "relative", overflow: "hidden"
            }}>
              {/* Decorative scan line */}
              <div style={{ position: "absolute", left: 0, right: 0, height: 1, background: "rgba(200,255,0,0.15)", animation: "scanLine 3s linear infinite" }} />
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>You are about to pay</div>
              <div style={{ color: "#C8FF00", fontSize: 42, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 2, lineHeight: 1 }}>{fmt(price)}</div>
              <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, marginTop: 6, fontWeight: 500 }}>{label}</div>
              {type === "bundle" && <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 4 }}>Valid for {item.duration} · {item.data}</div>}
              {type === "ad" && <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 4 }}>Reach {item.reach} · Active for {item.duration}</div>}
            </div>

            {/* Quick amounts (wallet topup mode) */}
            {walletMode && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
                {[5, 20, 50, 150].map(amt => (
                  <button key={amt} onClick={() => {}} style={{
                    background: amt === price ? "rgba(200,255,0,0.15)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${amt === price ? "rgba(200,255,0,0.4)" : "rgba(255,255,255,0.1)"}`,
                    borderRadius: 10, padding: "10px 4px", color: amt === price ? "#C8FF00" : "rgba(255,255,255,0.7)",
                    fontSize: 14, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", cursor: "pointer"
                  }}>{amt}</button>
                ))}
              </div>
            )}

            {/* Phone input */}
            <div style={{ marginBottom: 6 }}>
              <label style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>M-Pesa Number</label>
              <div style={{ position: "relative", animation: shake ? "shakeX 0.5s ease" : "none" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)", fontSize: 13 }}>🇰🇪 +254</span>
                <input
                  value={phone} onChange={e => { setPhone(e.target.value); setPhoneError(""); }}
                  placeholder="712 345 678" type="tel"
                  style={{
                    width: "100%", background: "rgba(255,255,255,0.06)",
                    border: `1.5px solid ${phoneError ? "#FF4757" : "rgba(255,255,255,0.12)"}`,
                    borderRadius: 14, padding: "14px 14px 14px 86px",
                    color: "#fff", fontSize: 16, fontWeight: 600,
                    outline: "none", fontFamily: "'Space Grotesk',sans-serif",
                    transition: "border-color 0.2s"
                  }}
                />
              </div>
              {phoneError && <div style={{ color: "#FF4757", fontSize: 11, marginTop: 6 }}>{phoneError}</div>}
            </div>
            <div style={{ color: "rgba(255,255,255,0.28)", fontSize: 11, marginBottom: 22, lineHeight: 1.5 }}>
              An M-Pesa STK Push will be sent to this number. Have your PIN ready.
            </div>

            {/* Pay button */}
            <button onClick={triggerSTK} className="action-btn" style={{
              width: "100%", padding: "16px",
              background: "linear-gradient(135deg,#C8FF00,#7DCC00)",
              border: "none", borderRadius: 16, cursor: "pointer",
              color: "#080E1A", fontSize: 16, fontWeight: 800,
              fontFamily: "'Space Grotesk',sans-serif", letterSpacing: 0.3,
              transition: "all 0.18s", display: "flex", alignItems: "center", justifyContent: "center", gap: 10
            }}>
              <span>📱</span> Pay with M-Pesa
            </button>
          </div>
        )}

        {/* ── WAITING PHASE ── */}
        {phase === "waiting" && (
          <div style={{ padding: "32px 24px 0", textAlign: "center", animation: "scaleIn 0.3s ease both" }}>
            <div style={{ marginBottom: 28 }}>
              <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 20px" }}>
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(200,255,0,0.08)", border: "2px solid rgba(200,255,0,0.2)", animation: "pulse 1.6s ease-in-out infinite" }} />
                <div style={{ position: "absolute", inset: 8, borderRadius: "50%", background: "rgba(200,255,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>📱</div>
                <div style={{ position: "absolute", inset: -8, borderRadius: "50%", border: "2px solid rgba(200,255,0,0.15)", animation: "pulse 1.6s ease-in-out 0.4s infinite" }} />
              </div>
              <div style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Waiting for PIN…</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.6, marginBottom: 4 }}>
                The M-Pesa prompt has appeared on your phone.<br />
                Enter your <strong style={{ color: "#C8FF00" }}>M-Pesa PIN</strong> to confirm.
              </div>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>Do not close this screen</div>
            </div>

            {/* Step progress */}
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
              {[["1","Request Sent","#C8FF00"],["2","PIN Entry","#C8FF00"],["3","Confirming","rgba(255,255,255,0.3)"]].map(([n,l,c],i) => (
                <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: i < 2 ? "#C8FF00" : "rgba(255,255,255,0.1)", color: i < 2 ? "#080E1A" : "rgba(255,255,255,0.3)", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{i < 2 ? "✓" : n}</div>
                  <div style={{ color: c, fontSize: 9, letterSpacing: 0.5, whiteSpace: "nowrap" }}>{l}</div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, height: 6, overflow: "hidden", marginBottom: 10 }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#C8FF00,#7DCC00)", borderRadius: 8, transition: "width 0.25s ease" }} />
            </div>
            <div style={{ color: "#C8FF00", fontSize: 11, marginBottom: 28, animation: "pulse 1.5s ease-in-out infinite" }}>
              Processing… {Math.round(progress)}%
            </div>

            {/* Timeout trigger (demo) */}
            <button onClick={triggerTimeout} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 20px", color: "rgba(255,255,255,0.3)", fontSize: 12, cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif" }}>
              Cancel / I didn't receive prompt
            </button>
          </div>
        )}

        {/* ── SUCCESS PHASE ── */}
        {phase === "success" && (
          <div style={{ padding: "32px 24px 0", textAlign: "center", animation: "scaleIn 0.3s ease both" }}>
            <div style={{
              width: 90, height: 90, borderRadius: "50%",
              background: "linear-gradient(135deg,#C8FF00,#7DCC00)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 42, margin: "0 auto 20px",
              animation: "successPop 0.5s cubic-bezier(.22,.68,0,1.3) both",
              boxShadow: "0 0 40px rgba(200,255,0,0.4)"
            }}>✓</div>

            <div style={{ color: "#C8FF00", fontSize: 26, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 2, marginBottom: 6 }}>
              {type === "bundle" ? "You Are Now Connected!" : type === "ad" ? "Your Ad Is Live!" : "Wallet Topped Up!"}
            </div>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, marginBottom: 6 }}>
              {fmt(price)} deducted from M-Pesa
            </div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginBottom: 20 }}>
              {type === "bundle" && `📶 ${item.data} active for ${item.duration}`}
              {type === "ad" && `📢 Reaching ${item.reach} users starting now`}
              {type === "topup" && `⚡ Credits added to your Pulse Wallet`}
            </div>

            {/* Instant DB update indicators */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28, maxWidth: 280, margin: "0 auto 28px" }}>
              {[
                { label: type === "bundle" ? "isPremium → true" : "isSponsored → true", done: true },
                { label: "Database synced", done: true },
                { label: "Feed updated", done: true },
              ].map((s, i) => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(200,255,0,0.06)", border: "1px solid rgba(200,255,0,0.15)", borderRadius: 8, padding: "7px 12px" }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#C8FF00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#080E1A", fontWeight: 800, flexShrink: 0 }}>✓</div>
                  <span style={{ color: "#C8FF00", fontSize: 11, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}>{s.label}</span>
                  <span style={{ marginLeft: "auto", color: "rgba(255,255,255,0.25)", fontSize: 10 }}>{"<1s"}</span>
                </div>
              ))}
            </div>

            <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, marginBottom: 24 }}>
              Transaction ID: GC{Date.now().toString().slice(-9)}
            </div>

            <button onClick={() => { onSuccess && onSuccess(); onClose(); }} className="action-btn" style={{
              width: "100%", padding: "15px",
              background: "linear-gradient(135deg,#C8FF00,#7DCC00)",
              border: "none", borderRadius: 16, cursor: "pointer",
              color: "#080E1A", fontSize: 15, fontWeight: 800,
              fontFamily: "'Space Grotesk',sans-serif", transition: "all 0.18s"
            }}>Continue →</button>
          </div>
        )}

        {/* ── TIMEOUT PHASE ── */}
        {phase === "timeout" && (
          <div style={{ padding: "32px 24px 0", textAlign: "center", animation: "scaleIn 0.3s ease both" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(255,71,87,0.15)", border: "2px solid rgba(255,71,87,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 20px" }}>⏱</div>
            <div style={{ color: "#FF4757", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Transaction Timed Out</div>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              Your payment didn't go through.<br />
              No money was deducted from your account.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={onClose} style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: "13px", color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif" }}>Cancel</button>
              <button onClick={() => { setPhase("confirm"); setProgress(0); }} className="action-btn" style={{ flex: 2, background: "linear-gradient(135deg,#C8FF00,#7DCC00)", border: "none", borderRadius: 14, padding: "13px", color: "#080E1A", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif", transition: "all 0.18s" }}>
                🔄 Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PROMOTE POST MODAL
═══════════════════════════════════════════════════════ */
function PromotePostModal({ post, onClose, onSuccess }) {
  const [selectedTier, setSelectedTier] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  return (
    <>
      {!showPayment && (
        <div onClick={e => e.target === e.currentTarget && onClose()} style={{
          position: "fixed", inset: 0, background: "rgba(4,8,18,0.9)", backdropFilter: "blur(8px)",
          zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
          fontFamily: "'Space Grotesk',sans-serif"
        }}>
          <div style={{
            background: "linear-gradient(160deg,#0F1C2E,#080E1A)",
            borderRadius: 24, width: "100%", maxWidth: 520,
            border: "1px solid rgba(200,255,0,0.15)",
            padding: "24px 20px", animation: "scaleIn 0.28s ease both",
            maxHeight: "90vh", overflow: "auto"
          }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div>
                <div style={{ color: "#C8FF00", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Promote Post</div>
                <div style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>Choose an Ad Tier</div>
              </div>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", color: "rgba(255,255,255,0.5)", fontSize: 16 }}>✕</button>
            </div>

            {/* Post preview */}
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 14px", marginBottom: 18, marginTop: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#C8FF00,#006B52)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>👤</div>
                <div>
                  <div style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>Your Post</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>Will appear as Sponsored</div>
                </div>
                <div style={{ marginLeft: "auto", background: "rgba(200,255,0,0.15)", border: "1px solid rgba(200,255,0,0.3)", borderRadius: 6, padding: "2px 8px", color: "#C8FF00", fontSize: 9, fontWeight: 700 }}>SPONSORED</div>
              </div>
              <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 8, lineHeight: 1.5 }}>{post || "Your post content will appear here across the Global Connect feed"}</div>
            </div>

            {/* Ad tiers */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {AD_TIERS.map(tier => (
                <div key={tier.id} onClick={() => setSelectedTier(tier)} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: selectedTier?.id === tier.id ? `${tier.color}18` : "rgba(255,255,255,0.04)",
                  border: `${selectedTier?.id === tier.id ? "2px" : "1px"} solid ${selectedTier?.id === tier.id ? tier.color : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 14, padding: "12px 14px", cursor: "pointer", transition: "all 0.18s"
                }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: tier.color + (tier.textDark ? "44" : "22"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{tier.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{tier.name}</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{tier.reach} · {tier.duration}</div>
                    <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>{tier.strategy}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ color: tier.color, fontSize: 17, fontWeight: 800 }}>{fmt(tier.price)}</div>
                    {selectedTier?.id === tier.id && <div style={{ color: tier.color, fontSize: 14 }}>✓</div>}
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => selectedTier && setShowPayment(true)} className="action-btn" disabled={!selectedTier} style={{
              width: "100%", padding: "15px",
              background: selectedTier ? "linear-gradient(135deg,#C8FF00,#7DCC00)" : "rgba(255,255,255,0.07)",
              border: "none", borderRadius: 16, cursor: selectedTier ? "pointer" : "not-allowed",
              color: selectedTier ? "#080E1A" : "rgba(255,255,255,0.3)",
              fontSize: 15, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif",
              transition: "all 0.2s"
            }}>
              {selectedTier ? `Promote for ${fmt(selectedTier.price)} →` : "Select an Ad Tier"}
            </button>
          </div>
        </div>
      )}
      {showPayment && (
        <MpesaSheet item={selectedTier} type="ad" onClose={() => { setShowPayment(false); onClose(); }} onSuccess={onSuccess} />
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════ */
export default function GlobalConnectPayments() {
  const [activeTab, setActiveTab] = useState("bundles");
  const [wallet, setWallet] = useState(INITIAL_WALLET);
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [mpesaItem, setMpesaItem] = useState(null);
  const [mpesaType, setMpesaType] = useState(null);
  const [showTopup, setShowTopup] = useState(false);
  const [topupAmt, setTopupAmt] = useState(50);
  const [showPromote, setShowPromote] = useState(false);
  const [transactions, setTransactions] = useState([
    { id: "GC847291030", type: "bundle", label: "Daily Bundle 500MB", amount: 20, date: "25 May 2026", color: "#00D4A8" },
    { id: "GC746210940", type: "ad",     label: "Starter Ad Campaign", amount: 150, date: "20 May 2026", color: "#C8FF00" },
  ]);

  const handleSuccess = (item, type) => {
    const newTx = {
      id: "GC" + Date.now().toString().slice(-9),
      type,
      label: type === "bundle" ? `${item.name} Bundle (${item.data})` : type === "ad" ? `${item.name} Ad` : "Wallet Top-Up",
      amount: type === "topup" ? item : item.price,
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      color: type === "bundle" ? "#00D4A8" : type === "ad" ? "#C8FF00" : "#A855F7"
    };
    setTransactions(t => [newTx, ...t]);

    if (type === "bundle") {
      setWallet(w => ({ ...w, isPremium: true, activeBundle: item.name, bundleExpiry: item.duration }));
      setSelectedBundle(null);
    }
    if (type === "topup") {
      setWallet(w => ({ ...w, credits: w.credits + item }));
    }
  };

  const tabs = [
    { id: "bundles", icon: "📶", label: "Data Bundles" },
    { id: "ads",     icon: "📢", label: "Ad Tiers" },
    { id: "wallet",  icon: "⚡", label: "Wallet" },
    { id: "history", icon: "📋", label: "History" },
  ];

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ background: "#080E1A", minHeight: "100vh", fontFamily: "'Space Grotesk',sans-serif", color: "#fff" }}>

        {/* ── TOP NAV ── */}
        <div style={{
          background: "rgba(8,14,26,0.97)", backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(200,255,0,0.1)",
          padding: "14px 20px", display: "flex", alignItems: "center", gap: 12,
          position: "sticky", top: 0, zIndex: 100
        }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: "linear-gradient(135deg,#C8FF00,#7DCC00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚡</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 16, lineHeight: 1 }}>Pulse Payments</div>
            <div style={{ color: "rgba(200,255,0,0.6)", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase" }}>Global Connect</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: "rgba(200,255,0,0.1)", border: "1px solid rgba(200,255,0,0.2)", borderRadius: 8, padding: "4px 12px" }}>
              <span style={{ color: "#C8FF00", fontSize: 13, fontWeight: 700 }}>⚡ {fmt(wallet.credits)}</span>
            </div>
            {wallet.isPremium && <div style={{ background: "rgba(0,212,168,0.15)", border: "1px solid rgba(0,212,168,0.3)", borderRadius: 8, padding: "4px 10px", color: "#00D4A8", fontSize: 11, fontWeight: 700 }}>● PREMIUM</div>}
          </div>
        </div>

        <div style={{ maxWidth: 660, margin: "0 auto", padding: "20px 16px 80px" }}>

          {/* Wallet Bar */}
          <WalletBar wallet={wallet} onTopUp={() => setShowTopup(true)} />

          {/* Tab Bar */}
          <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 4, marginBottom: 24 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className="tab-btn" style={{
                flex: 1, background: activeTab === t.id ? "linear-gradient(135deg,rgba(200,255,0,0.18),rgba(200,255,0,0.08))" : "transparent",
                border: activeTab === t.id ? "1px solid rgba(200,255,0,0.25)" : "1px solid transparent",
                borderRadius: 10, padding: "9px 4px", cursor: "pointer",
                color: activeTab === t.id ? "#C8FF00" : "rgba(255,255,255,0.4)",
                fontSize: 11, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                transition: "all 0.18s"
              }}>
                <span style={{ fontSize: 16 }}>{t.icon}</span>
                <span style={{ fontSize: 9, letterSpacing: 0.5, textTransform: "uppercase" }}>{t.label}</span>
              </button>
            ))}
          </div>

          {/* ══ DATA BUNDLES TAB ══ */}
          {activeTab === "bundles" && (
            <div style={{ animation: "fadeSlideUp 0.3s ease both" }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ color: "#fff", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Data Bundles</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Pick a plan. Pay instantly via M-Pesa.</div>
              </div>

              {/* Bundle Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                {DATA_BUNDLES.map((b, i) => (
                  <div key={b.id} className="bundle-card" onClick={() => setSelectedBundle(b)} style={{
                    animationDelay: `${i * 0.05}s`,
                    background: selectedBundle?.id === b.id
                      ? `linear-gradient(145deg,${b.color}28,${b.color}10)`
                      : "linear-gradient(145deg,#0F1C2E,#0A1628)",
                    border: `${selectedBundle?.id === b.id ? "2px" : "1px"} solid ${selectedBundle?.id === b.id ? b.color : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 18, padding: "16px 14px", cursor: "pointer",
                    transition: "all 0.2s", position: "relative", overflow: "hidden",
                    animation: "fadeSlideUp 0.35s ease both",
                  }}>
                    {b.id === "unlimited" && (
                      <div style={{ position: "absolute", top: 10, right: -22, background: b.color, color: b.textDark ? "#080E1A" : "#fff", fontSize: 8, fontWeight: 800, padding: "3px 28px", transform: "rotate(45deg)", letterSpacing: 1 }}>BEST</div>
                    )}
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{b.emoji}</div>
                    <div style={{ color: b.color, fontSize: 24, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1, lineHeight: 1 }}>{b.price}</div>
                    <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 9, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>KES</div>
                    <div style={{ color: "#fff", fontSize: 15, fontWeight: 800, marginBottom: 2 }}>{b.name}</div>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginBottom: 4 }}>{b.data} · {b.duration}</div>
                    <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, lineHeight: 1.4 }}>{b.best}</div>
                    {selectedBundle?.id === b.id && (
                      <div style={{ position: "absolute", bottom: 10, right: 12, width: 22, height: 22, borderRadius: "50%", background: b.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: b.textDark ? "#080E1A" : "#fff", fontWeight: 800 }}>✓</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Summary Table */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex" }}>
                  {["Bundle","Price","Data","Duration","Best For"].map((h, i) => (
                    <div key={h} style={{ flex: i === 4 ? 2 : 1, color: "rgba(255,255,255,0.35)", fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase" }}>{h}</div>
                  ))}
                </div>
                {DATA_BUNDLES.map((b, i) => (
                  <div key={b.id} onClick={() => setSelectedBundle(b)} style={{
                    padding: "11px 16px", borderBottom: i < DATA_BUNDLES.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    display: "flex", alignItems: "center", cursor: "pointer",
                    background: selectedBundle?.id === b.id ? `${b.color}12` : "transparent",
                    transition: "background 0.15s"
                  }}>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
                      <span>{b.emoji}</span>
                      <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>{b.name}</span>
                      {selectedBundle?.id === b.id && <span style={{ color: b.color, fontSize: 10 }}>✓</span>}
                    </div>
                    <div style={{ flex: 1, color: b.color, fontSize: 13, fontWeight: 800 }}>{b.price}</div>
                    <div style={{ flex: 1, color: "rgba(255,255,255,0.65)", fontSize: 11 }}>{b.data}</div>
                    <div style={{ flex: 1, color: "rgba(255,255,255,0.45)", fontSize: 11 }}>{b.duration}</div>
                    <div style={{ flex: 2, color: "rgba(255,255,255,0.35)", fontSize: 10 }}>{b.best}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => { if (selectedBundle) { setMpesaItem(selectedBundle); setMpesaType("bundle"); } }}
                disabled={!selectedBundle}
                className="action-btn"
                style={{
                  width: "100%", padding: "17px",
                  background: selectedBundle ? "linear-gradient(135deg,#C8FF00,#7DCC00)" : "rgba(255,255,255,0.07)",
                  border: "none", borderRadius: 16,
                  cursor: selectedBundle ? "pointer" : "not-allowed",
                  color: selectedBundle ? "#080E1A" : "rgba(255,255,255,0.3)",
                  fontSize: 16, fontWeight: 800,
                  fontFamily: "'Space Grotesk',sans-serif", transition: "all 0.2s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                }}>
                <span>📱</span>
                {selectedBundle ? `Pay ${fmt(selectedBundle.price)} — ${selectedBundle.name} Bundle` : "Select a Bundle to Continue"}
              </button>
            </div>
          )}

          {/* ══ AD TIERS TAB ══ */}
          {activeTab === "ads" && (
            <div style={{ animation: "fadeSlideUp 0.3s ease both" }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ color: "#fff", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Advertise</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Promote any post. Instant reach. Pay via M-Pesa.</div>
              </div>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 20 }}>
                {[["2.4M+","Active Users"],["6 Countries","Reach"],["<3s","Go Live"]].map(([v,l]) => (
                  <div key={l} style={{ background: "rgba(200,255,0,0.06)", border: "1px solid rgba(200,255,0,0.14)", borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
                    <div style={{ color: "#C8FF00", fontSize: 18, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1 }}>{v}</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>{l}</div>
                  </div>
                ))}
              </div>

              {/* Ad tier table */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden", marginBottom: 16 }}>
                {/* Table header */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1.5fr 1.5fr 2fr", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", gap: 8 }}>
                  {["Tier","Price","Duration","Reach","Strategy"].map(h => (
                    <div key={h} style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>{h}</div>
                  ))}
                </div>
                {/* Table rows */}
                {AD_TIERS.map((tier, i) => (
                  <div key={tier.id} className="ad-row" onClick={() => { setMpesaItem(tier); setMpesaType("ad"); }} style={{
                    display: "grid", gridTemplateColumns: "2fr 1.2fr 1.5fr 1.5fr 2fr",
                    padding: "14px 16px", gap: 8,
                    borderBottom: i < AD_TIERS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    cursor: "pointer", transition: "background 0.15s", alignItems: "center"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 9, background: tier.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{tier.emoji}</div>
                      <div style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{tier.name}</div>
                    </div>
                    <div style={{ color: tier.color, fontSize: 14, fontWeight: 800 }}>{fmt(tier.price)}</div>
                    <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11 }}>{tier.duration}</div>
                    <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11 }}>{tier.reach}</div>
                    <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, lineHeight: 1.4 }}>{tier.strategy}</div>
                  </div>
                ))}
              </div>

              {/* Card view */}
              <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none", marginBottom: 20 }}>
                {AD_TIERS.map(tier => (
                  <div key={tier.id} onClick={() => { setMpesaItem(tier); setMpesaType("ad"); }} style={{
                    flexShrink: 0, width: 160,
                    background: `linear-gradient(160deg,${tier.color}20,${tier.color}08)`,
                    border: `1px solid ${tier.color}44`,
                    borderRadius: 16, padding: "14px 12px", cursor: "pointer",
                    transition: "transform 0.2s"
                  }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{tier.emoji}</div>
                    <div style={{ color: "#fff", fontSize: 13, fontWeight: 800, marginBottom: 2 }}>{tier.name}</div>
                    <div style={{ color: tier.color, fontSize: 20, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1 }}>{fmt(tier.price)}</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, marginBottom: 6 }}>{tier.duration} · {tier.reach}</div>
                    <div style={{ background: tier.color, color: tier.textDark ? "#080E1A" : "#fff", borderRadius: 8, padding: "5px 10px", textAlign: "center", fontSize: 11, fontWeight: 800 }}>Promote →</div>
                  </div>
                ))}
              </div>

              {/* Promote existing post */}
              <div style={{ background: "rgba(200,255,0,0.05)", border: "1px solid rgba(200,255,0,0.15)", borderRadius: 16, padding: "16px" }}>
                <div style={{ color: "#fff", fontSize: 14, fontWeight: 700, marginBottom: 6 }}>📌 Promote an Existing Post</div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, marginBottom: 14 }}>Click "Promote Post" on any post in your feed, pick a tier, enter your number — go live in seconds.</div>
                <button onClick={() => setShowPromote(true)} className="action-btn" style={{
                  background: "linear-gradient(135deg,#C8FF00,#7DCC00)", border: "none", borderRadius: 12,
                  padding: "11px 24px", color: "#080E1A", fontSize: 13, fontWeight: 800,
                  cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif", transition: "all 0.18s"
                }}>📢 Promote Post (Demo)</button>
              </div>
            </div>
          )}

          {/* ══ WALLET TAB ══ */}
          {activeTab === "wallet" && (
            <div style={{ animation: "fadeSlideUp 0.3s ease both" }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ color: "#fff", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Pulse Wallet</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Top up once. Pay faster. Fewer M-Pesa prompts.</div>
              </div>

              {/* Balance card */}
              <div style={{
                background: "linear-gradient(145deg,#0F2010,#0A1A0C)",
                border: "1px solid rgba(200,255,0,0.2)",
                borderRadius: 20, padding: "28px 24px", marginBottom: 20, textAlign: "center",
                position: "relative", overflow: "hidden"
              }}>
                <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(200,255,0,0.05)" }} />
                <div style={{ position: "absolute", bottom: -20, left: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(200,255,0,0.04)" }} />
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Available Credits</div>
                <div style={{ color: "#C8FF00", fontSize: 52, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 3, lineHeight: 1 }}>{fmt(wallet.credits)}</div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 8 }}>
                  {wallet.isPremium ? `● Active: ${wallet.activeBundle} (${wallet.bundleExpiry})` : "No active bundle"}
                </div>
              </div>

              {/* Why wallet section */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "16px", marginBottom: 20 }}>
                <div style={{ color: "#fff", fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Why use Pulse Wallet?</div>
                {[
                  ["⚡","Fewer M-Pesa prompts","Top up once, pay many times without re-entering PIN"],
                  ["💸","Save on transaction fees","Batch payments reduce Safaricom API call costs"],
                  ["🚀","Instant activations","Credits deduct in milliseconds — no waiting"],
                ].map(([icon,title,desc]) => (
                  <div key={title} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(200,255,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{icon}</div>
                    <div>
                      <div style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{title}</div>
                      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, lineHeight: 1.4 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Top-up amounts */}
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>Quick Top-Up</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
                {[50, 100, 200, 500].map(amt => (
                  <button key={amt} onClick={() => setTopupAmt(amt)} style={{
                    background: topupAmt === amt ? "rgba(200,255,0,0.15)" : "rgba(255,255,255,0.05)",
                    border: `1.5px solid ${topupAmt === amt ? "rgba(200,255,0,0.5)" : "rgba(255,255,255,0.1)"}`,
                    borderRadius: 12, padding: "14px 8px",
                    color: topupAmt === amt ? "#C8FF00" : "rgba(255,255,255,0.6)",
                    fontSize: 15, fontWeight: 800, cursor: "pointer",
                    fontFamily: "'Space Grotesk',sans-serif", transition: "all 0.18s"
                  }}>{amt}</button>
                ))}
              </div>
              <button onClick={() => { setMpesaItem(topupAmt); setMpesaType("topup"); }} className="action-btn" style={{
                width: "100%", padding: "16px",
                background: "linear-gradient(135deg,#C8FF00,#7DCC00)",
                border: "none", borderRadius: 16, cursor: "pointer",
                color: "#080E1A", fontSize: 15, fontWeight: 800,
                fontFamily: "'Space Grotesk',sans-serif", transition: "all 0.18s"
              }}>⚡ Top Up {fmt(topupAmt)} via M-Pesa</button>
            </div>
          )}

          {/* ══ HISTORY TAB ══ */}
          {activeTab === "history" && (
            <div style={{ animation: "fadeSlideUp 0.3s ease both" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <div style={{ color: "#fff", fontSize: 22, fontWeight: 800, marginBottom: 2 }}>Transaction History</div>
                  <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{transactions.length} total records</div>
                </div>
                <div style={{ background: "rgba(200,255,0,0.1)", border: "1px solid rgba(200,255,0,0.2)", borderRadius: 8, padding: "5px 12px" }}>
                  <span style={{ color: "#C8FF00", fontSize: 12, fontWeight: 700 }}>All Time</span>
                </div>
              </div>

              {transactions.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.2)" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                  <div style={{ fontSize: 14 }}>No transactions yet</div>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {transactions.map((tx, i) => (
                  <div key={tx.id} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 14, padding: "14px 16px",
                    animation: `fadeSlideUp 0.3s ease ${i * 0.04}s both`
                  }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: tx.color + "20", border: `1px solid ${tx.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                      {tx.type === "bundle" ? "📶" : tx.type === "ad" ? "📢" : "⚡"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{tx.label}</div>
                      <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>{tx.date} · {tx.id}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ color: tx.color, fontSize: 15, fontWeight: 800 }}>{fmt(tx.amount)}</div>
                      <div style={{ background: "rgba(0,212,168,0.12)", border: "1px solid rgba(0,212,168,0.25)", borderRadius: 6, padding: "2px 8px", color: "#00D4A8", fontSize: 9, fontWeight: 700, marginTop: 4 }}>✓ SUCCESS</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* M-Pesa Payment Sheet */}
        {mpesaItem && (
          <MpesaSheet
            item={mpesaItem}
            type={mpesaType}
            onClose={() => { setMpesaItem(null); setMpesaType(null); }}
            onSuccess={() => handleSuccess(mpesaItem, mpesaType)}
          />
        )}

        {/* Promote Post Modal */}
        {showPromote && (
          <PromotePostModal
            post="Just launched my new handcrafted jewelry collection! 🌍✨ Check the link in bio for exclusive pieces."
            onClose={() => setShowPromote(false)}
            onSuccess={() => { setShowPromote(false); setActiveTab("history"); }}
          />
        )}

        {/* Bottom nav hint */}
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: "rgba(8,14,26,0.97)", backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(200,255,0,0.08)",
          padding: "10px 20px 16px", display: "flex", justifyContent: "center", gap: 8
        }}>
          <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, textAlign: "center" }}>
            🔒 Payments secured via Safaricom M-Pesa · Global Connect Pulse Wallet
          </div>
        </div>
      </div>
    </>
  );
}
