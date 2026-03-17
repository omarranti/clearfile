import { Link } from "react-router-dom";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FileText, Calendar, BookOpen, AlertTriangle, MessageSquare, Database, ArrowRight, DollarSign, ChevronDown } from "lucide-react";
import { font } from "../lib/ui";

const glass = {
  background: "rgba(255,255,255,0.68)",
  border: "1px solid #d6e2ef",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
};

function ResourceCard({ icon: Icon, title, desc, link }) {
  const isExternal = typeof link === "string" && /^https?:\/\//.test(link);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35 }} style={{ ...glass, borderRadius: 20, padding: 24 }}
      whileHover={{ y: -2, boxShadow: "0 10px 24px rgba(16,42,67,0.08)" }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(59,130,246,0.12)", display: "grid", placeItems: "center", marginBottom: 12 }}>
        <Icon size={20} color="#3b82f6" />
      </div>
      <h3 style={{ margin: "0 0 8px", color: "#102a43", fontSize: 17 }}>{title}</h3>
      <p style={{ margin: "0 0 12px", color: "#4f6478", lineHeight: 1.66, fontSize: 14 }}>{desc}</p>
      <a
        href={link}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noreferrer" : undefined}
        className="micro-press"
        style={{ color: "#1f9d8b", fontWeight: 700, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}
      >
        Read Guide <ArrowRight size={14} />
      </a>
    </motion.div>
  );
}

export default function Resources() {
  const reduceMotion = useReducedMotion();
  const [openTab, setOpenTab] = useState("understand");
  return (
    <div className="resources-page" style={{ fontFamily: font.sans, background: "#f5f9ff", minHeight: "100vh", padding: "94px 24px 132px", position: "relative", color: "#102a43" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-8%", right: "-6%", width: "42vw", height: "42vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(31,157,139,0.14), transparent 66%)", filter: "blur(44px)" }} />
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <motion.div
          initial={reduceMotion ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 16, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: reduceMotion ? 0 : 0.55 }}
        >
        <div style={{ textAlign: "center", marginBottom: 54 }}>
          <div style={{ ...glass, borderRadius: 999, display: "inline-flex", padding: "7px 14px", color: "#1f9d8b", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>
            Resource Hub
          </div>
          <h1 style={{ fontFamily: font.serif, margin: "0 0 12px", fontSize: "clamp(34px, 6vw, 58px)", lineHeight: 1.06, letterSpacing: "-0.02em" }}>
            Learn taxes with less stress.
          </h1>
          <p style={{ maxWidth: 610, margin: "0 auto", color: "#4f6478", fontSize: 17, lineHeight: 1.72 }}>
            Plain-English guides, trusted links, and deadlines that help you stay ahead.
          </p>
        </div>
        </motion.div>

        <motion.section initial={reduceMotion ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 14, filter: "blur(5px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} viewport={{ once: true }} transition={{ duration: reduceMotion ? 0 : 0.5 }} style={{ marginBottom: 60 }}>
          <div style={{ ...glass, borderRadius: 16, padding: "14px 16px", marginBottom: 18, display: "grid", gap: 8 }}>
            <div style={{ color: "#102a43", fontWeight: 700, fontSize: 13 }}>Popular tax clarity pages</div>
            {[
              {
                id: "understand",
                title: "Understand Your Taxes",
                desc: "Learn why your refund changes, how effective rate works, and what actually impacts your total bill.",
                href: "/understand-your-taxes",
              },
              {
                id: "takehome",
                title: "Take-Home Pay Calculator",
                desc: "Model raises and side income before committing to decisions so your net pay is predictable.",
                href: "/tax-calculator-take-home-pay",
              },
              {
                id: "freelance",
                title: "Freelance Tax Calculator",
                desc: "Estimate what to set aside per invoice and lower underpayment risk across the year.",
                href: "/freelance-tax-calculator",
              },
            ].map((item) => (
              <div key={item.id} style={{ border: "1px solid #d8e3f0", borderRadius: 12, overflow: "hidden", background: "rgba(255,255,255,0.72)" }}>
                <button
                  onClick={() => setOpenTab((prev) => (prev === item.id ? "" : item.id))}
                  aria-expanded={openTab === item.id}
                  aria-controls={`resources-tab-${item.id}`}
                  style={{ width: "100%", border: "none", background: "transparent", textAlign: "left", padding: "10px 12px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}
                >
                  <span style={{ color: "#1f9d8b", fontWeight: 700, fontSize: 13 }}>{item.title}</span>
                  <motion.span animate={{ rotate: openTab === item.id ? 180 : 0 }} transition={{ duration: reduceMotion ? 0 : 0.18 }}>
                    <ChevronDown size={14} color="#1f9d8b" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {openTab === item.id && (
                    <motion.div
                      id={`resources-tab-${item.id}`}
                      initial={reduceMotion ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={reduceMotion ? { opacity: 1, height: 0 } : { opacity: 0, height: 0 }}
                      transition={{ duration: reduceMotion ? 0 : 0.22 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div style={{ borderTop: "1px solid #d8e3f0", padding: "10px 12px 12px" }}>
                        <p style={{ margin: "0 0 8px", color: "#4f6478", fontSize: 13, lineHeight: 1.6 }}>{item.desc}</p>
                        <Link to={item.href} style={{ color: "#1f9d8b", textDecoration: "none", fontWeight: 700, fontSize: 12 }}>
                          Open page <ArrowRight size={13} style={{ verticalAlign: "text-bottom" }} />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
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
        </motion.section>

        <motion.section initial={reduceMotion ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 14, filter: "blur(5px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} viewport={{ once: true }} transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 0.04 }} style={{ marginBottom: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(59,130,246,0.12)", display: "grid", placeItems: "center" }}>
              <BookOpen size={18} color="#3b82f6" />
            </div>
            <h2 style={{ margin: 0, fontFamily: font.serif, fontSize: 28 }}>Essential Guides</h2>
          </div>
          <div className="resources-guides-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 16 }}>
            <ResourceCard icon={AlertTriangle} title="First-Time Penalty Abatement" desc="Learn when the IRS may remove penalties and what to ask for." link="https://www.irs.gov/payments/penalty-relief" />
            <ResourceCard icon={DollarSign} title="EITC Qualifications" desc="See common income thresholds and who may qualify for refundable credits." link="https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit" />
            <ResourceCard icon={FileText} title="IRS Form 843 Guide" desc="Step-by-step walkthrough for filing a refund or abatement request." link="https://www.irs.gov/forms-pubs/about-form-843" />
            <ResourceCard icon={MessageSquare} title="Talking to the IRS" desc="Simple call scripts to reduce stress when you need support." link="https://www.irs.gov/help/telephone-assistance" />
          </div>
        </motion.section>

        <motion.section initial={reduceMotion ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 14, filter: "blur(5px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} viewport={{ once: true }} transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 0.06 }}>
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
              <div key={d.date} className="deadline-row" style={{ display: "grid", gridTemplateColumns: "minmax(70px, 90px) 1fr", gap: 8, padding: "18px 20px", borderBottom: i < 2 ? "1px solid #d8e3f0" : "none" }}>
                <strong style={{ color: "#1f9d8b" }}>{d.date}</strong>
                <div>
                  <div style={{ fontWeight: 700, color: "#102a43", marginBottom: 4 }}>{d.title}</div>
                  <div style={{ color: "#4f6478", fontSize: 14 }}>{d.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
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

        @media (max-width: 400px) {
          .deadline-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
