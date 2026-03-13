import { useState } from "react";
import { ShieldCheck, Lock, LogOut } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const card = {
  background: "rgba(255,255,255,0.72)",
  border: "1px solid #d6e2ef",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
};

export default function Admin({ isAdmin, onAdminLogin, onAdminLogout }) {
  const reduceMotion = useReducedMotion();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const ok = onAdminLogin(pin);
    if (!ok) {
      setError("Incorrect PIN code.");
      return;
    }
    setError("");
    setPin("");
  };

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", padding: "54px 16px 100px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <motion.div
        style={{ ...card, width: "100%", maxWidth: 460, borderRadius: 24, padding: 30 }}
        initial={reduceMotion ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 16, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: reduceMotion ? 0 : 0.55 }}
      >
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, margin: "0 auto 12px", borderRadius: 12, background: "rgba(31,157,139,0.12)", display: "grid", placeItems: "center" }}>
            <ShieldCheck size={20} color="#1f9d8b" />
          </div>
          <h1 style={{ margin: 0, fontSize: 30, color: "#102a43", lineHeight: 1.12, letterSpacing: "-0.01em" }}>Admin Access</h1>
          <p style={{ margin: "10px 0 0", color: "#4f6478", fontSize: 14, lineHeight: 1.65 }}>
            {isAdmin ? "You are logged in as admin." : "Enter admin PIN to continue."}
          </p>
        </div>

        {isAdmin ? (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ border: "1px solid #d6e2ef", background: "#ffffff", borderRadius: 14, padding: "14px 16px", color: "#334e68", fontSize: 14 }}>
              Admin mode is enabled on this device.
            </div>
            <button
              onClick={onAdminLogout}
              style={{
                border: "none",
                borderRadius: 14,
                padding: "13px 16px",
                fontSize: 15,
                fontWeight: 650,
                color: "#fff",
                background: "#9a3412",
                cursor: "pointer",
                display: "inline-flex",
                justifyContent: "center",
                gap: 8,
                alignItems: "center",
              }}
            >
              <LogOut size={16} />
              Admin Log Out
            </button>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
            <div style={{ position: "relative" }}>
              <Lock size={16} color="#6b7f93" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Admin PIN"
                autoComplete="off"
                required
                style={{
                  width: "100%",
                  borderRadius: 14,
                  border: "1px solid #d0dceb",
                  background: "#ffffff",
                  color: "#102a43",
                  padding: "14px 14px 14px 38px",
                  fontSize: 15,
                  outline: "none",
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                border: "none",
                borderRadius: 14,
                padding: "13px 16px",
                fontSize: 15,
                fontWeight: 650,
                color: "#fff",
                background: "#1f9d8b",
                cursor: "pointer",
              }}
            >
              Enter Admin
            </button>
            {error && <p style={{ margin: 0, color: "#dc2626", fontSize: 13 }}>{error}</p>}
          </form>
        )}
      </motion.div>
    </div>
  );
}
