import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const font = { serif: "'DM Serif Display', Georgia, serif", sans: "'DM Sans', system-ui, sans-serif" };
const glass = {
  background: "rgba(255,255,255,0.72)",
  border: "1px solid #d6e2ef",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
};

export default function UnderstandYourTaxes() {
  const reduceMotion = useReducedMotion();
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Why did my refund change this year?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Refund changes usually come from income shifts, withholding differences, filing-status changes, or credit-eligibility updates.",
        },
      },
      {
        "@type": "Question",
        name: "What is the fastest way to understand my taxes?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Start with effective rate, then bracket exposure, then likely credits and deductions.",
        },
      },
    ],
  };
  return (
    <div style={{ fontFamily: font.sans, color: "#102a43", minHeight: "100vh", background: "#f5f9ff", padding: "104px 24px 100px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <motion.div
          style={{ ...glass, borderRadius: 24, padding: "34px 30px", marginBottom: 20 }}
          initial={reduceMotion ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 16, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: reduceMotion ? 0 : 0.52 }}
        >
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1f9d8b", marginBottom: 14 }}>
            understand my taxes
          </p>
          <h1 style={{ margin: "0 0 14px", fontFamily: font.serif, fontSize: "clamp(34px, 5vw, 60px)", lineHeight: 1.05 }}>
            Understand Your Taxes - Finally See Where Your Money Goes
          </h1>
          <p style={{ margin: 0, color: "#4f6478", lineHeight: 1.78, fontSize: "clamp(16px, 1.6vw, 19px)" }}>
            Most people file every year but still do not understand what happened to their paycheck. Taxed turns confusing tax outcomes into a clear picture you can actually use.
          </p>
        </motion.div>

        <motion.div
          style={{ ...glass, borderRadius: 20, padding: "24px 24px", display: "grid", gap: 12, marginBottom: 20 }}
          initial={reduceMotion ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 14, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: reduceMotion ? 0 : 0.45 }}
        >
          {[
            "See effective rate, bracket exposure, and estimated take-home in plain English.",
            "Surface common credit and deduction opportunities without tax jargon.",
            "Use scenarios before a raise, side income, or life change to avoid surprises.",
          ].map((item) => (
            <div key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start", color: "#334e68" }}>
              <CheckCircle2 size={17} color="#1f9d8b" style={{ marginTop: 2, flexShrink: 0 }} />
              <span style={{ lineHeight: 1.65 }}>{item}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          style={{ ...glass, borderRadius: 20, padding: "24px 24px" }}
          initial={reduceMotion ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 14, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : 0.05 }}
        >
          <h2 style={{ margin: "0 0 12px", fontFamily: font.serif, fontSize: "clamp(24px, 3.2vw, 38px)" }}>
            Tax filing tells you the outcome. Taxed shows you the why.
          </h2>
          <p style={{ margin: "0 0 18px", color: "#4f6478", lineHeight: 1.72 }}>
            If you have ever asked “why did my refund change?” or “why do I owe this much?”, this page exists for you. Get visibility before filing season and make better decisions year-round.
          </p>
          <Link to="/calculator" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", background: "#1f9d8b", color: "#fff", fontWeight: 700, borderRadius: 999, padding: "12px 18px" }}>
            See Your Full Picture <ArrowRight size={15} />
          </Link>
        </motion.div>

        <div style={{ ...glass, borderRadius: 20, padding: "20px 22px", marginTop: 16, display: "grid", gap: 8 }}>
          <div style={{ color: "#102a43", fontWeight: 700, fontSize: 14 }}>Quick answers (expandable)</div>
          <details style={{ border: "1px solid #d8e3f0", borderRadius: 12, padding: "10px 12px", background: "rgba(255,255,255,0.72)" }}>
            <summary style={{ cursor: "pointer", color: "#1f9d8b", fontWeight: 700, fontSize: 13 }}>Why did my refund change this year?</summary>
            <p style={{ margin: "8px 0 0", color: "#4f6478", fontSize: 13, lineHeight: 1.65 }}>Usually from income changes, withholding differences, filing status updates, or credit eligibility shifts. Taxed helps isolate which factor moved your result.</p>
          </details>
          <details style={{ border: "1px solid #d8e3f0", borderRadius: 12, padding: "10px 12px", background: "rgba(255,255,255,0.72)" }}>
            <summary style={{ cursor: "pointer", color: "#1f9d8b", fontWeight: 700, fontSize: 13 }}>What is the fastest way to understand my taxes?</summary>
            <p style={{ margin: "8px 0 0", color: "#4f6478", fontSize: 13, lineHeight: 1.65 }}>Start with effective rate, then bracket exposure, then credits and deductions. This sequence gives clarity without tax jargon overload.</p>
          </details>
        </div>
      </div>
    </div>
  );
}
