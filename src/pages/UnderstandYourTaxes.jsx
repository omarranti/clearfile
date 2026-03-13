import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const font = { serif: "'DM Serif Display', Georgia, serif", sans: "'DM Sans', system-ui, sans-serif" };
const glass = {
  background: "rgba(255,255,255,0.72)",
  border: "1px solid #d6e2ef",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
};

export default function UnderstandYourTaxes() {
  return (
    <div style={{ fontFamily: font.sans, color: "#102a43", minHeight: "100vh", background: "#f5f9ff", padding: "104px 24px 100px" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ ...glass, borderRadius: 24, padding: "34px 30px", marginBottom: 20 }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1f9d8b", marginBottom: 14 }}>
            understand my taxes
          </p>
          <h1 style={{ margin: "0 0 14px", fontFamily: font.serif, fontSize: "clamp(34px, 5vw, 60px)", lineHeight: 1.05 }}>
            Understand Your Taxes - Finally See Where Your Money Goes
          </h1>
          <p style={{ margin: 0, color: "#4f6478", lineHeight: 1.78, fontSize: "clamp(16px, 1.6vw, 19px)" }}>
            Most people file every year but still do not understand what happened to their paycheck. Taxed turns confusing tax outcomes into a clear picture you can actually use.
          </p>
        </div>

        <div style={{ ...glass, borderRadius: 20, padding: "24px 24px", display: "grid", gap: 12, marginBottom: 20 }}>
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
        </div>

        <div style={{ ...glass, borderRadius: 20, padding: "24px 24px" }}>
          <h2 style={{ margin: "0 0 12px", fontFamily: font.serif, fontSize: "clamp(24px, 3.2vw, 38px)" }}>
            Tax filing tells you the outcome. Taxed shows you the why.
          </h2>
          <p style={{ margin: "0 0 18px", color: "#4f6478", lineHeight: 1.72 }}>
            If you have ever asked “why did my refund change?” or “why do I owe this much?”, this page exists for you. Get visibility before filing season and make better decisions year-round.
          </p>
          <Link to="/calculator" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", background: "#1f9d8b", color: "#fff", fontWeight: 700, borderRadius: 999, padding: "12px 18px" }}>
            See Your Full Picture <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}
