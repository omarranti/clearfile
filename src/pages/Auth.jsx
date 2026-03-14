import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { supabase } from "../lib/supabase";

const card = {
  background: "rgba(255,255,255,0.72)",
  border: "1px solid #d6e2ef",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
};

const inputStyle = {
  width: "100%",
  borderRadius: 14,
  border: "1px solid #d0dceb",
  background: "#ffffff",
  color: "#102a43",
  padding: "14px 14px",
  fontSize: 15,
  outline: "none",
};

export default function Auth({ session }) {
  const reduceMotion = useReducedMotion();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [showAdminShortcut, setShowAdminShortcut] = useState(() => {
    try {
      return sessionStorage.getItem("taxed_show_admin_shortcut") === "1";
    } catch {
      return false;
    }
  });

  if (session) return <Navigate to="/calculator" replace />;

  const missingEnv = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

  const runAuth = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    if (missingEnv) {
      setErr("Supabase env vars are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg("Check your email to confirm your account, then log in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      setErr(error.message || "Auth error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode !== "login") return undefined;
    const onKeyDown = (event) => {
      if (event.altKey && event.shiftKey && event.key.toLowerCase() === "a") {
        setShowAdminShortcut(true);
        try {
          sessionStorage.setItem("taxed_show_admin_shortcut", "1");
        } catch {
          // ignore storage errors
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mode]);

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", padding: "52px 16px 100px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <motion.div
        initial={reduceMotion ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 18, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: reduceMotion ? 0 : 0.55 }}
        style={{ ...card, width: "100%", maxWidth: 460, borderRadius: 24, padding: 30 }}
      >
        <div style={{ marginBottom: 20, textAlign: "center" }}>
          <h1 style={{ margin: 0, fontSize: 30, color: "#102a43", lineHeight: 1.12, letterSpacing: "-0.01em" }}>Welcome to Taxed HQ</h1>
          <p style={{ margin: "10px 0 0", color: "#4f6478", fontSize: 14, lineHeight: 1.65 }}>
            {mode === "login" ? "Log in to save and compare your tax scenarios." : "Create an account to track your tax projects."}
          </p>
        </div>

        <form onSubmit={runAuth} style={{ display: "grid", gap: 12 }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            required
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = "#8dcfca"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(31,157,139,0.14)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "#d0dceb"; e.currentTarget.style.boxShadow = "none"; }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={6}
            required
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = "#8dcfca"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(31,157,139,0.14)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "#d0dceb"; e.currentTarget.style.boxShadow = "none"; }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{ border: "none", borderRadius: 14, padding: "13px 16px", fontSize: 15, fontWeight: 650, color: "#fff", background: "#1f9d8b", cursor: "pointer", opacity: loading ? 0.7 : 1, boxShadow: "0 2px 10px rgba(31,157,139,0.2)" }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 18px rgba(31,157,139,0.26)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 10px rgba(31,157,139,0.2)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            {loading ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
          </button>
        </form>

        {msg && <p style={{ margin: "14px 0 0", color: "#1f9d8b", fontSize: 13 }}>{msg}</p>}
        {err && <p style={{ margin: "14px 0 0", color: "#dc2626", fontSize: 13 }}>{err}</p>}

        <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button onClick={() => setMode(mode === "login" ? "signup" : "login")} style={{ background: "none", border: "none", color: "#1f9d8b", cursor: "pointer", padding: 0, fontSize: 13, fontWeight: 600 }}>
            {mode === "login" ? "Need an account? Sign up" : "Already have an account? Log in"}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {mode === "login" && showAdminShortcut && (
              <Link to="/admin" style={{ color: "#7f8b98", textDecoration: "none", fontSize: 12 }}>
                Admin login
              </Link>
            )}
            <Link to="/" style={{ color: "#4f6478", textDecoration: "none", fontSize: 13 }}>Back to home</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
