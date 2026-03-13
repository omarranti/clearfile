import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { FileText, Calendar, BookOpen, AlertTriangle, MessageSquare, Database, ArrowRight, DollarSign } from "lucide-react";

const font = { serif: "'DM Serif Display', Georgia, serif", sans: "'DM Sans', system-ui, sans-serif" };

const glass = {
  background: "rgba(255,255,255,0.68)",
  border: "1px solid #d6e2ef",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
};

function ResourceCard({ icon: Icon, title, desc, link }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35 }} style={{ ...glass, borderRadius: 20, padding: 24 }}
      whileHover={{ y: -2, boxShadow: "0 10px 24px rgba(16,42,67,0.08)" }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(59,130,246,0.12)", display: "grid", placeItems: "center", marginBottom: 12 }}>
        <Icon size={20} color="#3b82f6" />
      </div>
      <h3 style={{ margin: "0 0 8px", color: "#102a43", fontSize: 17 }}>{title}</h3>
      <p style={{ margin: "0 0 12px", color: "#4f6478", lineHeight: 1.66, fontSize: 14 }}>{desc}</p>
      <a href={link} className="micro-press" style={{ color: "#1f9d8b", fontWeight: 700, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
        Read Guide <ArrowRight size={14} />
      </a>
    </motion.div>
  );
}

export default function Resources() {
  return (
    <div className="resources-page" style={{ fontFamily: font.sans, background: "#f5f9ff", minHeight: "100vh", padding: "94px 24px 132px", position: "relative", color: "#102a43" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-8%", right: "-6%", width: "42vw", height: "42vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(31,157,139,0.14), transparent 66%)", filter: "blur(44px)" }} />
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 54 }}>
          <div style={{ ...glass, borderRadius: 999, display: "inline-flex", padding: "7px 14px", color: "#1f9d8b", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>
            Resource Hub
          </div>
          <h1 style={{ fontFamily: font.serif, margin: "0 0 12px", fontSize: "clamp(34px, 6vw, 58px)", lineHeight: 1.06, letterSpacing: "-0.02em" }}>
            Learn taxes with less stress.
          </h1>
          <p style={{ maxWidth: 610, margin: "0 auto", color: "#4f6478", fontSize: 17, lineHeight: 1.72 }}>
            Plain-English guides, trusted links, and deadlines that help you stay ahead.
          </p>
        </div>

        <section style={{ marginBottom: 60 }}>
          <div style={{ ...glass, borderRadius: 16, padding: "14px 16px", marginBottom: 18, display: "grid", gap: 8 }}>
            <div style={{ color: "#102a43", fontWeight: 700, fontSize: 13 }}>Popular tax clarity pages</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Link to="/understand-your-taxes" style={{ color: "#1f9d8b", textDecoration: "none", fontWeight: 700, fontSize: 13 }}>Understand Your Taxes</Link>
              <Link to="/tax-calculator-take-home-pay" style={{ color: "#1f9d8b", textDecoration: "none", fontWeight: 700, fontSize: 13 }}>Take-Home Pay Calculator</Link>
              <Link to="/freelance-tax-calculator" style={{ color: "#1f9d8b", textDecoration: "none", fontWeight: 700, fontSize: 13 }}>Freelance Tax Calculator</Link>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(31,157,139,0.12)", display: "grid", placeItems: "center" }}>
              <Database size={18} color="#1f9d8b" />
            </div>
            <h2 style={{ margin: 0, fontFamily: font.serif, fontSize: 28 }}>Interactive Tools</h2>
          </div>
          <div className="resources-tools-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 16 }}>
            <div style={{ ...glass, borderRadius: 24, padding: 30 }}>
              <h3 style={{ margin: "0 0 10px", fontSize: 22, fontFamily: font.serif }}>Tax Clarity Platform</h3>
              <p style={{ margin: "0 0 20px", color: "#4f6478", lineHeight: 1.7 }}>
                Model income scenarios, estimate your tax impact, and prepare for better conversations with tax pros.
              </p>
              <Link to="/calculator" className="micro-press" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#1f9d8b", color: "#fff", textDecoration: "none", borderRadius: 999, padding: "11px 18px", fontWeight: 650, boxShadow: "0 2px 10px rgba(31,157,139,0.2)" }}>
                Launch Tax Navigator
              </Link>
            </div>
            <div style={{ ...glass, borderRadius: 24, padding: 30 }}>
              <h3 style={{ margin: "0 0 10px", fontSize: 20 }}>Find a CPA</h3>
              <p style={{ margin: "0 0 16px", color: "#4f6478", lineHeight: 1.7 }}>
                Use these directories to find qualified professionals for real filing support.
              </p>
              <ul style={{ margin: 0, paddingLeft: 18, color: "#334e68", lineHeight: 1.9 }}>
                <li><a href="https://cpaverify.org" target="_blank" rel="noreferrer" style={{ color: "#1f9d8b", fontWeight: 700 }}>CPAverify.org</a></li>
                <li><a href="https://natptax.com" target="_blank" rel="noreferrer" style={{ color: "#3b82f6", fontWeight: 700 }}>NATP.org</a></li>
              </ul>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(59,130,246,0.12)", display: "grid", placeItems: "center" }}>
              <BookOpen size={18} color="#3b82f6" />
            </div>
            <h2 style={{ margin: 0, fontFamily: font.serif, fontSize: 28 }}>Essential Guides</h2>
          </div>
          <div className="resources-guides-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 16 }}>
            <ResourceCard icon={AlertTriangle} title="First-Time Penalty Abatement" desc="Learn when the IRS may remove penalties and what to ask for." link="#" />
            <ResourceCard icon={DollarSign} title="EITC Qualifications" desc="See common income thresholds and who may qualify for refundable credits." link="#" />
            <ResourceCard icon={FileText} title="IRS Form 843 Guide" desc="Step-by-step walkthrough for filing a refund or abatement request." link="#" />
            <ResourceCard icon={MessageSquare} title="Talking to the IRS" desc="Simple call scripts to reduce stress when you need support." link="#" />
          </div>
        </section>

        <section>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(245,158,11,0.12)", display: "grid", placeItems: "center" }}>
              <Calendar size={18} color="#f59e0b" />
            </div>
            <h2 style={{ margin: 0, fontFamily: font.serif, fontSize: 28 }}>Tax Deadlines</h2>
          </div>
          <div style={{ ...glass, borderRadius: 20, overflow: "hidden" }}>
            {[
              { date: "Jan 29", title: "Tax Season Opens", desc: "IRS begins accepting and processing returns." },
              { date: "Apr 15", title: "Tax Day", desc: "Main filing deadline or extension request deadline." },
              { date: "Oct 15", title: "Extension Deadline", desc: "Final deadline if you requested an extension." },
            ].map((d, i) => (
              <div key={d.date} style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 8, padding: "18px 20px", borderBottom: i < 2 ? "1px solid #d8e3f0" : "none" }}>
                <strong style={{ color: "#1f9d8b" }}>{d.date}</strong>
                <div>
                  <div style={{ fontWeight: 700, color: "#102a43", marginBottom: 4 }}>{d.title}</div>
                  <div style={{ color: "#4f6478", fontSize: 14 }}>{d.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <style>{`
        .micro-press:active {
          transform: translateY(0.5px) scale(0.985);
        }

        .micro-press:focus-visible {
          box-shadow: 0 0 0 3px rgba(31,157,139,0.2);
          outline: none;
        }

        @media (max-width: 768px) {
          .resources-page { padding: 74px 16px 92px !important; }
          .resources-tools-grid, .resources-guides-grid { gap: 12px !important; }
        }
      `}</style>
    </div>
  );
}
