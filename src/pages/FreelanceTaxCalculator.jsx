import { Link } from "react-router-dom";
import { ArrowRight, ReceiptText, CalendarClock, ShieldAlert } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const font = { serif: "'DM Serif Display', Georgia, serif", sans: "'DM Sans', system-ui, sans-serif" };
const glass = {
  background: "rgba(255,255,255,0.72)",
  border: "1px solid #d6e2ef",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
};

function Item({ icon: Icon, title, text, reduceMotion }) {
  return (
    <motion.div
      style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: 10, alignItems: "start" }}
      initial={reduceMotion ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 10, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true }}
      transition={{ duration: reduceMotion ? 0 : 0.38 }}
    >
      <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(31,157,139,0.12)", display: "grid", placeItems: "center" }}>
        <Icon size={18} color="#1f9d8b" />
      </div>
      <div>
        <div style={{ color: "#102a43", fontWeight: 700, marginBottom: 4 }}>{title}</div>
        <div style={{ color: "#4f6478", lineHeight: 1.65 }}>{text}</div>
      </div>
    </motion.div>
  );
}

export default function FreelanceTaxCalculator() {
  const reduceMotion = useReducedMotion();
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How much should I set aside from freelance income?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A common starting range is 25 to 35 percent, then refine with your effective-rate estimate for your specific scenario.",
        },
      },
      {
        "@type": "Question",
        name: "When are quarterly taxes due?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Quarterly estimated-tax windows are typically in April, June, September, and January, but always verify exact IRS and state dates for your filing year.",
        },
      },
    ],
  };
  return (
    <div style={{ fontFamily: font.sans, color: "#102a43", minHeight: "100vh", background: "#f5f9ff", padding: "104px 24px 100px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <motion.div
          style={{ ...glass, borderRadius: 24, padding: "34px 30px", marginBottom: 18 }}
          initial={reduceMotion ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 16, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: reduceMotion ? 0 : 0.52 }}
        >
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1f9d8b", marginBottom: 14 }}>
            how much tax will i owe freelance
          </p>
          <h1 style={{ margin: "0 0 14px", fontFamily: font.serif, fontSize: "clamp(34px, 5vw, 60px)", lineHeight: 1.05 }}>
            Freelance Tax Calculator: Know What You Owe Before April
          </h1>
          <p style={{ margin: 0, color: "#4f6478", lineHeight: 1.78, fontSize: "clamp(16px, 1.6vw, 19px)" }}>
            Freelance income can be unpredictable, but your tax planning does not have to be. Estimate what you owe now, before quarterly deadlines and year-end surprises.
          </p>
        </motion.div>

        <motion.div
          style={{ ...glass, borderRadius: 20, padding: 24, display: "grid", gap: 16, marginBottom: 18 }}
          initial={reduceMotion ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 14, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: reduceMotion ? 0 : 0.45 }}
        >
          <Item reduceMotion={reduceMotion} icon={ReceiptText} title="Estimate What You Owe" text="Model freelance income against federal and California exposure in one place." />
          <Item reduceMotion={reduceMotion} icon={CalendarClock} title="Plan Quarterly Payments" text="Use scenario visibility to set aside a smarter amount from each invoice." />
          <Item reduceMotion={reduceMotion} icon={ShieldAlert} title="Catch Risk Early" text="Spot potential underpayment and penalty risk before it becomes an expensive problem." />
        </motion.div>

        <motion.div
          style={{ ...glass, borderRadius: 20, padding: "24px 24px" }}
          initial={reduceMotion ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 14, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : 0.05 }}
        >
          <p style={{ margin: "0 0 18px", color: "#4f6478", lineHeight: 1.72 }}>
            Going freelance is easier when taxes stop being a mystery. Use Taxed to run scenarios, compare outcomes, and make confident decisions before April.
          </p>
          <Link to="/calculator" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", background: "#1f9d8b", color: "#fff", fontWeight: 700, borderRadius: 999, padding: "12px 18px" }}>
            Estimate My Freelance Taxes <ArrowRight size={15} />
          </Link>
        </motion.div>

        <div style={{ ...glass, borderRadius: 20, padding: "20px 22px", marginTop: 16, display: "grid", gap: 8 }}>
          <div style={{ color: "#102a43", fontWeight: 700, fontSize: 14 }}>Quick answers (expandable)</div>
          <details style={{ border: "1px solid #d8e3f0", borderRadius: 12, padding: "10px 12px", background: "rgba(255,255,255,0.72)" }}>
            <summary style={{ cursor: "pointer", color: "#1f9d8b", fontWeight: 700, fontSize: 13 }}>How much should I set aside from freelance income?</summary>
            <p style={{ margin: "8px 0 0", color: "#4f6478", fontSize: 13, lineHeight: 1.65 }}>A common starting range is 25-35%, then refine with your actual effective-rate estimate from your scenario.</p>
          </details>
          <details style={{ border: "1px solid #d8e3f0", borderRadius: 12, padding: "10px 12px", background: "rgba(255,255,255,0.72)" }}>
            <summary style={{ cursor: "pointer", color: "#1f9d8b", fontWeight: 700, fontSize: 13 }}>When are quarterly taxes due?</summary>
            <p style={{ margin: "8px 0 0", color: "#4f6478", fontSize: 13, lineHeight: 1.65 }}>Typically April, June, September, and January payment windows. Always verify exact IRS/state due dates for your tax year.</p>
          </details>
        </div>
      </div>
    </div>
  );
}
