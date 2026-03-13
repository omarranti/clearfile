import { Link } from "react-router-dom";
import { ArrowRight, Calculator, TrendingUp, CircleDollarSign } from "lucide-react";

const font = { serif: "'DM Serif Display', Georgia, serif", sans: "'DM Sans', system-ui, sans-serif" };
const glass = {
  background: "rgba(255,255,255,0.72)",
  border: "1px solid #d6e2ef",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
};

function Feature({ icon: Icon, title, text }) {
  return (
    <div style={{ ...glass, borderRadius: 18, padding: 20 }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(31,157,139,0.12)", display: "grid", placeItems: "center", marginBottom: 10 }}>
        <Icon size={18} color="#1f9d8b" />
      </div>
      <h3 style={{ margin: "0 0 6px", color: "#102a43", fontSize: 18 }}>{title}</h3>
      <p style={{ margin: 0, color: "#4f6478", lineHeight: 1.65 }}>{text}</p>
    </div>
  );
}

export default function TakeHomePayCalculator() {
  return (
    <div style={{ fontFamily: font.sans, color: "#102a43", minHeight: "100vh", background: "#f5f9ff", padding: "104px 24px 100px" }}>
      <div style={{ maxWidth: 1020, margin: "0 auto" }}>
        <div style={{ ...glass, borderRadius: 24, padding: "34px 30px", marginBottom: 18 }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1f9d8b", marginBottom: 14 }}>
            tax calculator take home pay
          </p>
          <h1 style={{ margin: "0 0 14px", fontFamily: font.serif, fontSize: "clamp(34px, 5vw, 60px)", lineHeight: 1.05 }}>
            Tax Calculator: See Your Exact Take-Home Pay Before You Decide
          </h1>
          <p style={{ margin: 0, color: "#4f6478", lineHeight: 1.78, fontSize: "clamp(16px, 1.6vw, 19px)" }}>
            Before accepting a raise, switching jobs, or taking side income, run the numbers and see your real take-home pay so your decisions are based on clarity, not guesswork.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 14, marginBottom: 18 }}>
          <Feature icon={Calculator} title="Model Income Changes" text="Test salary changes, bonus scenarios, and side income with immediate tax impact estimates." />
          <Feature icon={TrendingUp} title="Preview Net Outcome" text="See effective rate and estimated monthly take-home before making financial commitments." />
          <Feature icon={CircleDollarSign} title="Reduce Surprise Bills" text="Identify blind spots and adjustment opportunities before deadlines hit." />
        </div>

        <div style={{ ...glass, borderRadius: 20, padding: "24px 24px" }}>
          <p style={{ margin: "0 0 18px", color: "#4f6478", lineHeight: 1.72 }}>
            Plug in income, filing status, and context, then compare outcomes in minutes. Taxed helps you understand the after-tax reality behind every money decision.
          </p>
          <Link to="/calculator" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", background: "#1f9d8b", color: "#fff", fontWeight: 700, borderRadius: 999, padding: "12px 18px" }}>
            Calculate My Take-Home <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}
