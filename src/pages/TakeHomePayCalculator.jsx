import { Link } from "react-router-dom";
import { ArrowRight, Calculator, TrendingUp, CircleDollarSign } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const font = { serif: "'DM Serif Display', Georgia, serif", sans: "'DM Sans', system-ui, sans-serif" };
const glass = {
  background: "rgba(255,255,255,0.72)",
  border: "1px solid #d6e2ef",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
};

function Feature({ icon: Icon, title, text, reduceMotion }) {
  return (
    <motion.div
      style={{ ...glass, borderRadius: 18, padding: 20 }}
      initial={reduceMotion ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 12, filter: "blur(5px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true }}
      transition={{ duration: reduceMotion ? 0 : 0.42 }}
    >
      <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(31,157,139,0.12)", display: "grid", placeItems: "center", marginBottom: 10 }}>
        <Icon size={18} color="#1f9d8b" />
      </div>
      <h3 style={{ margin: "0 0 6px", color: "#102a43", fontSize: 18 }}>{title}</h3>
      <p style={{ margin: 0, color: "#4f6478", lineHeight: 1.65 }}>{text}</p>
    </motion.div>
  );
}

export default function TakeHomePayCalculator() {
  const reduceMotion = useReducedMotion();
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Will a raise always increase my take-home pay?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A raise usually increases take-home pay, but the net increase can feel smaller because part of the extra income is taxed at higher marginal brackets.",
        },
      },
      {
        "@type": "Question",
        name: "When should I re-calculate take-home?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Re-calculate whenever your income mix changes, including raises, bonuses, second jobs, side income, or filing-status updates.",
        },
      },
    ],
  };
  return (
    <div style={{ fontFamily: font.sans, color: "#102a43", minHeight: "100vh", background: "#f5f9ff", padding: "104px 24px 100px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div style={{ maxWidth: 1020, margin: "0 auto" }}>
        <motion.div
          style={{ ...glass, borderRadius: 24, padding: "34px 30px", marginBottom: 18 }}
          initial={reduceMotion ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 16, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: reduceMotion ? 0 : 0.52 }}
        >
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1f9d8b", marginBottom: 14 }}>
            tax calculator take home pay
          </p>
          <h1 style={{ margin: "0 0 14px", fontFamily: font.serif, fontSize: "clamp(34px, 5vw, 60px)", lineHeight: 1.05 }}>
            Tax Calculator: See Your Exact Take-Home Pay Before You Decide
          </h1>
          <p style={{ margin: 0, color: "#4f6478", lineHeight: 1.78, fontSize: "clamp(16px, 1.6vw, 19px)" }}>
            Before accepting a raise, switching jobs, or taking side income, run the numbers and see your real take-home pay so your decisions are based on clarity, not guesswork.
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 14, marginBottom: 18 }}>
          <Feature reduceMotion={reduceMotion} icon={Calculator} title="Model Income Changes" text="Test salary changes, bonus scenarios, and side income with immediate tax impact estimates." />
          <Feature reduceMotion={reduceMotion} icon={TrendingUp} title="Preview Net Outcome" text="See effective rate and estimated monthly take-home before making financial commitments." />
          <Feature reduceMotion={reduceMotion} icon={CircleDollarSign} title="Reduce Surprise Bills" text="Identify blind spots and adjustment opportunities before deadlines hit." />
        </div>

        <motion.div
          style={{ ...glass, borderRadius: 20, padding: "24px 24px" }}
          initial={reduceMotion ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 14, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : 0.04 }}
        >
          <p style={{ margin: "0 0 18px", color: "#4f6478", lineHeight: 1.72 }}>
            Plug in income, filing status, and context, then compare outcomes in minutes. Taxed helps you understand the after-tax reality behind every money decision.
          </p>
          <Link to="/calculator" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", background: "#1f9d8b", color: "#fff", fontWeight: 700, borderRadius: 999, padding: "12px 18px" }}>
            Calculate My Take-Home <ArrowRight size={15} />
          </Link>
        </motion.div>

        <div style={{ ...glass, borderRadius: 20, padding: "20px 22px", marginTop: 16, display: "grid", gap: 8 }}>
          <div style={{ color: "#102a43", fontWeight: 700, fontSize: 14 }}>Quick answers (expandable)</div>
          <details style={{ border: "1px solid #d8e3f0", borderRadius: 12, padding: "10px 12px", background: "rgba(255,255,255,0.72)" }}>
            <summary style={{ cursor: "pointer", color: "#1f9d8b", fontWeight: 700, fontSize: 13 }}>Will a raise always increase my take-home pay?</summary>
            <p style={{ margin: "8px 0 0", color: "#4f6478", fontSize: 13, lineHeight: 1.65 }}>Usually yes, but the increase can feel smaller due to higher marginal-tax portions. Modeling the scenario first prevents surprises.</p>
          </details>
          <details style={{ border: "1px solid #d8e3f0", borderRadius: 12, padding: "10px 12px", background: "rgba(255,255,255,0.72)" }}>
            <summary style={{ cursor: "pointer", color: "#1f9d8b", fontWeight: 700, fontSize: 13 }}>When should I re-calculate take-home?</summary>
            <p style={{ margin: "8px 0 0", color: "#4f6478", fontSize: 13, lineHeight: 1.65 }}>Any time your income mix changes: raise, bonus, second job, side income, or a filing-status update.</p>
          </details>
        </div>
      </div>
    </div>
  );
}
