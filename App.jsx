import { useState, useEffect } from 'react';
import AuthPage from './AuthPage';
import GlobalConnect from './GlobalConnect';
import MpesaPortal from './MpesaPortal';
import GlobalConnectPayments from './GlobalConnectPayments';
import GCAssistant from './GCAssistant';

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #080E1A; font-family: 'Sora', sans-serif; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: rgba(0,212,168,0.3); border-radius: 4px; }
  @keyframes tabPop { 0%{transform:scale(1)} 50%{transform:scale(1.18)} 100%{transform:scale(1)} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  .gc-tab-btn:hover { background: rgba(255,255,255,0.07) !important; }
  .gc-tab-active    { animation: tabPop 0.28s ease; }
  .gc-view          { animation: fadeIn 0.22s ease both; }
`;

const TABS = [
  { id:'feed',      icon:'🌐', label:'Social',  desc:'Feed & Reels',   color:'#00D4A8' },
  { id:'mpesa',     icon:'📱', label:'M-Pesa',  desc:'Data & Airtime', color:'#C8FF00' },
  { id:'payments',  icon:'⚡', label:'Wallet',  desc:'Bundles & Ads',  color:'#A855F7' },
  { id:'assistant', icon:'🤖', label:'AI Chat', desc:'GC Assistant',   color:'#FF6B35' },
];

export default function App() {
  const [user,      setUser]      = useState(null);
  const [activeTab, setActiveTab] = useState('feed');
  const [viewKey,   setViewKey]   = useState(0);

  // Check if user is already logged in
  useEffect(() => {
    const saved = localStorage.getItem('gc_user');
    const token = localStorage.getItem('gc_token');
    if (saved && token) {
      try { setUser(JSON.parse(saved)); } catch {}
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('gc_token');
    localStorage.removeItem('gc_user');
    setUser(null);
    setActiveTab('feed');
  };

  const switchTab = (id) => {
    if (id === activeTab) return;
    setActiveTab(id);
    setViewKey(k => k + 1);
  };

  const activeColor = TABS.find(t => t.id === activeTab)?.color || '#00D4A8';

  // Show auth page if not logged in
  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:'#080E1A', overflow:'hidden' }}>

        {/* VIEWPORT */}
        <div style={{ flex:1, overflowY:'auto', overflowX:'hidden' }}>
          <div key={viewKey} className="gc-view">
            {activeTab === 'feed'      && <GlobalConnect onLogout={handleLogout} user={user} />}
            {activeTab === 'mpesa'     && <MpesaPortal user={user} />}
            {activeTab === 'payments'  && <GlobalConnectPayments user={user} />}
            {activeTab === 'assistant' && <GCAssistant user={user} />}
          </div>
        </div>

        {/* BOTTOM NAV */}
        <nav style={{
          height:'64px', display:'flex', alignItems:'stretch',
          background:'rgba(8,14,26,0.98)', backdropFilter:'blur(20px)',
          borderTop:`1px solid ${activeColor}33`,
          boxShadow:'0 -4px 24px rgba(0,0,0,0.5)',
          zIndex:9000, flexShrink:0, transition:'border-color 0.3s ease',
        }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className={`gc-tab-btn ${isActive ? 'gc-tab-active' : ''}`}
                style={{
                  flex:1, display:'flex', flexDirection:'column',
                  alignItems:'center', justifyContent:'center', gap:2,
                  background: isActive
                    ? `linear-gradient(180deg,${tab.color}18 0%,transparent 100%)`
                    : 'transparent',
                  border:'none',
                  borderTop: isActive ? `2px solid ${tab.color}` : '2px solid transparent',
                  cursor:'pointer', padding:'5px 3px',
                  transition:'all 0.2s ease', position:'relative',
                }}
              >
                {isActive && (
                  <div style={{
                    position:'absolute', top:0, left:'50%',
                    transform:'translateX(-50%)',
                    width:28, height:2,
                    background:tab.color, borderRadius:'0 0 4px 4px',
                    boxShadow:`0 2px 8px ${tab.color}88`,
                  }} />
                )}
                <span style={{
                  fontSize: isActive ? 21 : 19, lineHeight:1,
                  filter: isActive ? `drop-shadow(0 0 6px ${tab.color})` : 'none',
                  transition:'all 0.2s',
                }}>{tab.icon}</span>
                <span style={{
                  fontSize:9, fontWeight: isActive ? 800 : 500,
                  color: isActive ? tab.color : 'rgba(255,255,255,0.36)',
                  fontFamily:"'Sora',sans-serif",
                  letterSpacing: isActive ? 0.5 : 0,
                  transition:'all 0.2s',
                }}>{tab.label}</span>
                {isActive && (
                  <span style={{
                    fontSize:8, color:`${tab.color}88`,
                    fontFamily:"'Sora',sans-serif", whiteSpace:'nowrap',
                  }}>{tab.desc}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}
