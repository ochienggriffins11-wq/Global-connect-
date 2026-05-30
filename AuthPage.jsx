import { useState, useEffect } from "react";
import { supabaseAuth, db, session } from "./supabase";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #050C18; font-family: 'Outfit', sans-serif; }
  input::placeholder { color: rgba(255,255,255,0.25); }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: rgba(0,212,168,0.3); border-radius: 3px; }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes spin    { to{transform:rotate(360deg)} }
  @keyframes shake   { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-7px)} 40%,80%{transform:translateX(7px)} }
  @keyframes successBounce { 0%{transform:scale(0);opacity:0} 60%{transform:scale(1.2)} 100%{transform:scale(1);opacity:1} }
  @keyframes orb1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,-30px)} }
  @keyframes orb2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-30px,40px)} }
  .gc-input:focus { border-color: rgba(0,212,168,0.6) !important; box-shadow: 0 0 0 3px rgba(0,212,168,0.1) !important; }
  .gc-btn-main:hover:not(:disabled) { filter:brightness(1.08); transform:translateY(-1px); }
  .gc-btn-main:disabled { opacity:0.5; cursor:not-allowed; }
  .gc-link:hover { color:#00D4A8 !important; }
`;

const SUPA_URL = "https://nwpaujbduepemvipepsq.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cGF1amJkdWVwZW12aXBlcHNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2OTQ2MDQsImV4cCI6MjA5NTI3MDYwNH0.HDH0YtQvSaxS-Jxx1L1_CRQ_72uKuEVitmzEY05fp3k";

const auth = {
  async signUp(email, password, username, fullName) {
    const r = await fetch(`${SUPA_URL}/auth/v1/signup`, { method:"POST", headers:{"Content-Type":"application/json","apikey":SUPA_KEY}, body:JSON.stringify({email,password,data:{username,full_name:fullName}}) });
    return r.json();
  },
  async signIn(email, password) {
    const r = await fetch(`${SUPA_URL}/auth/v1/token?grant_type=password`, { method:"POST", headers:{"Content-Type":"application/json","apikey":SUPA_KEY}, body:JSON.stringify({email,password}) });
    return r.json();
  },
  async reset(email) {
    const r = await fetch(`${SUPA_URL}/auth/v1/recover`, { method:"POST", headers:{"Content-Type":"application/json","apikey":SUPA_KEY}, body:JSON.stringify({email}) });
    return r.json();
  },
  google() { window.location.href = `${SUPA_URL}/auth/v1/authorize?provider=google&redirect_to=${window.location.origin}`; },
};

const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

const getStrength = (pwd) => {
  if (!pwd) return {label:"",color:"transparent",width:"0%"};
  let s=0;
  if(pwd.length>=8)s++;if(pwd.length>=12)s++;if(/[A-Z]/.test(pwd))s++;if(/[0-9]/.test(pwd))s++;if(/[^A-Za-z0-9]/.test(pwd))s++;
  return [{label:"",color:"transparent",width:"0%"},{label:"Weak",color:"#FF4757",width:"20%"},{label:"Fair",color:"#FF6B35",width:"40%"},{label:"Good",color:"#F59E0B",width:"60%"},{label:"Strong",color:"#00D4A8",width:"80%"},{label:"Perfect",color:"#C8FF00",width:"100%"}][Math.min(s,5)];
};

const BgOrbs = () => (
  <div style={{position:"fixed",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0}}>
    <div style={{position:"absolute",top:"10%",left:"15%",width:320,height:320,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,212,168,0.12),transparent 70%)",animation:"orb1 12s ease-in-out infinite",filter:"blur(40px)"}}/>
    <div style={{position:"absolute",bottom:"15%",right:"10%",width:280,height:280,borderRadius:"50%",background:"radial-gradient(circle,rgba(168,85,247,0.1),transparent 70%)",animation:"orb2 15s ease-in-out infinite",filter:"blur(50px)"}}/>
    <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(0,212,168,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,168,0.03) 1px,transparent 1px)",backgroundSize:"60px 60px",opacity:.5}}/>
  </div>
);

const Field = ({label,type="text",value,onChange,placeholder,icon,error,hint,autoComplete}) => {
  const [show,setShow]=useState(false);
  const isPwd=type==="password";
  return (
    <div style={{marginBottom:error?6:16}}>
      <label style={{display:"block",color:"rgba(255,255,255,0.55)",fontSize:12,fontWeight:600,letterSpacing:1,textTransform:"uppercase",marginBottom:7}}>{label}</label>
      <div style={{position:"relative"}}>
        {icon&&<span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:16,opacity:.5}}>{icon}</span>}
        <input value={value} onChange={e=>onChange(e.target.value)} type={isPwd&&show?"text":type} placeholder={placeholder} autoComplete={autoComplete} className="gc-input"
          style={{width:"100%",background:"rgba(255,255,255,0.06)",border:`1.5px solid ${error?"#FF4757":"rgba(255,255,255,0.1)"}`,borderRadius:14,padding:`13px 14px 13px ${icon?"42px":"14px"}`,paddingRight:isPwd?"48px":"14px",color:"#fff",fontSize:15,outline:"none",fontFamily:"'Outfit',sans-serif",transition:"all 0.2s"}}
        />
        {isPwd&&<button onClick={()=>setShow(!show)} type="button" style={{position:"absolute",right:13,top:"50%",transform:"translateY(-50%)",background:"transparent",border:"none",cursor:"pointer",fontSize:16,opacity:.5,color:"#fff"}}>{show?"🙈":"👁"}</button>}
      </div>
      {error&&<div style={{color:"#FF4757",fontSize:11,marginTop:5,paddingLeft:4}}>⚠ {error}</div>}
      {hint&&!error&&<div style={{color:"rgba(255,255,255,0.28)",fontSize:11,marginTop:5,paddingLeft:4}}>{hint}</div>}
    </div>
  );
};

const StrengthBar = ({password}) => {
  const s=getStrength(password);
  if(!password)return null;
  return (
    <div style={{marginTop:-8,marginBottom:16}}>
      <div style={{background:"rgba(255,255,255,0.08)",borderRadius:4,height:4,overflow:"hidden"}}>
        <div style={{height:"100%",width:s.width,background:s.color,borderRadius:4,transition:"all 0.4s ease"}}/>
      </div>
      <div style={{color:s.color,fontSize:11,marginTop:4,fontWeight:600}}>{s.label}</div>
    </div>
  );
};

const GoogleBtn = ({onClick,loading}) => (
  <button onClick={onClick} disabled={loading} style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"1.5px solid rgba(255,255,255,0.12)",borderRadius:14,padding:"13px",display:"flex",alignItems:"center",justifyContent:"center",gap:10,cursor:"pointer",color:"#fff",fontSize:14,fontWeight:600,fontFamily:"'Outfit',sans-serif",transition:"all 0.18s",marginBottom:16}}>
    <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
    Continue with Google
  </button>
);

const Divider = () => (
  <div style={{display:"flex",alignItems:"center",gap:12,margin:"4px 0 16px"}}>
    <div style={{flex:1,height:1,background:"rgba(255,255,255,0.08)"}}/>
    <span style={{color:"rgba(255,255,255,0.28)",fontSize:12}}>or</span>
    <div style={{flex:1,height:1,background:"rgba(255,255,255,0.08)"}}/>
  </div>
);

const MainBtn = ({children,onClick,loading,disabled}) => (
  <button onClick={onClick} disabled={disabled||loading} className="gc-btn-main" style={{width:"100%",padding:"15px",background:"linear-gradient(135deg,#00D4A8,#006B52)",border:"none",borderRadius:14,color:"#fff",fontSize:15,fontWeight:800,fontFamily:"'Outfit',sans-serif",cursor:"pointer",transition:"all 0.2s",display:"flex",alignItems:"center",justifyContent:"center",gap:10,boxShadow:"0 4px 20px rgba(0,212,168,0.25)"}}>
    {loading?<><div style={{width:18,height:18,borderRadius:"50%",border:"2.5px solid rgba(255,255,255,0.3)",borderTop:"2.5px solid #fff",animation:"spin 0.8s linear infinite"}}/>Processing…</>:children}
  </button>
);

function LoginForm({onSwitch,onSuccess}) {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [errors,setErrors]=useState({});
  const [loading,setLoading]=useState(false);
  const [shake,setShake]=useState(false);

  const validate = () => {
    const e={};
    if(!email)e.email="Email is required";else if(!validateEmail(email))e.email="Enter a valid email";
    if(!password)e.password="Password is required";else if(password.length<6)e.password="At least 6 characters";
    setErrors(e);return Object.keys(e).length===0;
  };

  const handleLogin = async () => {
    if(!validate()){setShake(true);setTimeout(()=>setShake(false),600);return;}
    setLoading(true);
    try {
      const data = await auth.signIn(email,password);
      if(data.access_token){
        localStorage.setItem("gc_token",data.access_token);
        localStorage.setItem("gc_user",JSON.stringify(data.user));
        onSuccess&&onSuccess(data.user);
      } else {
        setErrors({general:data.error_description||"Invalid email or password."});
        setShake(true);setTimeout(()=>setShake(false),600);
      }
    } catch { setErrors({general:"Connection error. Please try again."}); }
    finally { setLoading(false); }
  };

  return (
    <div style={{animation:"fadeUp 0.35s ease both"}}>
      <GoogleBtn onClick={()=>auth.google()} loading={loading}/>
      <Divider/>
      <div style={{animation:shake?"shake 0.5s ease":"none"}}>
        <Field label="Email Address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" icon="✉️" error={errors.email} autoComplete="email"/>
        <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="Enter your password" icon="🔒" error={errors.password} autoComplete="current-password"/>
      </div>
      {errors.general&&<div style={{background:"rgba(255,71,87,0.1)",border:"1px solid rgba(255,71,87,0.25)",borderRadius:10,padding:"10px 13px",marginBottom:16,color:"#FF4757",fontSize:13}}>⚠️ {errors.general}</div>}
      <div style={{textAlign:"right",marginTop:-8,marginBottom:16}}>
        <button onClick={()=>onSwitch("reset")} className="gc-link" style={{background:"transparent",border:"none",color:"rgba(255,255,255,0.45)",fontSize:13,cursor:"pointer",fontFamily:"'Outfit',sans-serif",transition:"color 0.2s"}}>Forgot password?</button>
      </div>
      <MainBtn onClick={handleLogin} loading={loading}>🚀 Sign In to Global Connect</MainBtn>
      <div style={{textAlign:"center",marginTop:20,color:"rgba(255,255,255,0.4)",fontSize:14}}>
        Don't have an account?{" "}
        <button onClick={()=>onSwitch("signup")} className="gc-link" style={{background:"transparent",border:"none",color:"#00D4A8",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>Sign Up Free</button>
      </div>
    </div>
  );
}

function SignupForm({onSwitch,onSuccess}) {
  const [step,setStep]=useState(1);
  const [fullName,setFullName]=useState("");
  const [username,setUsername]=useState("");
  const [phone,setPhone]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [confirm,setConfirm]=useState("");
  const [agreed,setAgreed]=useState(false);
  const [errors,setErrors]=useState({});
  const [loading,setLoading]=useState(false);
  const [shake,setShake]=useState(false);

  const v1=()=>{const e={};if(!fullName.trim()||fullName.trim().length<3)e.fullName="Full name required (min 3 chars)";if(!username.trim()||username.length<3)e.username="Username required (min 3 chars)";else if(!/^[a-z0-9_]+$/.test(username))e.username="Only lowercase letters, numbers, underscore";setErrors(e);return Object.keys(e).length===0;};
  const v2=()=>{const e={};if(!email||!validateEmail(email))e.email="Valid email required";if(!password||password.length<8)e.password="Password min 8 characters";if(confirm!==password)e.confirm="Passwords do not match";if(!agreed)e.agreed="Please agree to continue";setErrors(e);return Object.keys(e).length===0;};

  const handleSignup = async () => {
    if(!v2()){setShake(true);setTimeout(()=>setShake(false),600);return;}
    setLoading(true);
    try {
      const data = await auth.signUp(email,password,username,fullName);
      if(data.id||(data.user&&data.user.id)){
        onSuccess&&onSuccess("verify");
      } else {
        setErrors({general:data.error_description||"Signup failed. Email may already be registered."});
        setShake(true);setTimeout(()=>setShake(false),600);
      }
    } catch { setErrors({general:"Connection error. Please try again."}); }
    finally { setLoading(false); }
  };

  return (
    <div style={{animation:"fadeUp 0.35s ease both"}}>
      <div style={{display:"flex",gap:8,marginBottom:24,alignItems:"center"}}>
        {[1,2].map(n=><div key={n} style={{flex:1,height:3,borderRadius:3,background:step>=n?"linear-gradient(90deg,#00D4A8,#006B52)":"rgba(255,255,255,0.1)",transition:"all 0.3s"}}/>)}
        <span style={{color:"rgba(255,255,255,0.38)",fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>Step {step} of 2</span>
      </div>

      {step===1&&(
        <>
          <GoogleBtn onClick={()=>auth.google()} loading={loading}/>
          <Divider/>
          <div style={{animation:shake?"shake 0.5s ease":"none"}}>
            <Field label="Full Name" value={fullName} onChange={setFullName} placeholder="e.g. Amara Osei" icon="👤" error={errors.fullName} autoComplete="name"/>
            <Field label="Username" value={username} onChange={v=>setUsername(v.toLowerCase().replace(/[^a-z0-9_]/g,""))} placeholder="e.g. amara_osei" icon="@" error={errors.username} hint="Lowercase letters, numbers, underscore only" autoComplete="username"/>
            <Field label="Phone (M-Pesa)" value={phone} onChange={setPhone} placeholder="0712 345 678" icon="📱" hint="Optional — for M-Pesa payments" autoComplete="tel"/>
          </div>
          <MainBtn onClick={()=>{if(!v1()){setShake(true);setTimeout(()=>setShake(false),600);}else setStep(2);}}>Continue → Account Details</MainBtn>
        </>
      )}

      {step===2&&(
        <>
          <button onClick={()=>setStep(1)} style={{background:"transparent",border:"none",color:"#00D4A8",cursor:"pointer",fontSize:13,fontWeight:600,marginBottom:16,fontFamily:"'Outfit',sans-serif"}}>← Back</button>
          <div style={{animation:shake?"shake 0.5s ease":"none"}}>
            <Field label="Email Address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" icon="✉️" error={errors.email} autoComplete="email"/>
            <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="Create a strong password" icon="🔒" error={errors.password} autoComplete="new-password"/>
            <StrengthBar password={password}/>
            <Field label="Confirm Password" type="password" value={confirm} onChange={setConfirm} placeholder="Repeat your password" icon="🔒" error={errors.confirm} autoComplete="new-password"/>
          </div>
          {errors.general&&<div style={{background:"rgba(255,71,87,0.1)",border:"1px solid rgba(255,71,87,0.25)",borderRadius:10,padding:"10px 13px",marginBottom:14,color:"#FF4757",fontSize:13}}>⚠️ {errors.general}</div>}
          <div style={{marginBottom:errors.agreed?4:18}}>
            <label style={{display:"flex",gap:10,alignItems:"flex-start",cursor:"pointer"}}>
              <div onClick={()=>setAgreed(!agreed)} style={{width:20,height:20,borderRadius:6,border:`2px solid ${agreed?"#00D4A8":"rgba(255,255,255,0.2)"}`,background:agreed?"linear-gradient(135deg,#00D4A8,#006B52)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,transition:"all 0.2s",cursor:"pointer"}}>
                {agreed&&<span style={{color:"#fff",fontSize:11,fontWeight:800}}>✓</span>}
              </div>
              <span style={{color:"rgba(255,255,255,0.5)",fontSize:13,lineHeight:1.5}}>
                I agree to{" "}
                <button onClick={()=>onSwitch("terms")} className="gc-link" style={{background:"transparent",border:"none",color:"#00D4A8",cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontSize:13,fontWeight:600}}>Terms</button>
                {" "}and{" "}
                <button onClick={()=>onSwitch("privacy")} className="gc-link" style={{background:"transparent",border:"none",color:"#00D4A8",cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontSize:13,fontWeight:600}}>Privacy Policy</button>
              </span>
            </label>
          </div>
          {errors.agreed&&<div style={{color:"#FF4757",fontSize:11,marginBottom:14,paddingLeft:30}}>⚠ {errors.agreed}</div>}
          <MainBtn onClick={handleSignup} loading={loading} disabled={!agreed}>🌍 Create My Account</MainBtn>
        </>
      )}

      <div style={{textAlign:"center",marginTop:20,color:"rgba(255,255,255,0.4)",fontSize:14}}>
        Already have an account?{" "}
        <button onClick={()=>onSwitch("login")} className="gc-link" style={{background:"transparent",border:"none",color:"#00D4A8",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>Sign In</button>
      </div>
    </div>
  );
}

function ResetForm({onSwitch}) {
  const [email,setEmail]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  const [sent,setSent]=useState(false);

  const handle = async () => {
    if(!email){setError("Email is required");return;}
    if(!validateEmail(email)){setError("Enter a valid email");return;}
    setError("");setLoading(true);
    try{await auth.reset(email);setSent(true);}
    catch{setError("Connection error. Please try again.");}
    finally{setLoading(false);}
  };

  if(sent)return(
    <div style={{textAlign:"center",animation:"fadeUp 0.35s ease both"}}>
      <div style={{width:80,height:80,borderRadius:"50%",background:"linear-gradient(135deg,#00D4A8,#006B52)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,margin:"0 auto 20px",animation:"successBounce 0.5s cubic-bezier(.22,.68,0,1.3) both",boxShadow:"0 0 40px rgba(0,212,168,0.4)"}}>✉️</div>
      <div style={{color:"#C8FF00",fontSize:22,fontWeight:800,marginBottom:8}}>Check Your Email!</div>
      <div style={{color:"rgba(255,255,255,0.6)",fontSize:14,lineHeight:1.6,marginBottom:8}}>Reset link sent to:</div>
      <div style={{color:"#00D4A8",fontWeight:700,fontSize:15,marginBottom:24}}>{email}</div>
      <div style={{color:"rgba(255,255,255,0.35)",fontSize:12,marginBottom:28,lineHeight:1.6}}>Check your inbox and spam folder. Link expires in 1 hour.</div>
      <button onClick={()=>onSwitch("login")} style={{background:"linear-gradient(135deg,#00D4A8,#006B52)",border:"none",borderRadius:14,padding:"13px 32px",color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>Back to Sign In</button>
    </div>
  );

  return(
    <div style={{animation:"fadeUp 0.35s ease both"}}>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{fontSize:42,marginBottom:10}}>🔑</div>
        <div style={{color:"rgba(255,255,255,0.55)",fontSize:14,lineHeight:1.6}}>Enter your email and we will send a reset link.</div>
      </div>
      <Field label="Email Address" type="email" value={email} onChange={v=>{setEmail(v);setError("");}} placeholder="you@example.com" icon="✉️" error={error} autoComplete="email"/>
      <MainBtn onClick={handle} loading={loading}>📧 Send Reset Link</MainBtn>
      <div style={{textAlign:"center",marginTop:20}}>
        <button onClick={()=>onSwitch("login")} className="gc-link" style={{background:"transparent",border:"none",color:"rgba(255,255,255,0.45)",fontSize:14,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>← Back to Sign In</button>
      </div>
    </div>
  );
}

function VerifyScreen({onSwitch}) {
  return(
    <div style={{textAlign:"center",animation:"fadeUp 0.35s ease both"}}>
      <div style={{width:90,height:90,borderRadius:"50%",background:"linear-gradient(135deg,#C8FF00,#7DCC00)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,margin:"0 auto 16px",animation:"successBounce 0.5s cubic-bezier(.22,.68,0,1.3) both",boxShadow:"0 0 40px rgba(200,255,0,0.4)"}}>✓</div>
      <div style={{color:"#C8FF00",fontSize:24,fontWeight:900,marginBottom:8}}>Account Created! 🎉</div>
      <div style={{color:"rgba(255,255,255,0.6)",fontSize:14,lineHeight:1.7,marginBottom:8}}>Welcome to Global Connect! 🌍</div>
      <div style={{color:"rgba(255,255,255,0.4)",fontSize:13,lineHeight:1.6,marginBottom:28}}>Check your email to verify your account then sign in!</div>
      <button onClick={()=>onSwitch("login")} style={{background:"linear-gradient(135deg,#00D4A8,#006B52)",border:"none",borderRadius:14,padding:"14px 36px",color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:"'Outfit',sans-serif",boxShadow:"0 4px 20px rgba(0,212,168,0.3)"}}>Sign In Now →</button>
    </div>
  );
}

function TermsScreen({onBack}) {
  const items=[["1. Acceptance","By using Global Connect you agree to these terms. You must be at least 13 years old."],["2. Your Account","You are responsible for your account security. Provide accurate information when signing up."],["3. Content","You own what you post. Do not post illegal, harmful, or offensive content."],["4. Payments","All payments processed via M-Pesa and IntaSend. Data bundles activate immediately after payment."],["5. Advertising","We may reject ads that violate guidelines. No refunds once campaigns have started."],["6. Privacy","We do not sell your data. See our Privacy Policy for full details."],["7. Contact","support@globalconnect.app"]];
  return(
    <div style={{animation:"fadeUp 0.3s ease both"}}>
      <button onClick={onBack} style={{background:"transparent",border:"none",color:"#00D4A8",cursor:"pointer",fontSize:13,fontWeight:600,marginBottom:16,fontFamily:"'Outfit',sans-serif"}}>← Back</button>
      <div style={{color:"#fff",fontWeight:800,fontSize:20,marginBottom:4}}>Terms of Service</div>
      <div style={{color:"rgba(255,255,255,0.35)",fontSize:11,marginBottom:20}}>Last updated: May 2026</div>
      <div style={{maxHeight:360,overflowY:"auto",paddingRight:8}}>
        {items.map(([t,b])=><div key={t} style={{marginBottom:16}}><div style={{color:"#00D4A8",fontWeight:700,fontSize:13,marginBottom:5}}>{t}</div><div style={{color:"rgba(255,255,255,0.58)",fontSize:13,lineHeight:1.7}}>{b}</div></div>)}
      </div>
    </div>
  );
}

function PrivacyScreen({onBack}) {
  const items=[["What We Collect","Name, email, phone number, posts, messages, and payment records."],["How We Use It","To provide services, process payments, and keep your account secure."],["M-Pesa Payments","Processed by IntaSend and Safaricom. We never store your M-Pesa PIN."],["Data Sharing","We do not sell your data. We share only with payment processors and when required by Kenyan law."],["Your Rights","Access, correct, or delete your data anytime from account settings."],["Security","All data encrypted in transit and at rest."],["Contact","privacy@globalconnect.app"]];
  return(
    <div style={{animation:"fadeUp 0.3s ease both"}}>
      <button onClick={onBack} style={{background:"transparent",border:"none",color:"#00D4A8",cursor:"pointer",fontSize:13,fontWeight:600,marginBottom:16,fontFamily:"'Outfit',sans-serif"}}>← Back</button>
      <div style={{color:"#fff",fontWeight:800,fontSize:20,marginBottom:4}}>Privacy Policy</div>
      <div style={{color:"rgba(255,255,255,0.35)",fontSize:11,marginBottom:20}}>Last updated: May 2026</div>
      <div style={{maxHeight:360,overflowY:"auto",paddingRight:8}}>
        {items.map(([t,b])=><div key={t} style={{marginBottom:16}}><div style={{color:"#00D4A8",fontWeight:700,fontSize:13,marginBottom:5}}>{t}</div><div style={{color:"rgba(255,255,255,0.58)",fontSize:13,lineHeight:1.7}}>{b}</div></div>)}
      </div>
    </div>
  );
}

export default function AuthPage({onLogin}) {
  const [screen,setScreen]=useState("login");
  const [key,setKey]=useState(0);

  useEffect(()=>{
    const token=localStorage.getItem("gc_token");
    const user=localStorage.getItem("gc_user");
    if(token&&user){try{onLogin&&onLogin(JSON.parse(user));}catch{}}
  },[]);

  const sw=(s)=>{setScreen(s);setKey(k=>k+1);};
  const titles={login:{title:"Welcome Back",sub:"Sign in to your Global Connect account"},signup:{title:"Join Global Connect",sub:"Africa's fastest growing social platform"},reset:{title:"Reset Password",sub:"We will help you get back in"},verify:{title:"Almost There!",sub:"One last step"},terms:{title:"Terms of Service",sub:"Please read before signing up"},privacy:{title:"Privacy Policy",sub:"How we protect your data"}};
  const info=titles[screen]||titles.login;

  return(
    <>
      <style>{CSS}</style>
      <BgOrbs/>
      <div style={{position:"relative",zIndex:2,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px 16px 40px"}}>
        <div style={{textAlign:"center",marginBottom:28,animation:"fadeUp 0.4s ease both"}}>
          <div style={{width:64,height:64,borderRadius:20,background:"linear-gradient(135deg,#00D4A8,#006B52)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,margin:"0 auto 14px",boxShadow:"0 8px 32px rgba(0,212,168,0.4)"}}>🌐</div>
          <div style={{color:"#00D4A8",fontWeight:900,fontSize:26,letterSpacing:-.5}}>GLOBAL<span style={{color:"#fff"}}>CONNECT</span></div>
          <div style={{color:"rgba(255,255,255,0.35)",fontSize:11,letterSpacing:3,textTransform:"uppercase",marginTop:4}}>Africa's Social Platform</div>
        </div>
        <div style={{width:"100%",maxWidth:420,background:"rgba(255,255,255,0.04)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:24,padding:"28px 24px",boxShadow:"0 24px 64px rgba(0,0,0,0.5)",animation:"fadeUp 0.4s ease 0.1s both",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:"20%",right:"20%",height:1,background:"linear-gradient(90deg,transparent,rgba(0,212,168,0.5),transparent)"}}/>
          {screen!=="verify"&&<div style={{marginBottom:24}}><div style={{color:"#fff",fontWeight:800,fontSize:22,marginBottom:4}}>{info.title}</div><div style={{color:"rgba(255,255,255,0.4)",fontSize:13}}>{info.sub}</div></div>}
          <div key={key}>
            {screen==="login"   &&<LoginForm   onSwitch={sw} onSuccess={onLogin}/>}
            {screen==="signup"  &&<SignupForm  onSwitch={sw} onSuccess={s=>s==="verify"?sw("verify"):null}/>}
            {screen==="reset"   &&<ResetForm   onSwitch={sw}/>}
            {screen==="verify"  &&<VerifyScreen onSwitch={sw}/>}
            {screen==="terms"   &&<TermsScreen  onBack={()=>sw("signup")}/>}
            {screen==="privacy" &&<PrivacyScreen onBack={()=>sw("signup")}/>}
          </div>
        </div>
        <div style={{textAlign:"center",marginTop:24,color:"rgba(255,255,255,0.2)",fontSize:11,lineHeight:1.8,animation:"fadeIn 0.5s ease 0.4s both"}}>
          🔒 Secured by Supabase · Payments by IntaSend<br/>© 2026 Global Connect. All rights reserved.
        </div>
      </div>
    </>
  );
}
