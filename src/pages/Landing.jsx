import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowRight, Briefcase, Laptop, PlusCircle, CheckCircle2 } from "lucide-react";

const font = { serif: "'DM Serif Display', Georgia, serif", sans: "'DM Sans', system-ui, sans-serif" };
const demoVideoSrc = `${import.meta.env.BASE_URL}media/model-demo.mp4`;
const demoPosterSrc = `${import.meta.env.BASE_URL}og-image.png`;

const glass = {
  background: "rgba(255,255,255,0.7)",
  border: "1px solid #d6e2ef",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
};

const smoothEase = [0.22, 1, 0.36, 1];

function WhoCard({ icon: Icon, title, text, reduceMotion }) {
  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 20, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true }}
      transition={{ duration: reduceMotion ? 0 : 0.55, ease: smoothEase }}
      whileHover={reduceMotion ? undefined : { y: -3, boxShadow: "0 16px 30px rgba(16,42,67,0.12)" }}
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

function ProblemParagraph({ children }) {
  return (
    <p style={{ margin: 0, color: "#3f5469", lineHeight: 1.86, fontSize: "clamp(15px, 1.4vw, 18px)" }}>
      {children}
    </p>
  );
}

export default function Landing() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [heroLineIdx, setHeroLineIdx] = useState(0);
  const reveal = reduceMotion
    ? { initial: { opacity: 1, y: 0, filter: "blur(0px)" }, whileInView: { opacity: 1, y: 0, filter: "blur(0px)" }, transition: { duration: 0 } }
    : { initial: { opacity: 0, y: 18, filter: "blur(8px)" }, whileInView: { opacity: 1, y: 0, filter: "blur(0px)" }, transition: { duration: 0.75, ease: smoothEase } };

  const heroLines = [
    "TurboTax files your return. Your CPA signs off.",
    "Taxed shows your full picture - brackets, credits, real take-home.",
    "Clarity first. Filing second. No more guessing.",
  ];

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const timer = setInterval(() => {
      setHeroLineIdx((n) => (n + 1) % heroLines.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [reduceMotion, heroLines.length]);

  return (
    <div style={{ fontFamily: font.sans, background: "#f5f9ff", color: "#102a43", minHeight: "100vh", position: "relative" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <motion.div
          animate={reduceMotion ? { x: 0, y: 0 } : { x: [0, -16, 0], y: [0, 12, 0] }}
          transition={{ duration: 18, ease: "easeInOut", repeat: Infinity }}
          style={{ position: "absolute", top: "-18%", right: "-4%", width: "50vw", height: "50vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(31,157,139,0.16), transparent 66%)", filter: "blur(48px)" }}
        />
        <motion.div
          animate={reduceMotion ? { x: 0, y: 0 } : { x: [0, 14, 0], y: [0, -10, 0] }}
          transition={{ duration: 16, ease: "easeInOut", repeat: Infinity }}
          style={{ position: "absolute", bottom: "-22%", left: "-12%", width: "54vw", height: "54vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.12), transparent 68%)", filter: "blur(48px)" }}
        />
      </div>

      {/* Section 1: Hero */}
      <section className="hero-section" style={{ position: "relative", zIndex: 1, padding: "152px 24px 84px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div
            initial={reduceMotion ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: reduceMotion ? 0 : 0.8, ease: smoothEase }}
            style={{ textAlign: "center", marginBottom: 30 }}
          >
            <div style={{ ...glass, display: "inline-flex", borderRadius: 999, padding: "7px 14px", color: "#1f9d8b", fontWeight: 700, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 28 }}>
              Tax Clarity Platform
            </div>

            <div style={{ margin: "0 auto 18px", maxWidth: 980 }}>
              <motion.h1
                initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.6, ease: smoothEase }}
                style={{ margin: 0, fontFamily: font.serif, fontSize: "clamp(38px, 6.2vw, 78px)", lineHeight: 1.02, letterSpacing: "-0.03em" }}
              >
                <motion.span
                  initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: reduceMotion ? 0 : 0.5, ease: smoothEase }}
                  style={{ display: "block" }}
                >
                  You File Every Year.
                </motion.span>
                <motion.span
                  initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: reduceMotion ? 0 : 0.55, delay: reduceMotion ? 0 : 0.12, ease: smoothEase }}
                  style={{ display: "block" }}
                >
                  You Still Don&apos;t Know Where the Money Went.
                </motion.span>
              </motion.h1>
            </div>

            <div style={{ margin: "0 auto 30px", maxWidth: 840, minHeight: 72 }}>
              <AnimatePresence mode="wait">
                <motion.p
                  key={heroLineIdx}
                  initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -6, filter: "blur(5px)" }}
                  transition={{ duration: reduceMotion ? 0 : 0.46, ease: smoothEase }}
                  style={{ margin: 0, color: "#43596e", lineHeight: 1.8, fontSize: "clamp(16px, 1.6vw, 20px)" }}
                >
                  {reduceMotion ? heroLines[0] : heroLines[heroLineIdx]}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="hero-cta" style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
              <Link to="/calculator" className="micro-press" style={{ padding: "14px 24px", borderRadius: 999, background: "#1f9d8b", color: "#fff", textDecoration: "none", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8, boxShadow: "0 2px 10px rgba(31,157,139,0.2)" }}>
                See Your Full Picture <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={reveal.initial}
            whileInView={reveal.whileInView}
            viewport={{ once: true }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.7, ease: smoothEase }}
            style={{ ...glass, borderRadius: 22, padding: 16, marginBottom: 18 }}
          >
            <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #d8e3f0", background: "#fff" }}>
              <video src={demoVideoSrc} poster={demoPosterSrc} autoPlay loop muted playsInline preload="auto" style={{ width: "100%", display: "block", minHeight: 220, objectFit: "cover" }} />
            </div>
          </motion.div>

          <motion.div
            initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: reduceMotion ? 0 : 0.6, ease: smoothEase }}
            style={{ ...glass, borderRadius: 18, padding: "16px 18px", display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
          >
            {[
              "Covers Federal + California State Taxes",
              "Based on current IRS published data",
              "Educational visibility, not filing software",
            ].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, color: "#334e68", fontSize: 13, fontWeight: 600 }}>
                <CheckCircle2 size={16} color="#1f9d8b" />
                {item}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", ...glass, borderRadius: 18, padding: "16px 18px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
          <Link to="/understand-your-taxes" className="micro-press" style={{ textDecoration: "none", color: "#1f9d8b", fontWeight: 700, fontSize: 14 }}>
            Understand Your Taxes
          </Link>
          <Link to="/tax-calculator-take-home-pay" className="micro-press" style={{ textDecoration: "none", color: "#1f9d8b", fontWeight: 700, fontSize: 14 }}>
            Tax Calculator Take-Home Pay
          </Link>
          <Link to="/freelance-tax-calculator" className="micro-press" style={{ textDecoration: "none", color: "#1f9d8b", fontWeight: 700, fontSize: 14 }}>
            Freelance Tax Calculator
          </Link>
        </div>
      </section>

      {/* Section 2: Core Problem */}
      <section style={{ position: "relative", zIndex: 1, padding: "22px 24px 80px" }}>
        <motion.div
          initial={reveal.initial}
          whileInView={reveal.whileInView}
          viewport={{ once: true }}
          transition={reveal.transition}
          style={{ maxWidth: 980, margin: "0 auto", ...glass, borderRadius: 24, padding: "clamp(22px, 4vw, 42px)" }}
        >
          <p style={{ margin: 0, color: "#1f9d8b", fontSize: 11, fontWeight: 700, letterSpacing: "0.11em", textTransform: "uppercase", marginBottom: 14 }}>
            Section 2: The Core Problem
          </p>
          <h2 style={{ margin: "0 0 20px", fontFamily: font.serif, fontSize: "clamp(30px, 5vw, 56px)", lineHeight: 1.06, letterSpacing: "-0.024em" }}>
            The System Was Built to Keep You Confused
          </h2>

          <div style={{ display: "grid", gap: 16 }}>
            <ProblemParagraph>
              Here&apos;s the part nobody says out loud: the confusion you feel every April is not an accident. Filing software walks you through a wizard, then spits out a number. You submit and move on, still not knowing why you owed more, why your refund dropped, or what changed.
            </ProblemParagraph>
            <ProblemParagraph>
              That&apos;s not a you problem. That&apos;s a design problem. TurboTax built a great filing tool. CPAs built a great advice business. But between “click here to file” and “$350/hr to ask a question,” the layer that actually shows your money in plain English never got built.
            </ProblemParagraph>
            <ProblemParagraph>
              The result is predictable: you miss credits you qualify for, you get surprise penalties without context, and you take on new income without understanding the tax impact until it&apos;s too late. Every year repeats the same cycle - file, pay, move on, still confused.
            </ProblemParagraph>
          </div>
        </motion.div>
      </section>

      {/* Section 3: Opportunity */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 90px" }}>
        <motion.div
          initial={reveal.initial}
          whileInView={reveal.whileInView}
          viewport={{ once: true }}
          transition={reveal.transition}
          style={{ maxWidth: 980, margin: "0 auto", ...glass, borderRadius: 24, padding: "clamp(22px, 4vw, 42px)" }}
        >
          <p style={{ margin: 0, color: "#1f9d8b", fontSize: 11, fontWeight: 700, letterSpacing: "0.11em", textTransform: "uppercase", marginBottom: 14 }}>
            Section 3: The Opportunity
          </p>
          <h2 style={{ margin: "0 0 20px", fontFamily: font.serif, fontSize: "clamp(30px, 5vw, 56px)", lineHeight: 1.06, letterSpacing: "-0.024em" }}>
            The Layer That Was Always Missing
          </h2>

          <div style={{ display: "grid", gap: 16 }}>
            <ProblemParagraph>
              Taxed is not a filing tool and not a CPA. It&apos;s the layer that was always supposed to exist between the two: a visual, plain-English platform that shows exactly where your money goes in real time.
            </ProblemParagraph>
            <ProblemParagraph>
              Enter your income, choose filing status, and instantly see your federal + state picture: effective rate, bracket exposure, eligible credits, and penalty risk before it becomes a bill. No jargon. No wizard. No waiting until April.
            </ProblemParagraph>
            <ProblemParagraph>
              When you can finally see the full picture, you make better decisions year-round - negotiating raises, planning freelance work, and walking into CPA meetings informed instead of uncertain.
            </ProblemParagraph>
          </div>

          <div style={{ marginTop: 24, ...glass, borderRadius: 16, padding: "16px 18px" }}>
            <p style={{ margin: 0, color: "#102a43", fontWeight: 700, fontSize: "clamp(16px, 1.6vw, 20px)", lineHeight: 1.5 }}>
              One payment. <span style={{ color: "#1f9d8b" }}>$29.99.</span> Lifetime access. No subscription, no barrier, no excuse.
            </p>
          </div>

          <div style={{ marginTop: 20 }}>
            <Link to="/calculator" className="micro-press" style={{ padding: "14px 24px", borderRadius: 999, background: "#1f9d8b", color: "#fff", textDecoration: "none", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8, boxShadow: "0 2px 10px rgba(31,157,139,0.2)" }}>
              See Your Full Picture <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Section 4: Who This Is For */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 128px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <motion.div
            initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: reduceMotion ? 0 : 0.6, ease: smoothEase }}
            style={{ textAlign: "center", marginBottom: 28 }}
          >
            <p style={{ margin: 0, color: "#1f9d8b", fontSize: 11, fontWeight: 700, letterSpacing: "0.11em", textTransform: "uppercase", marginBottom: 10 }}>
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
        @media (hover: hover) {
          .micro-press:hover {
            transform: translateY(-1px);
            box-shadow: 0 10px 24px rgba(16,42,67,0.14);
          }
        }

        .micro-press:active {
          transform: translateY(0.5px) scale(0.985);
        }

        .micro-press:focus-visible {
          box-shadow: 0 0 0 3px rgba(31,157,139,0.2);
          outline: none;
        }

        @media (max-width: 768px) {
          .hero-section {
            padding: 124px 16px 70px !important;
          }
          .hero-cta a {
            width: 100%;
            justify-content: center;
            max-width: 380px;
          }
        }
      `}</style>
    </div>
  );
}
