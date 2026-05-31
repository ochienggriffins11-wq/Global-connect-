import { useState, useEffect } from "react";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const DATA_PLANS = [
  { id: "d1", name: "Quick Start", data: "500MB", price: 25, days: 1, speed: "4G", color: "#00B894", emoji: "⚡" },
  { id: "d2", name: "Daily Boost", data: "1GB", price: 50, days: 1, speed: "4G", color: "#0984E3", emoji: "🔋" },
  { id: "d3", name: "Weekly Plus", data: "5GB", price: 200, days: 7, speed: "4G+", color: "#6C5CE7", emoji: "📶" },
  { id: "d4", name: "Monthly Value", data: "15GB", price: 500, days: 30, speed: "4G+", color: "#E17055", emoji: "🚀" },
  { id: "d5", name: "Power User", data: "50GB", price: 1200, days: 30, speed: "5G", color: "#FDCB6E", emoji: "💎" },
  { id: "d6", name: "Unlimited", data: "Unlimited", price: 1999, days: 30, speed: "5G", color: "#00D4A8", emoji: "∞" },
  { id: "d7", name: "Social Bundle", data: "2GB Social", price: 99, days: 7, speed: "4G", color: "#FD79A8", emoji: "📱" },
  { id: "d8", name: "Night Owl", data: "10GB (12am–6am)", price: 150, days: 30, speed: "4G+", color: "#A29BFE", emoji: "🌙" },
];

const AD_PACKAGES = [
  { id: "a1", name: "Starter Boost", reach: "500–1,000", duration: "3 days", price: 500, color: "#00B894", emoji: "🌱", detail: "Perfect for testing your first ad" },
  { id: "a2", name: "Local Spark", reach: "1,000–5,000", duration: "7 days", price: 1500, color: "#0984E3", emoji: "🔥", detail: "Reach your local community" },
  { id: "a3", name: "City Wide", reach: "5,000–20,000", duration: "14 days", price: 4000, color: "#6C5CE7", emoji: "🏙", detail: "Dominate your city's feed" },
  { id: "a4", name: "National Wave", reach: "20,000–100,000", duration: "30 days", price: 10000, color: "#E17055", emoji: "🌊", detail: "Go national across the country" },
  { id: "a5", name: "Continental Pro", reach: "100,000–500,000", duration: "30 days", price: 25000, color: "#FDCB6E", emoji: "🌍", detail: "Reach all of Africa" },
  { id: "a6", name: "Global Elite", reach: "500,000+", duration: "30 days", price: 75000, color: "#FD79A8", emoji: "🌐", detail: "Maximum worldwide exposure" },
];

const AIRTIME_OPTIONS = [10, 20, 50, 100, 200, 500, 1000, 2000];

// ─── UTILS ────────────────────────────────────────────────────────────────────
const formatKES = (n) => `KES ${Number(n).toLocaleString()}`;

function PulsingDot({ color = "#00D4A8" }) {
  return (
    <span style={{ position: "relative", display: "inline-block", width: 10, height: 10 }}>
      <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: color, animation: "ping 1.4s ease-out infinite", opacity: 0.5 }} />
      <span style={{ position: "absolute", inset: 1, borderRadius: "50%", background: color }} />
      <style>{`@keyframes ping { 0%{transform:scale(1);opacity:.7} 100%{transform:scale(2.2);opacity:0} }`}</style>
    </span>
  );
}

// ─── PIN PAD ──────────────────────────────────────────────────────────────────
function PinPad({ pin, setPin, onConfirm, loading }) {
  const keys = ["1","2","3","4","5","6","7","8","9","","0","⌫"];
  const handleKey = (k) => {
    if (k === "⌫") setPin(p => p.slice(0, -1));
    else if (k && pin.length < 4) setPin(p => p + k);
  };
  return (
    <div style={{ textAlign: "center" }}>
      {/* PIN dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 14, marginBottom: 24 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width: 18, height: 18, borderRadius: "50%",
            background: i < pin.length ? "#00D4A8" : "rgba(255,255,255,0.15)",
            border: `2px solid ${i < pin.length ? "#00D4A8" : "rgba(255,255,255,0.25)"}`,
            transition: "all 0.2s",
            boxShadow: i < pin.length ? "0 0 12px #00D4A855" : "none"
          }} />
        ))}
      </div>
      {/* Numpad */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, maxWidth: 240, margin: "0 auto 20px" }}>
        {keys.map((k, i) => (
          <button key={i} onClick={() => k && handleKey(k)} style={{
            height: 52, borderRadius: 12,
            background: k === "⌫" ? "rgba(255,100,100,0.12)" : k === "" ? "transparent" : "rgba(255,255,255,0.07)",
            border: k === "" ? "none" : `1px solid ${k === "⌫" ? "rgba(255,100,100,0.2)" : "rgba(255,255,255,0.1)"}`,
            color: k === "⌫" ? "#FF6B6B" : "#fff", fontSize: k === "⌫" ? 18 : 20,
            fontFamily: "'Sora',sans-serif", fontWeight: 700,
            cursor: k ? "pointer" : "default",
            transition: "all 0.15s"
          }}>{k}</button>
        ))}
      </div>
      <button
        onClick={onConfirm}
        disabled={pin.length < 4 || loading}
        style={{
          width: "100%", maxWidth: 240, padding: "14px", borderRadius: 14,
          background: pin.length === 4 && !loading ? "linear-gradient(135deg,#00D4A8,#006B52)" : "rgba(255,255,255,0.08)",
          border: "none", color: "#fff", fontWeight: 800, fontSize: 15,
          fontFamily: "'Sora',sans-serif", cursor: pin.length === 4 && !loading ? "pointer" : "not-allowed",
          transition: "all 0.2s", letterSpacing: 0.5
        }}>
        {loading ? "⏳ Processing…" : "✓ Confirm Payment"}
      </button>
    </div>
  );
}

// ─── MPESA FLOW MODAL ────────────────────────────────────────────────────────
function MpesaFlow({ item, type, onClose, onSuccess }) {
  const [step, setStep] = useState("phone"); // phone | pin | processing | success
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const price = type === "airtime" ? item : (item?.price || 0);

  const handlePhoneNext = () => {
    if (phone.replace(/\s/g,"").length >= 9) setStep("pin");
  };

  const handleConfirm = () => {
    setLoading(true);
    setStep("processing");
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 18 + 5;
      setProgress(Math.min(p, 97));
      if (p >= 97) { clearInterval(iv); setTimeout(() => { setProgress(100); setStep("success"); setLoading(false); }, 600); }
    }, 300);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={e => e.target === e.currentTarget && step !== "processing" && onClose()}>
      <div style={{ background: "linear-gradient(160deg,#0D1F3C,#0A1628)", borderRadius: 24, width: "100%", maxWidth: 380, padding: 28, border: "1px solid rgba(0,212,168,0.2)", boxShadow: "0 40px 80px rgba(0,0,0,0.6)" }}>

        {/* Header */}
        {step !== "processing" && step !== "success" && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#00D4A8,#006B52)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📱</div>
              <div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 14, fontFamily: "'Sora',sans-serif" }}>M-Pesa Secure Pay</div>
                <div style={{ color: "#00D4A8", fontSize: 11, fontFamily: "'Sora',sans-serif", display: "flex", alignItems: "center", gap: 4 }}><PulsingDot /> Live & Secure</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", color: "rgba(255,255,255,0.6)", fontSize: 16 }}>✕</button>
          </div>
        )}

        {/* Amount box */}
        {step !== "success" && (
          <div style={{ background: "linear-gradient(135deg,rgba(0,212,168,0.12),rgba(0,107,82,0.08))", border: "1px solid rgba(0,212,168,0.2)", borderRadius: 14, padding: "14px 16px", marginBottom: 20, textAlign: "center" }}>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "'Sora',sans-serif", marginBottom: 4 }}>
              {type === "airtime" ? "Airtime Top-Up" : type === "data" ? item?.name + " Data Bundle" : "Ad Campaign — " + item?.name}
            </div>
            <div style={{ color: "#00D4A8", fontWeight: 900, fontSize: 32, fontFamily: "'Sora',sans-serif" }}>{formatKES(price)}</div>
            {type === "data" && <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "'Sora',sans-serif", marginTop: 2 }}>{item?.data} · {item?.days} day{item?.days > 1 ? "s" : ""}</div>}
            {type === "ad" && <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "'Sora',sans-serif", marginTop: 2 }}>Reach {item?.reach} users · {item?.duration}</div>}
          </div>
        )}

        {/* STEP: Phone */}
        {step === "phone" && (
          <div>
            <label style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, fontFamily: "'Sora',sans-serif", display: "block", marginBottom: 8 }}>M-Pesa Registered Phone Number</label>
            <div style={{ position: "relative", marginBottom: 16 }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "'Sora',sans-serif" }}>🇰🇪 +254</span>
              <input
                value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="712 345 678"
                style={{ width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "13px 14px 13px 80px", color: "#fff", fontSize: 16, outline: "none", fontFamily: "'Sora',sans-serif", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "'Sora',sans-serif", marginBottom: 20, textAlign: "center" }}>
              A push notification will be sent to this number to confirm payment
            </div>
            <button onClick={handlePhoneNext} style={{ width: "100%", background: "linear-gradient(135deg,#00D4A8,#006B52)", border: "none", borderRadius: 14, padding: "14px", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>
              Send M-Pesa Request →
            </button>
          </div>
        )}

        {/* STEP: PIN */}
        {step === "pin" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "'Sora',sans-serif", marginBottom: 4 }}>Enter M-Pesa PIN</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "'Sora',sans-serif" }}>+254 {phone}</div>
            </div>
            <PinPad pin={pin} setPin={setPin} onConfirm={handleConfirm} loading={loading} />
          </div>
        )}

        {/* STEP: Processing */}
        {step === "processing" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>⚡</div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 18, fontFamily: "'Sora',sans-serif", marginBottom: 8 }}>Processing Payment</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontFamily: "'Sora',sans-serif", marginBottom: 24 }}>Please wait, do not close this screen…</div>
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, height: 8, overflow: "hidden", marginBottom: 12 }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#00D4A8,#006B52)", borderRadius: 8, transition: "width 0.3s ease" }} />
            </div>
            <div style={{ color: "#00D4A8", fontSize: 12, fontFamily: "'Sora',sans-serif" }}>{Math.round(progress)}% — Contacting M-Pesa servers…</div>
          </div>
        )}

        {/* STEP: Success */}
        {step === "success" && (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#00D4A8,#006B52)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 36 }}>✓</div>
            <div style={{ color: "#00D4A8", fontWeight: 900, fontSize: 22, fontFamily: "'Sora',sans-serif", marginBottom: 6 }}>Payment Successful!</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, fontFamily: "'Sora',sans-serif", marginBottom: 4 }}>{formatKES(price)} deducted from M-Pesa</div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "'Sora',sans-serif", marginBottom: 6 }}>+254 {phone}</div>
            {type === "data" && <div style={{ background: "rgba(0,212,168,0.1)", border: "1px solid rgba(0,212,168,0.2)", borderRadius: 10, padding: "8px 14px", color: "#fff", fontSize: 12, fontFamily: "'Sora',sans-serif", marginBottom: 20 }}>📶 {item?.data} activated instantly</div>}
            {type === "ad" && <div style={{ background: "rgba(0,212,168,0.1)", border: "1px solid rgba(0,212,168,0.2)", borderRadius: 10, padding: "8px 14px", color: "#fff", fontSize: 12, fontFamily: "'Sora',sans-serif", marginBottom: 20 }}>📢 Your ad campaign is now LIVE</div>}
            <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, fontFamily: "'Sora',sans-serif", marginBottom: 20 }}>Transaction ID: GC{Date.now().toString().slice(-8)}</div>
            <button onClick={() => { onSuccess && onSuccess(); onClose(); }} style={{ width: "100%", background: "linear-gradient(135deg,#00D4A8,#006B52)", border: "none", borderRadius: 14, padding: "14px", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>Done ✓</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AD CREATOR STEP ─────────────────────────────────────────────────────────
function AdCreator({ pkg, onPay, onBack }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState("All users");
  const [category, setCategory] = useState("General");
  const targets = ["All users","18–24 yrs","25–34 yrs","35–44 yrs","Kenya only","East Africa","All Africa","Global"];
  const categories = ["General","Fashion","Food","Tech","Health","Finance","Events","Services"];
  const ready = title.trim() && body.trim();

  return (
    <div>
      <button onClick={onBack} style={{ background: "transparent", border: "none", color: "#00D4A8", cursor: "pointer", fontSize: 13, fontFamily: "'Sora',sans-serif", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
        ← Back to packages
      </button>
      <div style={{ background: `${pkg.color}18`, border: `1px solid ${pkg.color}44`, borderRadius: 14, padding: "12px 16px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "'Sora',sans-serif" }}>{pkg.emoji} {pkg.name}</div>
          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "'Sora',sans-serif" }}>Reach {pkg.reach} · {pkg.duration}</div>
        </div>
        <div style={{ color: pkg.color, fontWeight: 900, fontSize: 18, fontFamily: "'Sora',sans-serif" }}>{formatKES(pkg.price)}</div>
      </div>

      {[
        { label: "Ad Headline", val: title, set: setTitle, ph: "e.g. Best Fashion in Nairobi 🔥", type: "input" },
        { label: "Ad Description", val: body, set: setBody, ph: "Tell people about your product or service…", type: "textarea" },
      ].map(f => (
        <div key={f.label} style={{ marginBottom: 14 }}>
          <label style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, fontFamily: "'Sora',sans-serif", display: "block", marginBottom: 6 }}>{f.label}</label>
          {f.type === "input"
            ? <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} style={{ width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 13, outline: "none", fontFamily: "'Sora',sans-serif", boxSizing: "border-box" }} />
            : <textarea value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} style={{ width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 13, outline: "none", fontFamily: "'Sora',sans-serif", height: 80, resize: "none", boxSizing: "border-box", lineHeight: 1.5 }} />
          }
        </div>
      ))}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[{ label: "Target Audience", val: target, set: setTarget, opts: targets }, { label: "Category", val: category, set: setCategory, opts: categories }].map(s => (
          <div key={s.label}>
            <label style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, fontFamily: "'Sora',sans-serif", display: "block", marginBottom: 6 }}>{s.label}</label>
            <select value={s.val} onChange={e => s.set(e.target.value)} style={{ width: "100%", background: "#0D1F3C", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 12px", color: "#fff", fontSize: 12, outline: "none", fontFamily: "'Sora',sans-serif" }}>
              {s.opts.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>

      {/* Preview */}
      {ready && (
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 14, marginBottom: 16 }}>
          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "'Sora',sans-serif", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Ad Preview</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "center" }}>
            <span style={{ background: "rgba(0,212,168,0.15)", color: "#00D4A8", fontSize: 9, padding: "2px 6px", borderRadius: 6, fontFamily: "'Sora',sans-serif", fontWeight: 700 }}>SPONSORED</span>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "'Sora',sans-serif" }}>· {category}</span>
          </div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "'Sora',sans-serif", marginBottom: 4 }}>{title}</div>
          <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, fontFamily: "'Sora',sans-serif", lineHeight: 1.5 }}>{body}</div>
        </div>
      )}

      <button onClick={() => ready && onPay()} disabled={!ready} style={{ width: "100%", background: ready ? "linear-gradient(135deg,#00D4A8,#006B52)" : "rgba(255,255,255,0.08)", border: "none", borderRadius: 14, padding: "14px", color: "#fff", fontWeight: 800, fontSize: 15, cursor: ready ? "pointer" : "not-allowed", fontFamily: "'Sora',sans-serif" }}>
        💸 Pay {formatKES(pkg.price)} & Launch Ad
      </button>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function MpesaPortal() {
  const [tab, setTab] = useState("data"); // data | ads | airtime | history
  const [selectedData, setSelectedData] = useState(null);
  const [selectedAd, setSelectedAd] = useState(null);
  const [adCreating, setAdCreating] = useState(false);
  const [selectedAirtime, setSelectedAirtime] = useState(null);
  const [customAirtime, setCustomAirtime] = useState("");
  const [mpesaFlow, setMpesaFlow] = useState(null);
  const [history, setHistory] = useState([
    { id: "GC84729103", type: "data", name: "Weekly Plus 5GB", amount: 200, date: "25 May 2026", status: "success" },
    { id: "GC74621094", type: "ad", name: "Starter Boost Ad", amount: 500, date: "20 May 2026", status: "success" },
    { id: "GC63541087", type: "airtime", name: "Airtime Top-Up", amount: 100, date: "18 May 2026", status: "success" },
  ]);

  const handleSuccess = (item, type) => {
    setHistory(h => [{ id: "GC" + Date.now().toString().slice(-8), type, name: type === "airtime" ? "Airtime Top-Up" : item.name, amount: type === "airtime" ? item : item.price, date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }), status: "success" }, ...h]);
    setSelectedData(null); setSelectedAd(null); setAdCreating(false); setSelectedAirtime(null);
  };

  const tabs = [
    { id: "data", icon: "📶", label: "Data Bundles" },
    { id: "ads", icon: "📢", label: "Advertise" },
    { id: "airtime", icon: "📞", label: "Airtime" },
    { id: "history", icon: "📋", label: "History" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #060F1E; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: rgba(0,212,168,.3); border-radius: 4px; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.25); }
        select option { background: #0D1F3C; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .card-item { animation: fadeUp 0.35s ease both; }
      `}</style>

      <div style={{ background: "#060F1E", minHeight: "100vh", fontFamily: "'Sora',sans-serif", paddingBottom: 40 }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(160deg,#0A1E3D,#06162B)", borderBottom: "1px solid rgba(0,212,168,0.15)", padding: "16px 16px 0" }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg,#00D4A8,#006B52)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📱</div>
              <div>
                <div style={{ color: "#fff", fontWeight: 900, fontSize: 20, fontFamily: "'Sora',sans-serif", letterSpacing: -0.5 }}>M-Pesa Portal</div>
                <div style={{ color: "#00D4A8", fontSize: 11, fontFamily: "'Sora',sans-serif", display: "flex", alignItems: "center", gap: 5 }}><PulsingDot /> GLOBAL CONNECT · Secure Payments</div>
              </div>
            </div>
            {/* Tabs */}
            <div style={{ display: "flex", gap: 2, borderBottom: "1px solid transparent" }}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  flex: 1, background: "transparent", border: "none",
                  color: tab === t.id ? "#00D4A8" : "rgba(255,255,255,0.4)",
                  padding: "10px 4px 12px", fontSize: 11, fontFamily: "'Sora',sans-serif", fontWeight: 700,
                  cursor: "pointer", borderBottom: tab === t.id ? "2px solid #00D4A8" : "2px solid transparent",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 3, transition: "all 0.2s"
                }}>
                  <span style={{ fontSize: 18 }}>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 16px" }}>

          {/* ── DATA BUNDLES ── */}
          {tab === "data" && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 18, fontFamily: "'Sora',sans-serif", marginBottom: 4 }}>Buy Data Bundle</div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "'Sora',sans-serif" }}>Select a plan below and pay instantly with M-Pesa</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {DATA_PLANS.map((plan, i) => (
                  <div key={plan.id} className="card-item" onClick={() => setSelectedData(plan)} style={{
                    animationDelay: `${i * 0.05}s`,
                    background: selectedData?.id === plan.id ? `${plan.color}20` : "rgba(255,255,255,0.04)",
                    border: selectedData?.id === plan.id ? `2px solid ${plan.color}` : "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 16, padding: "14px 12px", cursor: "pointer", transition: "all 0.2s",
                    position: "relative", overflow: "hidden"
                  }}>
                    {plan.id === "d5" && <div style={{ position: "absolute", top: 8, right: 8, background: "#FDCB6E", color: "#000", fontSize: 9, fontWeight: 800, borderRadius: 6, padding: "2px 6px", fontFamily: "'Sora',sans-serif" }}>POPULAR</div>}
                    <div style={{ fontSize: 26, marginBottom: 6 }}>{plan.emoji}</div>
                    <div style={{ color: "#fff", fontWeight: 800, fontSize: 18, fontFamily: "'Sora',sans-serif" }}>{plan.data}</div>
                    <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontFamily: "'Sora',sans-serif", marginBottom: 8 }}>{plan.days === 1 ? "1 Day" : `${plan.days} Days`} · {plan.speed}</div>
                    <div style={{ color: plan.color, fontWeight: 900, fontSize: 17, fontFamily: "'Sora',sans-serif" }}>{formatKES(plan.price)}</div>
                    <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "'Sora',sans-serif" }}>{plan.name}</div>
                    {selectedData?.id === plan.id && <div style={{ position: "absolute", bottom: 8, right: 10, color: plan.color, fontSize: 16 }}>✓</div>}
                  </div>
                ))}
              </div>
              <button
                onClick={() => selectedData && setMpesaFlow({ item: selectedData, type: "data" })}
                disabled={!selectedData}
                style={{ width: "100%", marginTop: 16, background: selectedData ? "linear-gradient(135deg,#00D4A8,#006B52)" : "rgba(255,255,255,0.06)", border: "none", borderRadius: 16, padding: "16px", color: "#fff", fontWeight: 800, fontSize: 15, cursor: selectedData ? "pointer" : "not-allowed", fontFamily: "'Sora',sans-serif", transition: "all 0.2s" }}>
                {selectedData ? `📶 Buy ${selectedData.data} — ${formatKES(selectedData.price)}` : "Select a Data Plan Above"}
              </button>
            </div>
          )}

          {/* ── ADVERTISE ── */}
          {tab === "ads" && (
            <div>
              {!adCreating ? (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ color: "#fff", fontWeight: 800, fontSize: 18, fontFamily: "'Sora',sans-serif", marginBottom: 4 }}>Advertise on Global Connect</div>
                    <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "'Sora',sans-serif" }}>Reach your audience. Pay via M-Pesa. Go live instantly.</div>
                  </div>
                  {/* Stats banner */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 16 }}>
                    {[["2.4M+","Active Users"],["150+","Countries"],["98%","Ad Delivery"]].map(([v,l]) => (
                      <div key={l} style={{ background: "rgba(0,212,168,0.07)", border: "1px solid rgba(0,212,168,0.15)", borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
                        <div style={{ color: "#00D4A8", fontWeight: 900, fontSize: 18, fontFamily: "'Sora',sans-serif" }}>{v}</div>
                        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "'Sora',sans-serif" }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  {AD_PACKAGES.map((pkg, i) => (
                    <div key={pkg.id} className="card-item" onClick={() => setSelectedAd(pkg)} style={{
                      animationDelay: `${i * 0.06}s`,
                      background: selectedAd?.id === pkg.id ? `${pkg.color}18` : "rgba(255,255,255,0.04)",
                      border: selectedAd?.id === pkg.id ? `2px solid ${pkg.color}` : "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 16, padding: "14px 16px", marginBottom: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s"
                    }}>
                      <div style={{ width: 48, height: 48, borderRadius: 14, background: pkg.color + "30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{pkg.emoji}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "'Sora',sans-serif" }}>{pkg.name}</div>
                        <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontFamily: "'Sora',sans-serif" }}>👥 {pkg.reach} reach · 📅 {pkg.duration}</div>
                        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "'Sora',sans-serif" }}>{pkg.detail}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ color: pkg.color, fontWeight: 900, fontSize: 16, fontFamily: "'Sora',sans-serif" }}>{formatKES(pkg.price)}</div>
                        {selectedAd?.id === pkg.id && <div style={{ color: pkg.color, fontSize: 14, marginTop: 2 }}>✓</div>}
                      </div>
                    </div>
                  ))}
                  <button onClick={() => selectedAd && setAdCreating(true)} disabled={!selectedAd} style={{ width: "100%", marginTop: 4, background: selectedAd ? "linear-gradient(135deg,#00D4A8,#006B52)" : "rgba(255,255,255,0.06)", border: "none", borderRadius: 16, padding: "16px", color: "#fff", fontWeight: 800, fontSize: 15, cursor: selectedAd ? "pointer" : "not-allowed", fontFamily: "'Sora',sans-serif" }}>
                    {selectedAd ? `Create My Ad — ${formatKES(selectedAd.price)}` : "Select an Ad Package Above"}
                  </button>
                </>
              ) : (
                <AdCreator pkg={selectedAd} onBack={() => setAdCreating(false)} onPay={() => setMpesaFlow({ item: selectedAd, type: "ad" })} />
              )}
            </div>
          )}

          {/* ── AIRTIME ── */}
          {tab === "airtime" && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 18, fontFamily: "'Sora',sans-serif", marginBottom: 4 }}>Buy Airtime</div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "'Sora',sans-serif" }}>Top up any number instantly with M-Pesa</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
                {AIRTIME_OPTIONS.map(amt => (
                  <button key={amt} onClick={() => { setSelectedAirtime(amt); setCustomAirtime(""); }} style={{
                    background: selectedAirtime === amt ? "rgba(0,212,168,0.15)" : "rgba(255,255,255,0.05)",
                    border: selectedAirtime === amt ? "2px solid #00D4A8" : "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12, padding: "14px 8px", color: selectedAirtime === amt ? "#00D4A8" : "rgba(255,255,255,0.8)",
                    fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "'Sora',sans-serif", transition: "all 0.2s"
                  }}>{amt}</button>
                ))}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "'Sora',sans-serif", display: "block", marginBottom: 6 }}>Or enter custom amount (KES)</label>
                <input value={customAirtime} onChange={e => { setCustomAirtime(e.target.value); setSelectedAirtime(null); }} placeholder="e.g. 350" type="number" style={{ width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "12px 14px", color: "#fff", fontSize: 15, outline: "none", fontFamily: "'Sora',sans-serif" }} />
              </div>
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "'Sora',sans-serif", marginBottom: 8 }}>Summary</div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "'Sora',sans-serif" }}>Amount</span>
                  <span style={{ color: "#00D4A8", fontWeight: 800, fontSize: 16, fontFamily: "'Sora',sans-serif" }}>{formatKES(selectedAirtime || customAirtime || 0)}</span>
                </div>
              </div>
              <button
                onClick={() => { const amt = selectedAirtime || Number(customAirtime); amt > 0 && setMpesaFlow({ item: amt, type: "airtime" }); }}
                disabled={!selectedAirtime && !customAirtime}
                style={{ width: "100%", background: (selectedAirtime || customAirtime) ? "linear-gradient(135deg,#00D4A8,#006B52)" : "rgba(255,255,255,0.06)", border: "none", borderRadius: 16, padding: "16px", color: "#fff", fontWeight: 800, fontSize: 15, cursor: (selectedAirtime || customAirtime) ? "pointer" : "not-allowed", fontFamily: "'Sora',sans-serif" }}>
                📞 Buy Airtime {(selectedAirtime || customAirtime) ? `— ${formatKES(selectedAirtime || customAirtime)}` : ""}
              </button>
            </div>
          )}

          {/* ── HISTORY ── */}
          {tab === "history" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 18, fontFamily: "'Sora',sans-serif" }}>Transaction History</div>
                <div style={{ color: "#00D4A8", fontSize: 12, fontFamily: "'Sora',sans-serif", fontWeight: 600 }}>{history.length} records</div>
              </div>
              {history.length === 0 && <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", padding: "60px 0", fontFamily: "'Sora',sans-serif" }}>No transactions yet</div>}
              {history.map((tx, i) => {
                const icons = { data: "📶", ad: "📢", airtime: "📞" };
                const colors = { data: "#0984E3", ad: "#00D4A8", airtime: "#FDCB6E" };
                return (
                  <div key={tx.id} className="card-item" style={{ animationDelay: `${i * 0.05}s`, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: colors[tx.type] + "22", border: `1px solid ${colors[tx.type]}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{icons[tx.type]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, fontFamily: "'Sora',sans-serif" }}>{tx.name}</div>
                      <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "'Sora',sans-serif" }}>{tx.date} · ID: {tx.id}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ color: colors[tx.type], fontWeight: 800, fontSize: 14, fontFamily: "'Sora',sans-serif" }}>{formatKES(tx.amount)}</div>
                      <div style={{ color: "#00D4A8", fontSize: 10, fontFamily: "'Sora',sans-serif", background: "rgba(0,212,168,0.1)", borderRadius: 6, padding: "1px 6px", marginTop: 2 }}>✓ {tx.status}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* M-Pesa Flow Modal */}
        {mpesaFlow && (
          <MpesaFlow
            item={mpesaFlow.item}
            type={mpesaFlow.type}
            onClose={() => setMpesaFlow(null)}
            onSuccess={() => handleSuccess(mpesaFlow.item, mpesaFlow.type)}
          />
        )}
      </div>
    </>
  );
}
