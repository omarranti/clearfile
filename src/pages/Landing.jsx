import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowRight, Briefcase, Laptop, PlusCircle, CheckCircle2, ChevronDown } from "lucide-react";
import { markFunnelStep, startFunnelTimer } from "../lib/funnelMetrics";
import { font, glass } from "../lib/ui";

const demoVideoSrc = `${import.meta.env.BASE_URL}media/model-demo.mp4`;
const demoPosterSrc = `${import.meta.env.BASE_URL}og-image.png`;

const smoothEase = [0.2, 0.9, 0.25, 1];
const slamEase = [0.18, 0.85, 0.28, 1];
const HERO_LINE_ONE = "You File Every Year...";
const HERO_LINE_TWO = "You Still Don't Know Where the Money Went?";
const TYPE_SPEED_MS = 42;
const HOLD_ONE_MS = 180;
const HOLD_TWO_MS = 220;
const FADE_ONE_MS = 220;
const SLAM_MS = 240;

function WhoCard({ icon: Icon, title, text, reduceMotion }) {
  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 20, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true }}
      transition={{ duration: reduceMotion ? 0 : 0.48, ease: smoothEase }}
      whileHover={reduceMotion ? undefined : { y: -2, boxShadow: "0 14px 28px rgba(15,23,42,0.10)" }}
      style={{ ...glass, borderRadius: 20, padding: 24 }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(31,157,139,0.10)", display: "grid", placeItems: "center", marginBottom: 14 }}>
        <Icon size={20} color="#1f9d8b" />
      </div>
      <h3 style={{ margin: "0 0 8px", fontSize: 18, color: "#0f2438" }}>{title}</h3>
      <p style={{ margin: 0, lineHeight: 1.72, color: "#4b5f73", fontSize: 14 }}>{text}</p>
    </motion.div>
  );
}

function ProblemParagraph({ children }) {
  return (
    <p style={{ margin: 0, color: "#3f5366", lineHeight: 1.84, fontSize: "clamp(15px, 1.35vw, 18px)" }}>
      {children}
    </p>
  );
}

function RevealText({ children, reduceMotion, delay = 0 }) {
  return (
    <motion.p
      initial={reduceMotion ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 10, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: reduceMotion ? 0 : 0.46, delay: reduceMotion ? 0 : delay, ease: smoothEase }}
      style={{ margin: 0, color: "#3f5366", lineHeight: 1.84, fontSize: "clamp(15px, 1.35vw, 18px)" }}
    >
      {children}
    </motion.p>
  );
}

function ExpandableTab({ item, open, onToggle, reduceMotion }) {
  return (
    <div style={{ border: "1px solid #e2e7ed", borderRadius: 16, overflow: "hidden", background: "rgba(255,255,255,0.94)" }}>
      <button
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`tab-panel-${item.id}`}
        style={{
          width: "100%",
          border: "none",
          background: "transparent",
          padding: "15px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{ color: "#1f9d8b", fontWeight: 700, fontSize: 14.5 }}>{item.title}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: reduceMotion ? 0 : 0.2 }}>
          <ChevronDown size={16} color="#1f9d8b" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`tab-panel-${item.id}`}
            initial={reduceMotion ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduceMotion ? { opacity: 1, height: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.24, ease: smoothEase }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ borderTop: "1px solid #e2e7ed", padding: "12px 16px 14px" }}>
              <p style={{ margin: "0 0 10px", color: "#4f6478", fontSize: 14, lineHeight: 1.7 }}>{item.detail}</p>
              <Link to={item.href} className="micro-press" style={{ color: "#1f9d8b", textDecoration: "none", fontWeight: 700, fontSize: 13 }}>
                Open page <ArrowRight size={14} style={{ verticalAlign: "text-bottom" }} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Landing() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [heroPhase, setHeroPhase] = useState("line1Typing");
  const [line1Count, setLine1Count] = useState(0);
  const [line2Count, setLine2Count] = useState(0);
  const [expandedTabId, setExpandedTabId] = useState("understand");
  const reveal = reduceMotion
    ? { initial: { opacity: 1, y: 0, filter: "blur(0px)" }, whileInView: { opacity: 1, y: 0, filter: "blur(0px)" }, transition: { duration: 0 } }
    : { initial: { opacity: 0, y: 18, filter: "blur(8px)" }, whileInView: { opacity: 1, y: 0, filter: "blur(0px)" }, transition: { duration: 0.75, ease: smoothEase } };
  const trackCalculatorCta = (placement) => {
    markFunnelStep("landing_cta_click", { placement });
    startFunnelTimer("landing_to_report");
  };

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    markFunnelStep("landing_view");
  }, []);

  useEffect(() => {
    if (!reduceMotion) return undefined;
    setLine1Count(HERO_LINE_ONE.length);
    setLine2Count(HERO_LINE_TWO.length);
    setHeroPhase("done");
    return undefined;
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion || heroPhase !== "line1Typing") return undefined;
    if (line1Count >= HERO_LINE_ONE.length) {
      setHeroPhase("line1Hold");
      return undefined;
    }
    const timer = setTimeout(() => setLine1Count((n) => n + 1), TYPE_SPEED_MS);
    return () => clearInterval(timer);
  }, [heroPhase, line1Count, reduceMotion]);

  useEffect(() => {
    if (reduceMotion || heroPhase !== "line1Hold") return undefined;
    const timer = setTimeout(() => setHeroPhase("line1Fade"), HOLD_ONE_MS);
    return () => clearTimeout(timer);
  }, [heroPhase, reduceMotion]);

  useEffect(() => {
    if (reduceMotion || heroPhase !== "line1Fade") return undefined;
    const timer = setTimeout(() => setHeroPhase("line2Typing"), FADE_ONE_MS);
    return () => clearTimeout(timer);
  }, [heroPhase, reduceMotion]);

  useEffect(() => {
    if (reduceMotion || heroPhase !== "line2Typing") return undefined;
    if (line2Count >= HERO_LINE_TWO.length) {
      setHeroPhase("line2Hold");
      return undefined;
    }
    const timer = setTimeout(() => setLine2Count((n) => n + 1), TYPE_SPEED_MS);
    return () => clearTimeout(timer);
  }, [heroPhase, line2Count, reduceMotion]);

  useEffect(() => {
    if (reduceMotion || heroPhase !== "line2Hold") return undefined;
    const timer = setTimeout(() => setHeroPhase("line2Slam"), HOLD_TWO_MS);
    return () => clearTimeout(timer);
  }, [heroPhase, reduceMotion]);

  useEffect(() => {
    if (reduceMotion || heroPhase !== "line2Slam") return undefined;
    const timer = setTimeout(() => setHeroPhase("demoReveal"), SLAM_MS);
    return () => clearTimeout(timer);
  }, [heroPhase, reduceMotion]);

  useEffect(() => {
    if (reduceMotion || heroPhase !== "demoReveal") return undefined;
    const timer = setTimeout(() => setHeroPhase("done"), 260);
    return () => clearTimeout(timer);
  }, [heroPhase, reduceMotion]);

  return (
    <div style={{ fontFamily: font.sans, background: "#f7f8fa", color: "#102a43", minHeight: "100vh", position: "relative" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, willChange: "transform" }}>
        <div
          style={{ position: "absolute", top: "-18%", right: "-4%", width: "50vw", height: "50vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(31,157,139,0.08), transparent 66%)", filter: "blur(58px)" }}
        />
        <div
          style={{ position: "absolute", bottom: "-22%", left: "-12%", width: "54vw", height: "54vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.07), transparent 68%)", filter: "blur(58px)" }}
        />
      </div>

      {/* Section 1: Hero */}
      <section className="hero-section" style={{ position: "relative", zIndex: 1, padding: "146px 24px 82px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div
            initial={reduceMotion ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: reduceMotion ? 0 : 0.72, ease: smoothEase }}
            style={{ textAlign: "center", marginBottom: 28 }}
          >
            <div style={{ ...glass, display: "inline-flex", borderRadius: 999, padding: "7px 14px", color: "#1f9d8b", fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 24 }}>
              Tax Clarity Platform
            </div>

            <div style={{ margin: "0 auto 18px", maxWidth: 980 }}>
              <AnimatePresence mode="wait">
                {(reduceMotion || heroPhase === "line1Typing" || heroPhase === "line1Hold" || heroPhase === "line1Fade") && (
                  <motion.h1
                    key="hero-line-1"
                    initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10, filter: "blur(5px)" }}
                    animate={heroPhase === "line1Fade" ? { opacity: 0, y: -6, filter: "blur(5px)" } : { opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -8, filter: "blur(5px)" }}
                    transition={{ duration: reduceMotion ? 0 : 0.42, ease: smoothEase }}
                    style={{ margin: 0, fontFamily: font.serif, fontSize: "clamp(36px, 5.8vw, 74px)", lineHeight: 1.03, letterSpacing: "-0.028em" }}
                  >
                    {reduceMotion ? HERO_LINE_ONE : HERO_LINE_ONE.slice(0, line1Count)}
                    {!reduceMotion && heroPhase === "line1Typing" && <span className="hero-cursor">|</span>}
                  </motion.h1>
                )}

                {(reduceMotion || heroPhase === "line2Typing" || heroPhase === "line2Hold" || heroPhase === "line2Slam") && (
                  <motion.h1
                    key="hero-line-2"
                    initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8, filter: "blur(5px)" }}
                    animate={heroPhase === "line2Slam" ? { opacity: 0, y: -88, filter: "blur(6px)", scale: 0.985 } : { opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
                    exit={{ opacity: 0, y: -92, filter: "blur(6px)", scale: 0.985 }}
                    transition={{ duration: reduceMotion ? 0 : heroPhase === "line2Slam" ? SLAM_MS / 1000 : 0.44, ease: heroPhase === "line2Slam" ? slamEase : smoothEase }}
                    style={{ margin: 0, fontFamily: font.serif, fontSize: "clamp(36px, 5.8vw, 74px)", lineHeight: 1.03, letterSpacing: "-0.028em" }}
                  >
                    {reduceMotion ? HERO_LINE_TWO : HERO_LINE_TWO.slice(0, line2Count)}
                    {!reduceMotion && heroPhase === "line2Typing" && <span className="hero-cursor">|</span>}
                  </motion.h1>
                )}
              </AnimatePresence>
            </div>

            <div style={{ margin: "0 auto 22px", maxWidth: 800, minHeight: 72, visibility: "visible" }}>
              <motion.p
                initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8, filter: "blur(6px)" }}
                animate={
                  reduceMotion || heroPhase === "done" || heroPhase === "demoReveal" || heroPhase === "line2Typing" || heroPhase === "line2Hold" || heroPhase === "line2Slam"
                    ? { opacity: 1, y: 0, filter: "blur(0px)" }
                    : { opacity: 0.78, y: 4, filter: "blur(2px)" }
                }
                transition={{ duration: reduceMotion ? 0 : 0.34, ease: smoothEase }}
                style={{ margin: 0, color: "#495b6d", lineHeight: 1.78, fontSize: "clamp(16px, 1.5vw, 19px)" }}
              >
                TurboTax files your return. Your CPA signs off. But neither one ever shows you the full picture - your brackets, your credits, your real take-home. Taxed does.
              </motion.p>
            </div>

            <div className="hero-cta" style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
              <Link to="/calculator" onClick={() => trackCalculatorCta("hero_primary")} className="micro-press hero-primary-cta" style={{ padding: "14px 24px", borderRadius: 999, background: "#13283e", color: "#fff", textDecoration: "none", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8, boxShadow: "0 8px 22px rgba(19,40,62,0.18)" }}>
                See Your Full Picture <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={reveal.initial}
            animate={reduceMotion || heroPhase === "demoReveal" || heroPhase === "done" ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 16, filter: "blur(8px)" }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.56, ease: smoothEase }}
            style={{ ...glass, borderRadius: 22, padding: 16, marginBottom: 16 }}
          >
            <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #e2e7ed", background: "#fff", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)" }}>
              <video src={demoVideoSrc} poster={demoPosterSrc} autoPlay loop muted playsInline preload="metadata" className="hero-demo-video" aria-label="Demo of the Taxed tax clarity platform showing income breakdown and bracket visualization" style={{ width: "100%", display: "block", minHeight: 220, aspectRatio: "16/9", objectFit: "cover" }} />
            </div>
          </motion.div>

          <motion.div
            initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: reduceMotion ? 0 : 0.6, ease: smoothEase }}
            style={{ ...glass, borderRadius: 18, padding: "16px 18px", display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))" }}
          >
            {[
              "Covers Federal + California State Taxes",
              "Based on current IRS published data",
              "Educational visibility, not filing software",
            ].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, color: "#334a60", fontSize: 13, fontWeight: 600 }}>
                <CheckCircle2 size={16} color="#1f9d8b" />
                {item}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="how-it-works" style={{ position: "relative", zIndex: 1, padding: "0 24px 40px", scrollMarginTop: 96 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", ...glass, borderRadius: 18, padding: "16px 18px", display: "grid", gap: 10 }}>
          {[
            {
              id: "understand",
              title: "Understand Your Taxes",
              detail: "A plain-English breakdown of where your paycheck goes and why outcomes change year to year.",
              href: "/understand-your-taxes",
            },
            {
              id: "takehome",
              title: "Tax Calculator Take-Home Pay",
              detail: "Preview real take-home impact before raises, bonuses, or job changes so you decide with confidence.",
              href: "/tax-calculator-take-home-pay",
            },
            {
              id: "freelance",
              title: "Freelance Tax Calculator",
              detail: "Model 1099 income, estimate quarterly set-asides, and reduce surprise tax bills before deadlines.",
              href: "/freelance-tax-calculator",
            },
          ].map((item) => (
            <ExpandableTab
              key={item.id}
              item={item}
              open={expandedTabId === item.id}
              reduceMotion={reduceMotion}
              onToggle={() => setExpandedTabId((prev) => (prev === item.id ? "" : item.id))}
            />
          ))}
        </div>
      </section>

      {/* Section 2: Core Problem */}
      <section style={{ position: "relative", zIndex: 1, padding: "20px 24px 78px" }}>
        <motion.div
          initial={reveal.initial}
          whileInView={reveal.whileInView}
          viewport={{ once: true }}
          transition={reveal.transition}
          style={{ maxWidth: 980, margin: "0 auto", ...glass, borderRadius: 24, padding: "clamp(22px, 4vw, 40px)" }}
        >
          <p style={{ margin: 0, color: "#1f9d8b", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
            Section 2: The Core Problem
          </p>
          <h2 style={{ margin: "0 0 20px", fontFamily: font.serif, fontSize: "clamp(30px, 5vw, 56px)", lineHeight: 1.06, letterSpacing: "-0.024em" }}>
            The System Was Built to Keep You Confused
          </h2>

          <div style={{ display: "grid", gap: 16 }}>
            <RevealText reduceMotion={reduceMotion} delay={0}>
              Here&apos;s the part nobody says out loud: the confusion you feel every April is not an accident. Filing software walks you through a wizard, then spits out a number. You submit and move on, still not knowing why you owed more, why your refund dropped, or what changed.
            </RevealText>
            <RevealText reduceMotion={reduceMotion} delay={0.08}>
              That&apos;s not a you problem. That&apos;s a design problem. TurboTax built a great filing tool. CPAs built a great advice business. But between “click here to file” and “$350/hr to ask a question,” the layer that actually shows your money in plain English never got built.
            </RevealText>
            <RevealText reduceMotion={reduceMotion} delay={0.16}>
              The result is predictable: you miss credits you qualify for, you get surprise penalties without context, and you take on new income without understanding the tax impact until it&apos;s too late. Every year repeats the same cycle - file, pay, move on, still confused.
            </RevealText>
          </div>
        </motion.div>
      </section>

      {/* Section 3: Opportunity */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 86px" }}>
        <motion.div
          initial={reveal.initial}
          whileInView={reveal.whileInView}
          viewport={{ once: true }}
          transition={reveal.transition}
          style={{ maxWidth: 980, margin: "0 auto", ...glass, borderRadius: 24, padding: "clamp(22px, 4vw, 40px)" }}
        >
          <p style={{ margin: 0, color: "#1f9d8b", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
            Section 3: The Opportunity
          </p>
          <h2 style={{ margin: "0 0 20px", fontFamily: font.serif, fontSize: "clamp(30px, 5vw, 56px)", lineHeight: 1.06, letterSpacing: "-0.024em" }}>
            The Layer That Was Always Missing
          </h2>

          <div style={{ display: "grid", gap: 16 }}>
            <RevealText reduceMotion={reduceMotion} delay={0}>
              Taxed is not a filing tool and not a CPA. It&apos;s the layer that was always supposed to exist between the two: a visual, plain-English platform that shows exactly where your money goes in real time.
            </RevealText>
            <RevealText reduceMotion={reduceMotion} delay={0.08}>
              Enter your income, choose filing status, and instantly see your federal + state picture: effective rate, bracket exposure, eligible credits, and penalty risk before it becomes a bill. No jargon. No wizard. No waiting until April.
            </RevealText>
            <RevealText reduceMotion={reduceMotion} delay={0.16}>
              When you can finally see the full picture, you make better decisions year-round - negotiating raises, planning freelance work, and walking into CPA meetings informed instead of uncertain.
            </RevealText>
          </div>

          <div style={{ marginTop: 24, ...glass, borderRadius: 16, padding: "16px 18px" }}>
            <p style={{ margin: 0, color: "#102a43", fontWeight: 700, fontSize: "clamp(16px, 1.6vw, 20px)", lineHeight: 1.5 }}>
              Full access. One time. <span style={{ color: "#1f9d8b" }}>$0.99</span>. No renewal. Yours forever.
            </p>
          </div>

          <div style={{ marginTop: 20 }}>
            <Link to="/calculator" onClick={() => trackCalculatorCta("opportunity_section")} className="micro-press" style={{ padding: "14px 24px", borderRadius: 999, background: "#13283e", color: "#fff", textDecoration: "none", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8, boxShadow: "0 8px 22px rgba(19,40,62,0.16)" }}>
              See Your Full Picture <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Section 4: Pricing */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 92px" }}>
        <motion.div
          initial={reveal.initial}
          whileInView={reveal.whileInView}
          viewport={{ once: true }}
          transition={reveal.transition}
          style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}
        >
          <h2 style={{ margin: "0 0 16px", fontFamily: font.serif, fontSize: "clamp(28px, 4vw, 48px)", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            Full access. One time. $0.99.
          </h2>
          <p style={{ margin: "0 0 32px", color: "#43596e", fontSize: "clamp(16px, 1.6vw, 18px)" }}>
            No subscription. No renewal. Yours forever.
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 auto 32px", display: "grid", gap: 12, maxWidth: 360, textAlign: "left" }}>
            {[
              "Federal + State tax breakdown",
              "All credits and deductions unlocked",
              "Unlimited income modeling",
              "Export CPA-ready PDF",
              "Personalized tax plan",
              "Penalty abatement scripts"
            ].map((feature, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 15, color: "#102a43" }}>
                <CheckCircle2 size={18} color="#1f9d8b" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Link to="/calculator" onClick={() => trackCalculatorCta("pricing_lifetime")} style={{ display: "inline-block", padding: "16px 32px", borderRadius: 12, background: "#1F3044", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 18, boxShadow: "0 10px 24px rgba(31,48,68,0.18)", transition: "all 0.15s" }}>
            Get Full Access - $0.99
          </Link>
        </motion.div>
      </section>

      {/* Section 5: Who This Is For */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 120px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <motion.div
            initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: reduceMotion ? 0 : 0.52, ease: smoothEase }}
            style={{ textAlign: "center", marginBottom: 28 }}
          >
            <p style={{ margin: 0, color: "#1f9d8b", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
              Who This Is For
            </p>
            <h2 style={{ margin: 0, fontFamily: font.serif, fontSize: "clamp(30px, 4.8vw, 52px)", letterSpacing: "-0.02em" }}>
              Built for people who want visibility
            </h2>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 16 }}>
            <WhoCard reduceMotion={reduceMotion} icon={Briefcase} title="W-2 Employees" text="You get a paycheck and file every year, but still don't know your effective rate, bracket exposure, or what a raise really does after taxes." />
            <WhoCard reduceMotion={reduceMotion} icon={Laptop} title="Freelancers and 1099 Workers" text="You earn on your terms, but tax season still blindsides you. You need clarity on set-asides, deductions, and true take-home." />
            <WhoCard reduceMotion={reduceMotion} icon={PlusCircle} title="Side Income Earners" text="You have salary plus extra income, but no clear view of how they combine, what you owe, or whether penalty risk is building." />
          </div>
        </div>
      </section>

      <style>{`
        .hero-cursor {
          margin-left: 2px;
          color: #1f9d8b;
          animation: heroCursorBlink 0.9s steps(1, end) infinite;
        }

        @keyframes heroCursorBlink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }

        @media (hover: hover) {
          .micro-press:hover {
            transform: translateY(-1px);
            box-shadow: 0 12px 26px rgba(16,42,67,0.15);
          }
        }

        .micro-press:active {
          transform: translateY(0.5px) scale(0.985);
        }

        .micro-press:focus-visible {
          box-shadow: 0 0 0 3px rgba(31,157,139,0.2);
          outline: none;
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-cursor { animation: none !important; }
        }

        @media (max-width: 768px) {
          .hero-section {
            padding: 118px 16px 64px !important;
          }
          .hero-cta a {
            width: 100%;
            justify-content: center;
            max-width: 380px;
          }
          .hero-primary-cta {
            min-height: 48px;
          }
        }

        @media (max-width: 560px) {
          .hero-section {
            padding: 106px 14px 56px !important;
          }
        }

        @media (max-width: 480px) {
          .hero-section {
            padding: 98px 12px 48px !important;
          }
        }
      `}</style>
    </div>
  );
}
