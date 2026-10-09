import { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  ChevronRight,
  CircleHelp,
  Code2,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  LogOut,
  Shield,
  Sparkles,
  UserRound,
  UsersRound
} from "lucide-react";

const TOKEN_KEY = "keyspace_token";
const USER_KEY = "keyspace_user";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers }
    });
  } catch {
    throw new Error(API_BASE_URL
      ? "Can't reach the authentication API. Please try again in a moment."
      : "The authentication API isn't configured yet. Set the VITE_API_BASE_URL repository variable after deploying the API.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "The request could not be completed.");
  return data;
}

export default function App() {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(USER_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [protectedData, setProtectedData] = useState(null);
  const [checkingAccess, setCheckingAccess] = useState(false);

  useEffect(() => {
    if (!token || !user) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setToken(null);
      setUser(null);
    }
  }, []);

  function showMessage(text, type) {
    setMessage(text);
    setMessageType(type);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await request(`/${mode === "login" ? "login" : "register"}`, {
        method: "POST",
        body: JSON.stringify({ username, password })
      });

      if (mode === "register") {
        showMessage(response.message, "success");
        setMode("login");
        setPassword("");
      } else {
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
        setToken(response.token);
        setUser(response.user);
        setPassword("");
        setProtectedData(null);
        showMessage("You're signed in. Your private space is ready.", "success");
      }
    } catch (error) {
      showMessage(error.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function openProtectedSpace() {
    setCheckingAccess(true);
    setMessage("");
    try {
      const result = await request("/protected", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProtectedData(result);
      showMessage("Access granted — your token was verified.", "success");
    } catch (error) {
      if (error.message.includes("expired") || error.message.includes("valid bearer")) {
        signOut();
      }
      showMessage(error.message, "error");
    } finally {
      setCheckingAccess(false);
    }
  }

  function signOut() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    setProtectedData(null);
    setMessage("");
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Keyspace home">
          <span className="brand-mark"><KeyRound size={17} strokeWidth={2.5} /></span>
          <span>keyspace<span className="brand-period">.</span></span>
        </a>
        <div className="topbar-right">
          <span className="api-status"><span className="status-dot" /> API ready</span>
          <button className="help-link" type="button" onClick={() => showMessage("Create an account, sign in, then open your private space to verify the JWT-protected route.", "info")}>
            <CircleHelp size={16} /> Help
          </button>
        </div>
      </header>

      <div className="layout">
        <section className="intro-panel">
          <div className="eyebrow"><span className="eyebrow-spark"><Sparkles size={13} /></span> YOUR SPACE, SECURED</div>
          <h1>One key.<br /><span>Every door.</span></h1>
          <p className="intro-copy">A simple, secure way to access your personal workspace. Sign in to unlock what’s yours.</p>

          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-icon"><Fingerprint size={18} /></span>
              <div><strong>Made for you</strong><span>Your account, your private space.</span></div>
              <Check className="feature-check" size={15} />
            </div>
            <div className="feature-item">
              <span className="feature-icon"><Shield size={18} /></span>
              <div><strong>Secure by design</strong><span>Protected with token-based access.</span></div>
              <Check className="feature-check" size={15} />
            </div>
            <div className="feature-item">
              <span className="feature-icon"><ArrowDownToLine size={18} /></span>
              <div><strong>Pick up where you left off</strong><span>Your session stays with you.</span></div>
              <Check className="feature-check" size={15} />
            </div>
          </div>

          <div className="quote-card">
            <div className="quote-stars">★★★★★</div>
            <p>“Finally, a login that feels as effortless as it should.”</p>
            <div className="quote-author"><div className="avatar">JM</div><span><strong>Jamie M.</strong><small>Keyspace member</small></span><span className="verified"><Check size={12} /></span></div>
          </div>
          <div className="decor decor-one" /><div className="decor decor-two" />
        </section>

        <section className="form-panel">
          {!user ? (
            <div className="auth-card">
              <div className="card-topline"><span className="card-icon"><LockKeyhole size={18} /></span><span className="secure-label"><span /> SECURE CONNECTION</span></div>
              <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
              <p className="card-subtitle">{mode === "login" ? "Your space is just a sign in away." : "A few details and you’re all set."}</p>

              <div className="tabs" role="tablist" aria-label="Authentication options">
                <button className={mode === "login" ? "tab active" : "tab"} type="button" role="tab" aria-selected={mode === "login"} onClick={() => { setMode("login"); setMessage(""); }}>Sign in</button>
                <button className={mode === "register" ? "tab active" : "tab"} type="button" role="tab" aria-selected={mode === "register"} onClick={() => { setMode("register"); setMessage(""); }}>Create account</button>
              </div>

              <form onSubmit={handleSubmit}>
                <label htmlFor="username">Username</label>
                <div className="input-wrap"><UserRound size={17} /><input id="username" autoComplete="username" placeholder="e.g. alex_jones" value={username} onChange={(event) => setUsername(event.target.value)} minLength={3} maxLength={24} required /></div>
                <div className="field-hint">3–24 characters · letters, numbers, underscores</div>

                <div className="password-label"><label htmlFor="password">Password</label>{mode === "login" && <span>Forgot password?</span>}</div>
                <div className="input-wrap"><KeyRound size={17} /><input id="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="At least 8 characters" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} maxLength={72} required /></div>
                <div className="field-hint">Use 8 or more characters</div>

                {message && <div className={`notice ${messageType}`} role="status">{messageType === "success" && <Check size={15} />}{message}</div>}
                <button className="submit-button" type="submit" disabled={loading}>
                  {loading ? "Please wait…" : mode === "login" ? "Sign in to your space" : "Create your account"}
                  {!loading && <ArrowRight size={17} />}
                </button>
              </form>
              <div className="card-footer"><Shield size={14} /> Your credentials are encrypted and kept private.</div>
            </div>
          ) : (
            <div className="auth-card dashboard-card">
              <div className="card-topline"><span className="card-icon success-icon"><Check size={18} /></span><span className="secure-label active-session"><span /> SESSION ACTIVE</span></div>
              <div className="welcome-avatar">{user.username.slice(0, 1).toUpperCase()}</div>
              <h2>Your space is ready.</h2>
              <p className="card-subtitle">Signed in as <strong>{user.username}</strong>. Your identity has been verified.</p>
              {message && <div className={`notice ${messageType}`} role="status">{messageType === "success" && <Check size={15} />}{message}</div>}
              <div className={`protected-box ${protectedData ? "unlocked" : ""}`}>
                <div className="protected-head"><span className="protected-icon"><Shield size={18} /></span><span><strong>Private space</strong><small>{protectedData ? "Protected route verified" : "Only you can access this"}</small></span><span className="lock-badge">{protectedData ? <Check size={14} /> : <LockKeyhole size={14} />}</span></div>
                {protectedData ? (
                  <div className="access-result"><div className="access-badge"><Check size={13} /> ACCESS GRANTED</div><p>{protectedData.message}</p><div className="identity-row"><span className="identity-icon"><UserRound size={15} /></span><span><small>AUTHENTICATED USER</small><strong>{protectedData.user.username}</strong></span><span className="identity-id">ID {protectedData.user.id}</span></div></div>
                ) : (
                  <p className="protected-copy">Your token is stored securely in this browser. Verify it to fetch private content from the protected API route.</p>
                )}
              </div>
              <button className="submit-button" type="button" onClick={openProtectedSpace} disabled={checkingAccess}>
                {checkingAccess ? "Verifying token…" : protectedData ? "Verify access again" : "Open my private space"}
                {!checkingAccess && <ChevronRight size={17} />}
              </button>
              <button className="signout-button" type="button" onClick={signOut}><LogOut size={15} /> Sign out</button>
              <div className="card-footer"><Shield size={14} /> Token-based session · Expires after 1 hour</div>
            </div>
          )}
        </section>
      </div>

      <footer className="page-footer"><span>© 2025 Keyspace</span><span className="footer-center"><Code2 size={14} /> Built with care, protected by JWT</span><span className="footer-right"><UsersRound size={14} /> Your data stays yours</span></footer>
    </main>
  );
}
