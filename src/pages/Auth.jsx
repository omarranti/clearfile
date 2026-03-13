import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const card = {
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)",
};

const inputStyle = {
  width: "100%",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  padding: "13px 14px",
  fontSize: 15,
  outline: "none",
};

export default function Auth({ session }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

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

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", padding: "40px 16px 90px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ ...card, width: "100%", maxWidth: 460, borderRadius: 20, padding: 26 }}>
        <div style={{ marginBottom: 18, textAlign: "center" }}>
          <h1 style={{ margin: 0, fontSize: 30, color: "#fff", lineHeight: 1.1 }}>Welcome to Taxed HQ</h1>
          <p style={{ margin: "10px 0 0", color: "rgba(255,255,255,0.55)", fontSize: 14 }}>
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
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              border: "none",
              borderRadius: 12,
              padding: "13px 16px",
              fontSize: 15,
              fontWeight: 700,
              color: "#000",
              background: "#34D399",
              cursor: "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
          </button>
        </form>

        {msg && <p style={{ margin: "14px 0 0", color: "#34D399", fontSize: 13 }}>{msg}</p>}
        {err && <p style={{ margin: "14px 0 0", color: "#F87171", fontSize: 13 }}>{err}</p>}

        <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            style={{ background: "none", border: "none", color: "#34D399", cursor: "pointer", padding: 0, fontSize: 13, fontWeight: 600 }}
          >
            {mode === "login" ? "Need an account? Sign up" : "Already have an account? Log in"}
          </button>
          <Link to="/" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none", fontSize: 13 }}>Back to home</Link>
        </div>
      </div>
    </div>
  );
}
