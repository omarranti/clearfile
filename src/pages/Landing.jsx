import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, ShieldCheck, TrendingUp, Sparkles, FileText } from "lucide-react";

const font = { serif: "'DM Serif Display', Georgia, serif", sans: "'DM Sans', system-ui, sans-serif" };

const LINE_ONE = "Are you tired of not understanding your taxes?";
const LINE_TWO = "Wouldn't it be nice to know where you can save and how to stay ahead of your taxes?";

const glass = {
  background: "rgba(255,255,255,0.68)",
  border: "1px solid #d6e2ef",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
};

function NarrativeStep({ icon: Icon, title, text }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      style={{ ...glass, borderRadius: 22, padding: 24 }}
    >
      <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(31,157,139,0.12)", display: "grid", placeItems: "center", marginBottom: 14 }}>
        <Icon size={20} color="#1f9d8b" />
      </div>
      <h3 style={{ margin: "0 0 8px", fontSize: 18, color: "#102a43" }}>{title}</h3>
      <p style={{ margin: 0, lineHeight: 1.7, color: "#4f6478", fontSize: 14 }}>{text}</p>
    </motion.div>
  );
}

export default function Landing() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [typedOneCount, setTypedOneCount] = useState(0);
  const [typedTwoCount, setTypedTwoCount] = useState(0);
  const [phase, setPhase] = useState("line1Typing");

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setTypedOneCount(LINE_ONE.length);
      setTypedTwoCount(LINE_TWO.length);
      setPhase("done");
    }
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion || phase !== "line1Typing") return undefined;
    if (typedOneCount >= LINE_ONE.length) {
      setPhase("questionBounce");
      return undefined;
    }
    const timer = setTimeout(() => setTypedOneCount((n) => n + 1), 42);
    return () => clearTimeout(timer);
  }, [phase, typedOneCount, reduceMotion]);

  useEffect(() => {
    if (reduceMotion || phase !== "questionBounce") return undefined;
    const timer = setTimeout(() => setPhase("line1Fade"), 900);
    return () => clearTimeout(timer);
  }, [phase, reduceMotion]);

  useEffect(() => {
    if (reduceMotion || phase !== "line1Fade") return undefined;
    const timer = setTimeout(() => setPhase("line2Typing"), 540);
    return () => clearTimeout(timer);
  }, [phase, reduceMotion]);

  useEffect(() => {
    if (reduceMotion || phase !== "line2Typing") return undefined;
    if (typedTwoCount >= LINE_TWO.length) {
      setPhase("done");
      return undefined;
    }
    const timer = setTimeout(() => setTypedTwoCount((n) => n + 1), 36);
    return () => clearTimeout(timer);
  }, [phase, typedTwoCount, reduceMotion]);

  const baseLineOne = LINE_ONE.slice(0, -1);
  const showQuestionMark = typedOneCount > baseLineOne.length;
  const typedLineOne = baseLineOne.slice(0, Math.min(typedOneCount, baseLineOne.length));
  const typedLineTwo = LINE_TWO.slice(0, typedTwoCount);

  return (
    <div style={{ fontFamily: font.sans, background: "#f5f9ff", color: "#102a43", minHeight: "100vh", position: "relative" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-18%", right: "-4%", width: "50vw", height: "50vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(31,157,139,0.16), transparent 66%)", filter: "blur(48px)" }} />
        <div style={{ position: "absolute", bottom: "-22%", left: "-12%", width: "54vw", height: "54vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.12), transparent 68%)", filter: "blur(48px)" }} />
      </div>

      <section className="hero-section" style={{ position: "relative", zIndex: 1, padding: "158px 24px 104px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", textAlign: "center" }}>
          <div style={{ ...glass, display: "inline-flex", gap: 8, alignItems: "center", borderRadius: 999, padding: "7px 14px", color: "#1f9d8b", fontWeight: 700, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 32 }}>
            Tax Education Platform
          </div>

          <div style={{ minHeight: 182, display: "grid", placeItems: "center", marginBottom: 24 }}>
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{
                opacity: phase === "line1Fade" ? 0 : 1,
                y: phase === "line1Fade" ? -8 : 0,
              }}
              transition={{ duration: 0.45 }}
              style={{
                margin: 0,
                fontFamily: font.serif,
                fontSize: "clamp(34px, 5.6vw, 64px)",
                lineHeight: 1.08,
                letterSpacing: "-0.025em",
                maxWidth: 860,
                display: phase === "line2Typing" || phase === "done" ? "none" : "block",
              }}
            >
              {typedLineOne}
              {showQuestionMark && (
                <motion.span
                  animate={phase === "questionBounce" ? { y: [0, -10, 0], scale: [1, 1.12, 1] } : { y: 0, scale: 1 }}
                  transition={{ duration: 0.45, repeat: phase === "questionBounce" ? 1 : 0 }}
                  style={{ color: "#1f9d8b", display: "inline-block" }}
                >
                  ?
                </motion.span>
              )}
              <span className="cursor-blink" style={{ opacity: phase === "line1Typing" ? 1 : 0 }}>|</span>
            </motion.h1>

            {(phase === "line2Typing" || phase === "done") && (
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                style={{
                  margin: 0,
                  fontFamily: font.serif,
                  fontSize: "clamp(32px, 5.2vw, 60px)",
                  lineHeight: 1.1,
                  letterSpacing: "-0.023em",
                  maxWidth: 900,
                }}
              >
                {typedLineTwo}
                <span className="cursor-blink" style={{ opacity: phase === "line2Typing" ? 1 : 0 }}>|</span>
              </motion.h1>
            )}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: phase === "done" ? 1 : 0, y: phase === "done" ? 0 : 6 }}
            transition={{ duration: 0.4 }}
            style={{ maxWidth: 660, margin: "0 auto 30px", color: "#4f6478", lineHeight: 1.74, fontSize: "clamp(16px, 1.95vw, 19px)" }}
          >
            Taxed gives you a clear, visual way to understand your taxes before deadlines sneak up on you.
          </motion.p>

          <motion.div
            className="hero-cta"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: phase === "done" ? 1 : 0, y: phase === "done" ? 0 : 6 }}
            transition={{ duration: 0.4 }}
            style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}
          >
            <Link to="/calculator" className="micro-press" style={{ padding: "13px 24px", borderRadius: 999, background: "#1f9d8b", color: "#fff", textDecoration: "none", fontWeight: 650, display: "inline-flex", alignItems: "center", gap: 8, boxShadow: "0 2px 10px rgba(31,157,139,0.2)" }}>
              Show Me My Tax Picture <ArrowRight size={16} />
            </Link>
            <Link to="/resources" className="micro-press" style={{ ...glass, padding: "13px 24px", borderRadius: 999, color: "#102a43", textDecoration: "none", fontWeight: 650 }}>
              Start With Free Guides
            </Link>
          </motion.div>
          <p style={{ color: "#6b7f93", fontSize: 12, letterSpacing: "0.01em" }}>Educational only. Not tax advice.</p>
        </div>
      </section>

      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 74px" }}>
        <div style={{ maxWidth: 1020, margin: "0 auto", ...glass, borderRadius: 24, padding: "24px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {["Federal + California context", "Scenario-based learning", "Built for clarity before filing"].map((item) => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, color: "#334e68", fontWeight: 600, fontSize: 14 }}>
              <CheckCircle2 size={17} color="#1f9d8b" />
              {item}
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="features-section" style={{ position: "relative", zIndex: 1, padding: "26px 24px 96px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 34 }}>
            <p style={{ margin: 0, color: "#1f9d8b", fontSize: 11, fontWeight: 700, letterSpacing: "0.11em", textTransform: "uppercase" }}>You Get The Point</p>
            <h2 style={{ fontFamily: font.serif, fontSize: "clamp(30px, 5vw, 50px)", margin: "10px 0 8px", letterSpacing: "-0.02em" }}>Stop guessing. Start planning.</h2>
            <p style={{ margin: 0, color: "#4f6478", fontSize: 17 }}>Know what to do before tax season pressure hits.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 16 }}>
            <NarrativeStep icon={ShieldCheck} title="See What You're Missing" text="Understand the biggest blind spots in your current tax strategy and where preventable costs happen." />
            <NarrativeStep icon={TrendingUp} title="Find Ways To Save" text="Model income and life changes to quickly surface opportunities that reduce your estimated tax burden." />
            <NarrativeStep icon={Sparkles} title="Stay Ahead Year-Round" text="Build a clearer plan now so deadlines feel controlled, not chaotic, and conversations with pros are easier." />
          </div>
        </div>
      </section>

      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 132px" }}>
        <div style={{ maxWidth: 940, margin: "0 auto", ...glass, borderRadius: 26, padding: "52px 24px", textAlign: "center" }}>
          <h2 style={{ fontFamily: font.serif, margin: "0 0 12px", fontSize: "clamp(30px, 5vw, 48px)", letterSpacing: "-0.02em", lineHeight: 1.08 }}>
            Ready to finally understand your taxes?
          </h2>
          <p style={{ margin: "0 auto 24px", maxWidth: 620, color: "#4f6478", lineHeight: 1.72 }}>
            Start with your numbers, compare outcomes, then use clear guidance to make smarter money decisions.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <Link to="/resources" className="micro-press" style={{ ...glass, borderRadius: 999, padding: "12px 18px", color: "#102a43", textDecoration: "none", fontWeight: 650, display: "inline-flex", gap: 8, alignItems: "center" }}>
              <FileText size={15} />
              Read Free Guides
            </Link>
            <Link to="/calculator" className="micro-press" style={{ background: "#1f9d8b", color: "#fff", borderRadius: 999, padding: "12px 18px", textDecoration: "none", fontWeight: 650, display: "inline-flex", gap: 8, alignItems: "center", boxShadow: "0 2px 10px rgba(31,157,139,0.2)" }}>
              Build My Scenario <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .micro-press:active {
          transform: translateY(0.5px) scale(0.985);
        }

        .micro-press:focus-visible {
          box-shadow: 0 0 0 3px rgba(31,157,139,0.2);
          outline: none;
        }

        .cursor-blink {
          margin-left: 2px;
          color: #1f9d8b;
          animation: typedCursorBlink 0.9s steps(1, end) infinite;
        }

        @keyframes typedCursorBlink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .cursor-blink { animation: none !important; }
        }

        @media (max-width: 768px) {
          .hero-section { padding: 126px 16px 74px !important; }
          .features-section { padding: 24px 16px 78px !important; }
          .hero-cta a { width: 100%; justify-content: center; max-width: 370px; }
        }
      `}</style>
    </div>
  );
}
