import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronDown, Send, MessageCircle, X, Check,
  DollarSign, TrendingDown, FileText, GraduationCap,
  AlertTriangle, ArrowRight, ArrowLeft, Download,
  Calculator, Phone, Briefcase, Shield, PiggyBank, Heart, CloudUpload,
  ChevronRight, Sparkles, Users, Home, User, ChevronsUpDown
} from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { supabase } from "../lib/supabase";
import { claimEntitlement, getCheckoutStatus, loadEntitlement, startCheckout } from "../lib/billing";

/* ═══════════════════════════════════════════
   BRAND CONFIG
   ═══════════════════════════════════════════ */
const BRAND = { name: "Taxed", tagline: "Finally see where your money goes." };
const DISCLAIMER = "This tool provides tax estimates for educational purposes only. It is not tax advice. Consult a qualified tax professional for your situation.";

/* ═══════════════════════════════════════════
   TAX ENGINE — Pure functions
   ═══════════════════════════════════════════ */
const FED_STD = { single: 14600, married_joint: 29200, married_separate: 14600, head_of_household: 21900 };
const CA_STD = { single: 5202, married_joint: 10404, married_separate: 5202, head_of_household: 10404 };

const FED_BRACKETS = {
  single: [
    { min: 0, max: 11600, rate: 0.10 }, { min: 11600, max: 47150, rate: 0.12 },
    { min: 47150, max: 100525, rate: 0.22 }, { min: 100525, max: 191950, rate: 0.24 },
    { min: 191950, max: 243725, rate: 0.32 }, { min: 243725, max: 609350, rate: 0.35 },
    { min: 609350, max: Infinity, rate: 0.37 },
  ],
  married_joint: [
    { min: 0, max: 23200, rate: 0.10 }, { min: 23200, max: 94300, rate: 0.12 },
    { min: 94300, max: 201050, rate: 0.22 }, { min: 201050, max: 383900, rate: 0.24 },
    { min: 383900, max: 487450, rate: 0.32 }, { min: 487450, max: 731200, rate: 0.35 },
    { min: 731200, max: Infinity, rate: 0.37 },
  ],
  married_separate: [
    { min: 0, max: 11600, rate: 0.10 }, { min: 11600, max: 47150, rate: 0.12 },
    { min: 47150, max: 100525, rate: 0.22 }, { min: 100525, max: 191950, rate: 0.24 },
    { min: 191950, max: 243725, rate: 0.32 }, { min: 243725, max: 365600, rate: 0.35 },
    { min: 365600, max: Infinity, rate: 0.37 },
  ],
  head_of_household: [
    { min: 0, max: 16550, rate: 0.10 }, { min: 16550, max: 63100, rate: 0.12 },
    { min: 63100, max: 100500, rate: 0.22 }, { min: 100500, max: 191950, rate: 0.24 },
    { min: 191950, max: 243700, rate: 0.32 }, { min: 243700, max: 609350, rate: 0.35 },
    { min: 609350, max: Infinity, rate: 0.37 },
  ],
};

const CA_BRACKETS = {
  single: [
    { min: 0, max: 10412, rate: 0.01 }, { min: 10412, max: 24684, rate: 0.02 },
    { min: 24684, max: 38959, rate: 0.04 }, { min: 38959, max: 54081, rate: 0.06 },
    { min: 54081, max: 68350, rate: 0.08 }, { min: 68350, max: 349137, rate: 0.093 },
    { min: 349137, max: 418961, rate: 0.103 }, { min: 418961, max: 698271, rate: 0.113 },
    { min: 698271, max: Infinity, rate: 0.123 },
  ],
  married_joint: [
    { min: 0, max: 20824, rate: 0.01 }, { min: 20824, max: 49368, rate: 0.02 },
    { min: 49368, max: 77918, rate: 0.04 }, { min: 77918, max: 108162, rate: 0.06 },
    { min: 108162, max: 136700, rate: 0.08 }, { min: 136700, max: 698274, rate: 0.093 },
    { min: 698274, max: 837922, rate: 0.103 }, { min: 837922, max: 1396542, rate: 0.113 },
    { min: 1396542, max: Infinity, rate: 0.123 },
  ],
  married_separate: [
    { min: 0, max: 10412, rate: 0.01 }, { min: 10412, max: 24684, rate: 0.02 },
    { min: 24684, max: 38959, rate: 0.04 }, { min: 38959, max: 54081, rate: 0.06 },
    { min: 54081, max: 68350, rate: 0.08 }, { min: 68350, max: 349137, rate: 0.093 },
    { min: 349137, max: 418961, rate: 0.103 }, { min: 418961, max: 698271, rate: 0.113 },
    { min: 698271, max: Infinity, rate: 0.123 },
  ],
  head_of_household: [
    { min: 0, max: 20839, rate: 0.01 }, { min: 20839, max: 49371, rate: 0.02 },
    { min: 49371, max: 63644, rate: 0.04 }, { min: 63644, max: 78765, rate: 0.06 },
    { min: 78765, max: 93037, rate: 0.08 }, { min: 93037, max: 474824, rate: 0.093 },
    { min: 474824, max: 569790, rate: 0.103 }, { min: 569790, max: 949649, rate: 0.113 },
    { min: 949649, max: Infinity, rate: 0.123 },
  ],
};

function calcBrackets(taxable, brackets) {
  const results = [];
  let rem = taxable;
  for (const b of brackets) {
    if (rem <= 0) break;
    const width = b.max === Infinity ? rem : b.max - b.min;
    const chunk = Math.min(rem, width);
    results.push({ rate: b.rate, rangeStart: b.min, rangeEnd: b.max, taxableInBracket: chunk, taxOnBracket: Math.round(chunk * b.rate * 100) / 100 });
    rem -= chunk;
  }
  return results;
}

function calcFederal(income, status) {
  const std = FED_STD[status];
  const taxable = Math.max(0, income - std);
  const byBracket = calcBrackets(taxable, FED_BRACKETS[status]);
  const total = Math.round(byBracket.reduce((s, b) => s + b.taxOnBracket, 0));
  let marginal = 0.10, r = taxable;
  for (const b of FED_BRACKETS[status]) { if (r <= 0) break; marginal = b.rate; r -= b.max === Infinity ? r : b.max - b.min; }
  return { standardDeduction: std, taxableIncome: taxable, taxByBracket: byBracket, totalTax: total, effectiveRate: income > 0 ? total / income : 0, marginalRate: marginal };
}

function calcCA(income, status) {
  const std = CA_STD[status];
  const taxable = Math.max(0, income - std);
  const byBracket = calcBrackets(taxable, CA_BRACKETS[status]);
  const incomeTax = Math.round(byBracket.reduce((s, b) => s + b.taxOnBracket, 0));
  const sdi = Math.round(income * 0.009);
  const mhs = income > 1000000 ? Math.round((income - 1000000) * 0.01) : 0;
  const total = incomeTax + sdi + mhs;
  let marginal = 0.01, r = taxable;
  for (const b of CA_BRACKETS[status]) { if (r <= 0) break; marginal = b.rate; r -= b.max === Infinity ? r : b.max - b.min; }
  return { standardDeduction: std, taxableIncome: taxable, taxByBracket: byBracket, incomeTax, sdi, mentalHealthSurcharge: mhs, totalTax: total, effectiveRate: income > 0 ? total / income : 0, marginalRate: marginal };
}

function calcEITC(income, deps = 0, status = "single") {
  const maxC = { 0: 632, 1: 3995, 2: 6604, 3: 7430 };
  const limits = { single: { 0: 18591, 1: 49084, 2: 55768, 3: 59899 }, married_joint: { 0: 25511, 1: 55768, 2: 62688, 3: 66819 } };
  const d = Math.min(deps, 3);
  const lim = (status === "married_joint" ? limits.married_joint : limits.single)[d];
  const mx = maxC[d];
  if (income > lim) return { eligible: false, amount: 0, max: mx };
  if (d === 0) {
    if (income <= 7830) return { eligible: true, amount: Math.round(income * 0.0765), max: mx };
    if (income <= 9310) return { eligible: true, amount: mx, max: mx };
    return { eligible: true, amount: Math.max(0, Math.round(mx - (income - 9310) / (lim - 9310) * mx)), max: mx };
  }
  return { eligible: true, amount: mx, max: mx };
}

function calcCalEITC(income) {
  if (income > 22302) return { eligible: false, amount: 0 };
  return { eligible: true, amount: Math.min(275, Math.round(income * 0.012)) };
}

function calcSavers(income, status) {
  const tbl = { single: [{ max: 21750, rate: 0.50 }, { max: 29625, rate: 0.20 }, { max: 36500, rate: 0.10 }], married_joint: [{ max: 43500, rate: 0.50 }, { max: 59250, rate: 0.20 }, { max: 73000, rate: 0.10 }], head_of_household: [{ max: 32625, rate: 0.50 }, { max: 44438, rate: 0.20 }, { max: 54750, rate: 0.10 }] };
  for (const t of (tbl[status] || tbl.single)) if (income <= t.max) return { eligible: true, rate: t.rate, maxCredit: Math.round(2000 * t.rate) };
  return { eligible: false, rate: 0, maxCredit: 0 };
}

function calcPenalty(taxOwed, monthsLate, hasClean3Yr) {
  const penalty = Math.min(taxOwed * 0.25, Math.round(taxOwed * 0.05 * monthsLate));
  return { estimatedPenalty: penalty, ftaEligible: hasClean3Yr, ftaSavings: hasClean3Yr ? penalty : 0, lookbackYears: [2021, 2022, 2023].map(y => ({ year: y, mustBeClean: true })), irsPhone: "1-800-829-1040", irsScript: "I'd like to request a First-Time Penalty Abatement for tax year 2024. I have a clean penalty history for the prior three years." };
}

function fullCalc(income, status = "single", deps = 0, hasPenalty = false, monthsLate = 5, hasClean3Yr = true, state = "CA") {
  const fed = calcFederal(income, status);
  const st = calcCA(income, status);
  const totalTax = fed.totalTax + st.totalTax;
  const eitc = calcEITC(income, deps, status);
  const calEitc = calcCalEITC(income);
  const savers = calcSavers(income, status);
  const penalty = hasPenalty ? calcPenalty(totalTax, monthsLate, hasClean3Yr) : null;
  return { income, filingStatus: status, dependents: deps, state, fed, st, combined: { totalTax, effectiveRate: income > 0 ? totalTax / income : 0, takeHome: income - totalTax, monthlyTakeHome: Math.round((income - totalTax) / 12) }, eitc, calEitc, savers, penalty };
}

/* ═══════════════════════════════════════════ */
const fmt = (n) => "$" + Math.round(n).toLocaleString();
const fmtP = (r) => (r * 100).toFixed(1) + "%";
const short = (n) => n >= 1000 ? "$" + Math.round(n / 1000) + "K" : fmt(n);

const C = { primary: "#1f9d8b", primaryLight: "#57c8ba", primaryDark: "#127f72", accent: "#f59e0b", accentLight: "#fcd34d", accentDark: "#b45309", success: "#16a34a", warning: "#f59e0b", danger: "#dc2626", info: "#3b82f6", bg: "#f5f9ff", surface: "rgba(255,255,255,0.82)", border: "#d8e3f0", text: "#102a43", textSec: "#4f6478", muted: "#6b7f93" };
const font = { serif: "'DM Serif Display', Georgia, serif", sans: "'DM Sans', system-ui, sans-serif", mono: "'JetBrains Mono', monospace" };
const shadow = { sm: "0 1px 4px rgba(16,42,67,0.1)", md: "0 8px 28px rgba(16,42,67,0.16), 0 0 0 1px rgba(216,227,240,0.6)", card: "0 2px 10px rgba(16,42,67,0.12), 0 0 0 1px rgba(216,227,240,0.7)" };

const FILING = [
  { value: "single", label: "Single", icon: User, sub: "Unmarried, no dependents" },
  { value: "married_joint", label: "Married Filing Jointly", icon: Users, sub: "Married, combined return" },
  { value: "married_separate", label: "Married Separately", icon: ChevronsUpDown, sub: "Married, separate returns" },
  { value: "head_of_household", label: "Head of Household", icon: Home, sub: "Unmarried with qualifying dependent" },
];

const STATES = [
  { val: "CA", label: "California" }, { val: "TX", label: "Texas" }, { val: "FL", label: "Florida" },
  { val: "NY", label: "New York" }, { val: "PA", label: "Pennsylvania" }, { val: "IL", label: "Illinois" },
  { val: "OH", label: "Ohio" }, { val: "GA", label: "Georgia" }, { val: "NC", label: "North Carolina" },
  { val: "MI", label: "Michigan" }, { val: "OTHER", label: "Other" }
];

/* ═══════════════════════════════════════════
   REUSABLE COMPONENTS
   ═══════════════════════════════════════════ */
function Sect({ children }) {
  return (<div style={{ display: "flex", alignItems: "center", gap: 14, margin: "52px 0 20px", whiteSpace: "nowrap" }}><span style={{ fontFamily: font.sans, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted }}>{children}</span><div style={{ flex: 1, height: 1, background: C.border }} /></div>);
}

function KPI({ label, value, color, desc, icon: Icon, delay = 0, children, onClick }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.35 }} onClick={onClick}
      style={{ background: C.surface, borderRadius: 18, padding: "28px 28px", border: `1px solid ${C.border}`, boxShadow: shadow.card, position: "relative", overflow: "hidden", cursor: onClick ? "pointer" : "default" }}
      whileHover={onClick ? { boxShadow: shadow.md } : undefined}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: color || C.primary, opacity: 0.7 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        {Icon && <Icon size={15} color={C.muted} />}
        <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</span>
      </div>
      <div style={{ fontFamily: font.serif, fontSize: 34, color: color || C.primary, lineHeight: 1.1 }}>{value}</div>
      {desc && <div style={{ marginTop: 10, fontSize: 14, color: C.textSec, lineHeight: 1.55 }}>{desc}</div>}
      {children}
    </motion.div>
  );
}

function Bar({ label, amount, amtColor, pct, color, delay = 0 }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7, fontSize: 15, gap: 8 }}>
        <span style={{ color: C.text }}>{label}</span>
        <span style={{ fontFamily: font.mono, fontWeight: 600, color: amtColor || C.primary, whiteSpace: "nowrap", fontSize: 14 }}>{amount}</span>
      </div>
      <div style={{ height: 12, background: C.border, borderRadius: 99, overflow: "hidden" }}>
        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ height: "100%", width: `${Math.min(100, Math.max(0.4, pct))}%`, background: color, borderRadius: 99, transformOrigin: "left" }} />
      </div>
    </div>
  );
}

function Brackets({ title, brackets, color, total, income }) {
  if (!brackets.length) return (<div style={{ padding: "10px 0" }}><div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{title}</div><div style={{ fontSize: 13, color: C.success, fontWeight: 600 }}>Income below standard deduction — $0 tax ✓</div></div>);
  return (
    <div style={{ padding: "10px 0" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>{title}</div>
      {brackets.map((b, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: i < brackets.length - 1 ? `1px solid ${C.bg}` : "none" }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: `${color}10`, color, border: `1px solid ${color}25`, whiteSpace: "nowrap" }}>{fmtP(b.rate)}</span>
          <span style={{ flex: 1, fontSize: 12, color: C.textSec }}>{fmt(b.rangeStart + (i > 0 ? 1 : 0))} – {b.rangeEnd === Infinity ? "∞" : fmt(b.rangeEnd)}</span>
          <span style={{ fontFamily: font.mono, fontSize: 12, fontWeight: 600, color: C.text }}>{fmt(b.taxOnBracket)}</span>
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, marginTop: 6, borderTop: `2px solid ${color}15` }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Subtotal</span>
        <span style={{ fontFamily: font.serif, fontSize: 16, color }}>{fmt(total)} <span style={{ fontSize: 11, color: C.muted, fontFamily: font.sans, marginLeft: 4 }}>({fmtP(income > 0 ? total / income : 0)} eff.)</span></span>
      </div>
    </div>
  );
}

function SCard({ icon, name, value, vColor, desc, badge, bColor, delay = 0, locked = false, range = "", onUnlock }) {
  const bs = { green: { bg: `${C.success}10`, c: C.success, bd: `${C.success}25` }, amber: { bg: `${C.warning}10`, c: C.accentDark, bd: `${C.warning}25` }, blue: { bg: `${C.info}10`, c: C.info, bd: `${C.info}25` }, red: { bg: `${C.danger}10`, c: C.danger, bd: `${C.danger}25` }, gray: { bg: `${C.muted}12`, c: C.muted, bd: `${C.muted}25` }, purple: { bg: "#8B5CF610", c: "#8B5CF6", bd: "#8B5CF625" } }[bColor] || { bg: `${C.success}10`, c: C.success, bd: `${C.success}25` };
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.35 }}
      style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: "24px 24px", boxShadow: shadow.sm, transition: "transform 0.2s, box-shadow 0.2s" }}
      whileHover={{ y: -3, boxShadow: shadow.md }}>
      <div style={{ fontSize: 26, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontFamily: font.serif, fontSize: 16, color: C.text, marginBottom: 3 }}>{name}</div>
      <div style={{ fontFamily: font.mono, fontSize: 14, fontWeight: 600, color: vColor || C.primary, marginBottom: 10 }}>
        {locked ? (range || "Estimated opportunity") : value}
      </div>
      <div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.65, marginBottom: 12, filter: locked ? "blur(1.5px)" : "none" }}>
        {desc}
      </div>
      {badge && <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "4px 11px", borderRadius: 99, background: bs.bg, color: bs.c, border: `1px solid ${bs.bd}` }}>{badge}</span>}
      {locked && (
        <button
          onClick={onUnlock}
          style={{ marginTop: 12, width: "100%", border: "none", borderRadius: 12, background: C.primary, color: "#fff", padding: "10px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
        >
          Unlock details
        </button>
      )}
    </motion.div>
  );
}

function FStep({ n, title, desc }) {
  return (<div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}><div style={{ width: 30, height: 30, borderRadius: "50%", background: `${C.primary}10`, border: `1px solid ${C.primary}25`, color: C.primary, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{n}</div><div><div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 2 }}>{title}</div><div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.6 }}>{desc}</div></div></div>);
}

function QA({ q, children, open: defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = `qa-panel-${q.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, overflow: "hidden", boxShadow: shadow.sm }}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={panelId}
        style={{ width: "100%", padding: "20px 24px", fontSize: 16, fontWeight: 600, color: C.text, background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, textAlign: "left", fontFamily: font.sans }}
      >
        {q}<motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown size={18} color={C.primary} /></motion.div>
      </button>
      <AnimatePresence>
        {open && (<motion.div id={panelId} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: "hidden" }}><div style={{ padding: "0 22px 22px", borderTop: `1px solid ${C.border}`, paddingTop: 16, fontSize: 14, color: C.textSec, lineHeight: 1.75 }}>{children}</div></motion.div>)}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════
   AI CHATBOT
   ═══════════════════════════════════════════ */
function Chat({ result, isOpen, onClose, teaser = false, onUpgrade, isPro = false, remainingFree = 0, onUse }) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isOpen && msgs.length === 0) setMsgs([{ role: "assistant", content: `Hey! 👋 I'm your ${BRAND.name} assistant. I know your full tax situation at ${short(result.income)} in California.\n\nAsk me anything — your breakdown, savings, penalties, or what to do next.\n\n_${DISCLAIMER}_` }]);
  }, [isOpen]);

  useEffect(() => { scrollRef.current && (scrollRef.current.scrollTop = scrollRef.current.scrollHeight); }, [msgs, loading]);

  const quickQ = ["How much do I owe?", "What can I save?", "$600 waiver?", "Explain my bracket", "Find a CPA"];

  const send = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    const userMsg = { role: "user", content: msg };
    setMsgs(p => [...p, userMsg]);
    setLoading(true);
    try {
      const sys = `You are ${BRAND.name}'s tax assistant. Warm, direct, plain English. Like a smart friend who studied tax law.

USER'S TAX SITUATION:
- Gross income: ${fmt(result.income)} | Filing: ${result.filingStatus} | State: ${STATES.find(s=>s.val===result.state)?.label || result.state}
- Federal tax: ${fmt(result.fed.totalTax)} (eff: ${fmtP(result.fed.effectiveRate)}, marginal: ${fmtP(result.fed.marginalRate)})
- State tax: ${fmt(result.st.totalTax)} (eff: ${fmtP(result.st.effectiveRate)})
- Total: ${fmt(result.combined.totalTax)} | Eff rate: ${fmtP(result.combined.effectiveRate)}
- Take-home: ${fmt(result.combined.takeHome)}/yr (${fmt(result.combined.monthlyTakeHome)}/mo)
- EITC: ${result.eitc.eligible ? `Eligible ~${fmt(result.eitc.amount)}` : "Not eligible"}
- Saver's Credit: ${result.savers.eligible ? `${fmtP(result.savers.rate)} rate` : "Over limit"}
- CalEITC: ${result.calEitc.eligible ? "Eligible" : "Over limit"}
${result.penalty ? `\nPENALTY: ~${fmt(result.penalty.estimatedPenalty)} | FTA eligible: ${result.penalty.ftaEligible}\nIMPORTANT: FTA 3-year lookback is from the PENALTY YEAR, not today.` : ""}

RULES:
- Use specific numbers from their situation
- Never provide filing advice. You explain and educate.
- End complex advice with: "Confirm this with your CPA before taking action."
- Keep responses concise. If asked about other states: "We only support California right now."`;

      const allMsgs = [...msgs, userMsg].map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: sys, messages: allMsgs }),
      });
      const data = await res.json();
      const reply = data.content?.map(c => c.type === "text" ? c.text : "").join("") || "I'm having trouble connecting right now.";
      setMsgs(p => [...p, { role: "assistant", content: reply }]);
      if (!isPro) onUse?.();
    } catch { setMsgs(p => [...p, { role: "assistant", content: "Connection issue — try again shortly." }]); }
    setLoading(false);
  }, [input, loading, msgs, result, isPro, onUse]);

  if (!isOpen) return null;

  if (teaser) {
    return (
      <motion.div initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.96 }}
        style={{ position: "fixed", bottom: 96, right: 16, width: "min(400px, calc(100vw - 32px))", background: "rgba(15,15,22,0.92)", border: `1px solid ${C.border}`, borderRadius: 20, zIndex: 999, boxShadow: "0 24px 80px rgba(0,0,0,0.6)", overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", background: "linear-gradient(135deg, #059669, #34D399)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>AI Scenario Assistant</div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.14)", border: "none", borderRadius: 8, padding: 5, cursor: "pointer", display: "flex" }}><X size={16} color="#fff" /></button>
        </div>
        <div style={{ padding: 16, background: C.bg }}>
          <div style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.border}`, background: "#fff", color: C.textSec, fontSize: 13, lineHeight: 1.6 }}>
            Based on your {fmt(result.income)} income and {result.filingStatus.replace("_", " ")} filing status, you should consider optimizing your pre-tax strategy and...
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: C.muted }}>Unlock the full personalized answer and unlimited scenario guidance in Pro + AI.</div>
          {!isPro && (
            <button onClick={onUpgrade} style={{ marginTop: 12, width: "100%", border: "none", borderRadius: 12, background: C.primary, color: "#fff", padding: "11px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              Upgrade to Pro + AI ($9.99/mo)
            </button>
          )}
          {!isPro && remainingFree > 0 && (
            <div style={{ marginTop: 8, fontSize: 11, color: C.textSec }}>
              You still have {remainingFree} free AI session{remainingFree === 1 ? "" : "s"} after Full Access unlock.
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.96 }}
      style={{ position: "fixed", bottom: 96, right: 16, width: "min(400px, calc(100vw - 32px))", height: "min(560px, calc(100vh - 140px))", background: "rgba(15,15,22,0.92)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", border: `1px solid ${C.border}`, borderRadius: 20, display: "flex", flexDirection: "column", zIndex: 999, boxShadow: "0 24px 80px rgba(0,0,0,0.6)", overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", background: "linear-gradient(135deg, #059669, #34D399)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}><Calculator size={16} color="#fff" /></div>
        <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: font.sans }}>{BRAND.name} Assistant</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>Knows your full situation</div></div>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, padding: 5, cursor: "pointer", display: "flex" }}><X size={16} color="#fff" /></button>
      </div>
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.map((m, i) => (<div key={i} style={{ maxWidth: "85%", padding: "10px 14px", borderRadius: 14, fontSize: 13.5, lineHeight: 1.6, whiteSpace: "pre-wrap", fontFamily: font.sans, ...(m.role === "user" ? { background: C.primary, color: "#fff", alignSelf: "flex-end", borderBottomRightRadius: 4 } : { background: C.bg, color: C.text, alignSelf: "flex-start", borderBottomLeftRadius: 4, border: `1px solid ${C.border}` }) }}>{m.content}</div>))}
        {loading && (<div style={{ display: "flex", gap: 4, padding: "10px 14px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14, borderBottomLeftRadius: 4, alignSelf: "flex-start" }}>{[0, 1, 2].map(i => <motion.span key={i} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.12 }} style={{ width: 6, height: 6, borderRadius: "50%", background: C.muted }} />)}</div>)}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, padding: "8px 14px", borderTop: `1px solid ${C.border}` }}>
        {quickQ.map(q => <button key={q} onClick={() => send(q)} style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text, fontSize: 11.5, fontFamily: font.sans, padding: "4px 10px", borderRadius: 99, cursor: "pointer", whiteSpace: "nowrap" }}>{q}</button>)}
      </div>
      <div style={{ display: "flex", gap: 8, padding: "10px 14px", borderTop: `1px solid ${C.border}`, background: C.bg }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask anything…" style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 12px", fontSize: 13, fontFamily: font.sans, color: C.text, outline: "none" }} />
        <button onClick={() => send()} style={{ width: 36, height: 36, borderRadius: 10, background: C.primary, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Send size={14} color="#fff" /></button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   ONBOARDING FLOW
   ═══════════════════════════════════════════ */
function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const [income, setIncome] = useState(50000);
  const [status, setStatus] = useState("single");
  const [stateCode, setStateCode] = useState("CA");
  const [deps, setDeps] = useState(0);
  const [incomeType, setIncomeType] = useState("w2");
  const [hasPenalty, setHasPenalty] = useState(false);
  const [hasStudentLoans, setHasStudentLoans] = useState(false);
  const [hasRetirement, setHasRetirement] = useState(false);
  const [hasHDHP, setHasHDHP] = useState(false);

  const titles = [
    { h: "What's your gross annual income?", p: "Your total income before any deductions — the number on your W-2 or 1099." },
    { h: "What's your tax situation?", p: "This determines your tax brackets and standard deduction amount." },
    { h: "Anything else we should explore?", p: "Optional — helps us identify tax scenarios we should model for." },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: font.sans }}>
      <div style={{ position: "fixed", inset: 0, background: `radial-gradient(ellipse 60% 50% at 20% 20%, rgba(52,211,153,0.08), transparent), radial-gradient(ellipse 50% 40% at 85% 80%, rgba(167,139,250,0.07), transparent)`, pointerEvents: "none" }} />
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ width: "100%", maxWidth: 580, background: "rgba(18,18,26,0.92)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, boxShadow: "0 32px 80px rgba(0,0,0,0.6)", overflow: "hidden", position: "relative", zIndex: 1 }}>
        <div style={{ height: 3, background: C.border }}><motion.div animate={{ width: `${((step + 1) / 3) * 100}%` }} transition={{ duration: 0.4 }} style={{ height: "100%", background: `linear-gradient(90deg, ${C.primary}, ${C.primaryLight})`, borderRadius: 3 }} /></div>
        <div style={{ padding: "clamp(24px, 6vw, 44px) clamp(20px, 6vw, 36px) clamp(24px, 6vw, 36px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #34D399, #059669)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(52,211,153,0.4)" }}><FileText size={16} color="#fff" /></div>
            <span style={{ fontFamily: font.serif, fontSize: 18, color: C.primary }}>{BRAND.name}</span>
            <span style={{ marginLeft: "auto", fontSize: 12, color: C.muted, fontWeight: 600 }}>Step {step + 1} / 3</span>
          </div>
          <h2 style={{ fontFamily: font.serif, fontSize: 28, color: C.text, marginBottom: 8, lineHeight: 1.2 }}>{titles[step].h}</h2>
          <p style={{ color: C.textSec, fontSize: 15, marginBottom: 36, lineHeight: 1.6 }}>{titles[step].p}</p>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
                <div style={{ textAlign: "center", marginBottom: 28 }}>
                  <span style={{ fontFamily: font.mono, fontSize: "clamp(36px, 10vw, 52px)", fontWeight: 700, color: C.primary, letterSpacing: "-0.02em" }}>{fmt(income)}</span>
                  <div style={{ fontSize: 14, color: C.muted, marginTop: 6 }}>per year</div>
                </div>
                <div style={{ position: "relative", height: 10, background: C.border, borderRadius: 99, marginBottom: 12 }}>
                  <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${((income - 15000) / (500000 - 15000)) * 100}%`, background: `linear-gradient(90deg, ${C.primary}, ${C.primaryLight})`, borderRadius: 99, transition: "width 0.02s" }} />
                  <input type="range" min={15000} max={500000} step={500} value={income} onChange={e => setIncome(+e.target.value)} aria-label="Gross annual income"
                    style={{ position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)", width: "100%", height: 32, WebkitAppearance: "none", appearance: "none", background: "transparent", outline: "none", cursor: "pointer", margin: 0 }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.muted, fontWeight: 500 }}><span>$15K</span><span>$100K</span><span>$250K</span><span>$500K</span></div>
                <div style={{ display: "flex", gap: 8, marginTop: 28 }}>
                  {["w2", "1099", "mixed"].map(t => (
                    <button key={t} onClick={() => setIncomeType(t)} style={{ flex: 1, padding: "14px 0", borderRadius: 12, border: `2px solid ${incomeType === t ? C.primary : C.border}`, background: incomeType === t ? `${C.primary}08` : "transparent", cursor: "pointer", fontSize: 15, fontWeight: 700, fontFamily: font.sans, color: incomeType === t ? C.primary : C.textSec, transition: "all 0.15s" }}>
                      {t === "w2" ? "W-2" : t === "1099" ? "1099" : "Both"}
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: 28 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.textSec, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>State</div>
                  <select value={stateCode} onChange={e => setStateCode(e.target.value)} style={{ width: "100%", padding: "16px 18px", borderRadius: 14, border: `1px solid ${C.border}`, fontSize: 17, fontFamily: font.sans, color: C.text, background: "rgba(255,255,255,0.08)", outline: "none", cursor: "pointer" }}>
                    {STATES.map(s => <option key={s.val} value={s.val}>{s.label}</option>)}
                  </select>
                </div>
              </motion.div>
            )}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 10 }}>
                  {FILING.map(f => {
                    const Icon = f.icon; const sel = status === f.value; return (
                      <button key={f.value} onClick={() => setStatus(f.value)} style={{ padding: "20px 18px", borderRadius: 16, border: `2px solid ${sel ? C.primary : C.border}`, background: sel ? `${C.primary}08` : C.surface, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                        <Icon size={22} color={sel ? C.primary : C.muted} style={{ marginBottom: 8 }} />
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: font.sans }}>{f.label}</div>
                        <div style={{ fontSize: 12, color: C.textSec, marginTop: 3 }}>{f.sub}</div>
                      </button>
                    );
                  })}
                </div>
                <div style={{ marginTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div><div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Dependents</div><div style={{ fontSize: 12, color: C.textSec }}>Children or qualifying relatives</div></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <button onClick={() => setDeps(Math.max(0, deps - 1))} style={{ width: 44, height: 44, borderRadius: 12, border: `1px solid ${C.border}`, background: C.surface, cursor: "pointer", fontSize: 24, color: C.textSec, fontFamily: font.sans }}>−</button>
                    <span style={{ fontFamily: font.mono, fontSize: 22, fontWeight: 700, color: C.text, minWidth: 28, textAlign: "center" }}>{deps}</span>
                    <button onClick={() => setDeps(Math.min(10, deps + 1))} style={{ width: 44, height: 44, borderRadius: 12, border: `1px solid ${C.border}`, background: C.surface, cursor: "pointer", fontSize: 24, color: C.textSec, fontFamily: font.sans }}>+</button>
                  </div>
                </div>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
                {[
                  { label: "I have a late filing penalty", sub: "We'll show you how to potentially eliminate it", state: hasPenalty, set: setHasPenalty, color: C.danger },
                  { label: "I have student loans", sub: "Up to $2,500 interest may be deductible", state: hasStudentLoans, set: setHasStudentLoans, color: C.info },
                  { label: "I have a retirement account (401k/IRA)", sub: "Contributions may reduce your taxable income", state: hasRetirement, set: setHasRetirement, color: C.success },
                  { label: "I have a high-deductible health plan", sub: "You may qualify for HSA tax savings", state: hasHDHP, set: setHasHDHP, color: C.warning },
                ].map((item, i) => (
                  <label key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "18px 20px", borderRadius: 16, border: `2px solid ${item.state ? item.color + "40" : C.border}`, background: item.state ? item.color + "06" : "transparent", cursor: "pointer", marginBottom: 12, transition: "all 0.15s" }}>
                    <input type="checkbox" checked={item.state} onChange={e => item.set(e.target.checked)} style={{ width: 24, height: 24, marginTop: 2, accentColor: item.color, flexShrink: 0 }} />
                    <div><div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{item.label}</div><div style={{ fontSize: 13, color: C.textSec, marginTop: 2 }}>{item.sub}</div></div>
                  </label>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 36, gap: 12 }}>
            {step > 0 ? (<button onClick={() => setStep(step - 1)} style={{ padding: "14px 26px", borderRadius: 14, border: `1px solid ${C.border}`, background: C.surface, cursor: "pointer", fontSize: 15, fontWeight: 700, color: C.textSec, fontFamily: font.sans, display: "flex", alignItems: "center", gap: 8 }}><ArrowLeft size={16} /> Back</button>) : <div />}
            <button onClick={() => step < 2 ? setStep(step + 1) : onDone({ income, status, deps, incomeType, stateCode, hasPenalty, hasStudentLoans, hasRetirement, hasHDHP })}
              style={{ padding: "14px 30px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})`, color: "#fff", cursor: "pointer", fontSize: 15, fontWeight: 700, fontFamily: font.sans, display: "flex", alignItems: "center", gap: 8, boxShadow: `0 4px 16px ${C.primary}40` }}>
              {step < 2 ? <>Continue <ArrowRight size={16} /></> : <>See My Breakdown <Sparkles size={16} /></>}
            </button>
          </div>
        </div>
        <div style={{ padding: "14px 36px", background: "rgba(0,0,0,0.2)", borderTop: `1px solid ${C.border}`, fontSize: 11, color: C.muted, lineHeight: 1.6 }}>{DISCLAIMER}</div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════ */
export default function TaxedApp({ session }) {
  const [boarded, setBoarded] = useState(false);
  const [income, setIncome] = useState(50000);
  const [status, setStatus] = useState("single");
  const [stateCode, setStateCode] = useState("CA");
  const [deps, setDeps] = useState(0);
  const [hasPenalty, setHasPenalty] = useState(false);
  const [bracketOpen, setBracketOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [actions, setActions] = useState({});
  const [cloudLoading, setCloudLoading] = useState(false);
  const [cloudMessage, setCloudMessage] = useState("");
  const [entitlement, setEntitlement] = useState({ full_access: false, pro_ai: false, status: "inactive" });
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallReason, setPaywallReason] = useState("unlock");
  const [selectedPlan, setSelectedPlan] = useState("full");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutNotice, setCheckoutNotice] = useState("");
  const [aiFreeUses, setAiFreeUses] = useState(() => Number(localStorage.getItem("taxed_ai_free_uses") || 0));
  const [checkoutSessionId, setCheckoutSessionId] = useState(() => localStorage.getItem("taxed_checkout_session_id") || "");
  const [incomeWallShown, setIncomeWallShown] = useState(false);
  const reportRef = useRef(null);
  const userId = session?.user?.id;

  const r = useMemo(() => fullCalc(income, status, deps, hasPenalty, 5, true, stateCode), [income, status, deps, hasPenalty, stateCode]);
  const onBoard = (d) => { setIncome(d.income); setStatus(d.status); setDeps(d.deps); setStateCode(d.stateCode); setHasPenalty(d.hasPenalty); setBoarded(true); };
  const hasFullAccess = Boolean(entitlement?.full_access);
  const hasProAI = Boolean(entitlement?.pro_ai);
  const canUseAI = hasProAI || aiFreeUses < 2;

  useEffect(() => {
    const loadLatestScenario = async () => {
      if (!userId || boarded) return;
      const { data, error } = await supabase
        .from("projects")
        .select("payload")
        .eq("user_id", userId)
        .eq("name", "latest_scenario")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        return;
      }

      if (data?.payload) {
        const p = data.payload;
        setIncome(Number(p.income) || 50000);
        setStatus(p.status || "single");
        setDeps(Number(p.deps) || 0);
        setStateCode(p.stateCode || "CA");
        setHasPenalty(Boolean(p.hasPenalty));
        setBoarded(true);
        setCloudMessage("Loaded your last saved scenario.");
      }
    };

    loadLatestScenario();
  }, [userId, boarded]);

  useEffect(() => {
    const syncEntitlement = async () => {
      if (!userId) {
        setEntitlement({ full_access: false, pro_ai: false, status: "inactive" });
        return;
      }
      const data = await loadEntitlement(userId);
      if (data) setEntitlement(data);
    };
    syncEntitlement();
  }, [userId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutState = params.get("checkout");
    const sessionId = params.get("session_id");
    if (!sessionId || checkoutState !== "success") return;

    const verify = async () => {
      try {
        const data = await getCheckoutStatus(sessionId);
        if (!data.active) return;
        setEntitlement({
          full_access: true,
          pro_ai: data.plan === "pro",
          status: "active",
        });
        localStorage.setItem("taxed_checkout_session_id", sessionId);
        setCheckoutSessionId(sessionId);
        setCheckoutNotice(
          userId
            ? "Payment confirmed. Your access is active."
            : "Payment confirmed. Create or log into your account to protect your purchase."
        );
        if (data.plan === "pro") {
          localStorage.setItem("taxed_ai_free_uses", "0");
          setAiFreeUses(0);
        }
      } catch (error) {
        setCheckoutNotice(error.message || "Could not verify checkout status.");
      }
    };

    verify();
  }, [userId]);

  useEffect(() => {
    const claim = async () => {
      if (!userId || !checkoutSessionId) return;
      try {
        const result = await claimEntitlement(checkoutSessionId);
        setEntitlement((prev) => ({
          ...prev,
          full_access: Boolean(result.full_access),
          pro_ai: Boolean(result.pro_ai),
          status: "active",
        }));
        setCheckoutNotice("Purchase linked to your account.");
      } catch {
        // Ignore silent claim failures; user can still continue with local unlock.
      }
    };
    claim();
  }, [userId, checkoutSessionId]);

  useEffect(() => {
    if (hasFullAccess || incomeWallShown) return;
    if (income > 50000) {
      setIncomeWallShown(true);
      setPaywallReason("income");
      setPaywallOpen(true);
    }
  }, [income, hasFullAccess, incomeWallShown]);

  if (!boarded) return <Onboarding onDone={onBoard} />;

  const sldPct = ((income - 15000) / (500000 - 15000)) * 100;
  const statusLabel = FILING.find(f => f.value === status)?.label || status;
  const stateLabel = STATES.find(s => s.val === stateCode)?.label || stateCode;
  const iraSave = Math.round(5000 * r.fed.marginalRate);
  const hsaSave = Math.round(4150 * r.fed.marginalRate);
  const maxSave = (hasPenalty && r.penalty ? r.penalty.ftaSavings : 0) + r.eitc.amount + iraSave;
  const toggleAction = (id) => setActions(p => ({ ...p, [id]: !p[id] }));
  const opportunities = useMemo(() => {
    const list = [
      {
        id: "eitc",
        icon: "🏛️",
        name: "Federal EITC",
        value: r.eitc.eligible ? `Up to ${fmt(r.eitc.amount)}` : "Over income limit",
        vColor: r.eitc.eligible ? C.success : C.muted,
        desc: r.eitc.eligible
          ? `At ${short(income)} you may qualify for ${fmt(r.eitc.amount)}. It's refundable.`
          : `At ${short(income)} you appear above the typical threshold.`,
        badge: r.eitc.eligible ? "Refundable" : "Over Limit",
        bColor: r.eitc.eligible ? "green" : "gray",
        estimate: r.eitc.amount,
        range: r.eitc.eligible ? `${fmt(Math.max(150, Math.round(r.eitc.amount * 0.65)))}-${fmt(Math.max(250, r.eitc.amount))}` : "$200-$800",
      },
      {
        id: "ira",
        icon: "📦",
        name: "Traditional IRA",
        value: "Up to $7,000/yr",
        vColor: C.info,
        desc: `A $5K IRA at ${short(income)} saves ≈${fmt(iraSave)} in federal tax.`,
        badge: "Pre-Tax",
        bColor: "blue",
        estimate: iraSave,
        range: `${fmt(Math.max(200, Math.round(iraSave * 0.6)))}-${fmt(Math.max(500, iraSave + 200))}`,
      },
      {
        id: "hsa",
        icon: "🏥",
        name: "HSA",
        value: "Up to $4,150/yr",
        vColor: C.accentDark,
        desc: `Full HSA at ${short(income)} saves ≈${fmt(hsaSave)} in federal tax.`,
        badge: "Triple Tax Advantage",
        bColor: "amber",
        estimate: hsaSave,
        range: `${fmt(Math.max(150, Math.round(hsaSave * 0.6)))}-${fmt(Math.max(350, hsaSave + 150))}`,
      },
      {
        id: "cal",
        icon: "🌱",
        name: "CA CalEITC",
        value: r.calEitc.eligible ? `Eligible (~${fmt(r.calEitc.amount)})` : "Not eligible",
        vColor: r.calEitc.eligible ? C.success : C.muted,
        desc: r.calEitc.eligible ? "Under the CA income limit for this credit." : "Likely above the state income cutoff.",
        badge: r.calEitc.eligible ? "State Credit" : "Income Too High",
        bColor: r.calEitc.eligible ? "green" : "gray",
        estimate: r.calEitc.amount,
        range: r.calEitc.eligible ? `${fmt(100)}-${fmt(Math.max(220, r.calEitc.amount))}` : "$120-$420",
      },
    ];
    return list.sort((a, b) => b.estimate - a.estimate);
  }, [r.eitc.amount, r.eitc.eligible, income, iraSave, hsaSave, r.calEitc.eligible, r.calEitc.amount]);
  const primaryOpportunity = opportunities[0];
  const lockedOpportunities = opportunities.slice(1, 4);

  const generatePDF = async () => {
    if (!hasFullAccess) {
      openPaywall("export");
      return;
    }
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: C.bg });
    const imgData = canvas.toDataURL("image/jpeg", 1.0);
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = (canvas.height * pdfW) / canvas.width;
    pdf.addImage(imgData, "JPEG", 0, 0, pdfW, pdfH);
    pdf.save(`Taxed_Report_${stateCode}.pdf`);
  };

  const saveScenarioToCloud = async () => {
    if (!userId) return;
    setCloudLoading(true);
    setCloudMessage("");
    const payload = {
      income,
      status,
      deps,
      stateCode,
      hasPenalty,
      savedAt: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("projects")
      .upsert(
        {
          user_id: userId,
          name: "latest_scenario",
          payload,
        },
        { onConflict: "user_id,name" }
      );

    if (error) {
      setCloudMessage(`Save failed: ${error.message}`);
    } else {
      setCloudMessage("Saved to cloud.");
    }
    setCloudLoading(false);
  };

  const openPaywall = (reason = "unlock") => {
    if (hasFullAccess) return;
    setPaywallReason(reason);
    setPaywallOpen(true);
  };

  const handleCheckout = async () => {
    try {
      setCheckoutLoading(true);
      setCheckoutNotice("");
      await startCheckout({
        plan: selectedPlan,
        email: session?.user?.email || undefined,
        scenario: { income, filingStatus: status, dependents: deps, stateCode },
      });
    } catch (error) {
      setCheckoutNotice(error.message || "Unable to start checkout right now.");
      setCheckoutLoading(false);
    }
  };

  const actionItems = [
    ...(hasPenalty ? [{ id: "fta", text: <>Ask your CPA to call the IRS for the <strong style={{ color: C.text }}>First-Time Penalty Abatement</strong>. If they won't, call <strong style={{ color: C.primary }}>1-800-829-1040</strong> yourself — 10 minutes.</> }] : []),
    { id: "eitc", text: r.eitc.eligible ? <>Confirm <strong style={{ color: C.text }}>EITC eligibility</strong> with your CPA — at {short(income)} you could get <strong style={{ color: C.success }}>{fmt(r.eitc.amount)}</strong> back.</> : <>Check with your CPA if any <strong style={{ color: C.text }}>credits</strong> apply — EITC, student loan interest, Saver's Credit.</> },
    { id: "ira", text: <>Open a <strong style={{ color: C.text }}>Traditional IRA before April 15</strong> — even $2K saves ≈{fmt(Math.round(2000 * r.fed.marginalRate))} in federal tax.</> },
  ];

  return (
    <div className="calculator-page" style={{ minHeight: "100vh", background: C.bg, fontFamily: font.sans, paddingBottom: 100 }}>
      <div style={{ position: "fixed", inset: 0, background: `radial-gradient(ellipse 60% 50% at 15% 10%, rgba(52,211,153,0.08), transparent), radial-gradient(ellipse 50% 40% at 85% 85%, rgba(167,139,250,0.07), transparent)`, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", inset: 0, backgroundImage: `linear-gradient(rgba(52,211,153,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.03) 1px, transparent 1px)`, backgroundSize: "52px 52px", pointerEvents: "none", zIndex: 0 }} />

      <div ref={reportRef} className="calculator-report" style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 20px", position: "relative", zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg, #34D399, #059669)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(52,211,153,0.35)" }}><FileText size={16} color="#fff" /></div>
              <span style={{ fontFamily: font.serif, fontSize: 19, color: C.primary }}>{BRAND.name}</span>
            </div>
            <button onClick={generatePDF} style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 18px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 99, fontSize: 14, fontWeight: 700, color: C.text, cursor: "pointer", boxShadow: shadow.sm, transition: "all 0.2s" }} onMouseOver={e => e.currentTarget.style.boxShadow = shadow.md} onMouseOut={e => e.currentTarget.style.boxShadow = shadow.sm}>
              <Download size={14} /> Export PDF for CPA
            </button>
            {userId && (
              <button onClick={saveScenarioToCloud} disabled={cloudLoading} style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 18px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 99, fontSize: 14, fontWeight: 700, color: C.text, cursor: cloudLoading ? "wait" : "pointer", boxShadow: shadow.sm, transition: "all 0.2s", opacity: cloudLoading ? 0.75 : 1 }}>
                <CloudUpload size={14} /> {cloudLoading ? "Saving..." : "Save to Cloud"}
              </button>
            )}
          </div>
          {cloudMessage && (
            <div style={{ marginBottom: 10, fontSize: 13, color: cloudMessage.startsWith("Save failed") ? C.danger : C.success }}>
              {cloudMessage}
            </div>
          )}
          <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Tax Summary · {short(income)} · {stateLabel} · {statusLabel}</div>
          <h1 style={{ fontFamily: font.serif, fontSize: "clamp(30px, 5vw, 46px)", color: C.text, lineHeight: 1.12, marginBottom: 8 }}>Your Tax Situation,<br />Broken Down.</h1>
          <p style={{ color: C.textSec, fontSize: 15, lineHeight: 1.6 }}>Drag the slider — every number updates instantly</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ background: `${C.info}10`, border: `1px solid ${C.info}25`, borderRadius: 14, padding: "18px 22px", display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 36 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: `${C.info}15`, color: C.info, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Shield size={16} /></div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>Educational Context Only</div>
            <div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.5 }}>Taxed is a tool for exploring strategies, identifying risks, and modeling scenarios. This is not a filing service or official tax advice.</div>
          </div>
        </motion.div>

        <Sect>Income & Tax at a Glance</Sect>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 18 }}>
          <KPI label="Gross Income" value={fmt(income)} color={C.info} desc="Drag the slider to explore" icon={DollarSign}>
            <div style={{ marginTop: 16, position: "relative" }}>
              <div style={{ position: "relative", height: 12, background: C.border, borderRadius: 99 }}>
                <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${sldPct}%`, background: `linear-gradient(90deg, ${C.info}, ${C.primary})`, borderRadius: 99, transition: "width 0.02s" }} />
                <input type="range" min={15000} max={500000} step={500} value={income} onChange={e => setIncome(+e.target.value)} aria-label="Income"
                  style={{ position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)", width: "100%", height: 32, WebkitAppearance: "none", appearance: "none", background: "transparent", outline: "none", cursor: "pointer", margin: 0 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: C.muted, fontWeight: 500 }}><span>$15K</span><span>$150K</span><span>$500K</span></div>
            </div>
          </KPI>

          <KPI label="Est. Total Tax Owed" value={"≈" + fmt(r.combined.totalTax)} color={C.danger} desc={`Federal ≈${fmt(r.fed.totalTax)} + State ≈${fmt(r.st.totalTax)}`} icon={AlertTriangle} delay={0.05} onClick={() => setBracketOpen(!bracketOpen)}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 10, fontSize: 12, color: C.primary, fontWeight: 600 }}>Tap for bracket breakdown <motion.div animate={{ rotate: bracketOpen ? 180 : 0 }}><ChevronDown size={14} /></motion.div></div>
            <AnimatePresence>
              {bracketOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                  <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 12, paddingTop: 12 }}>
                    <Brackets title="Federal Income Tax" brackets={r.fed.taxByBracket} color={C.danger} total={r.fed.totalTax} income={income} />
                    <div style={{ height: 1, background: C.border, margin: "8px 0" }} />
                    <Brackets title={`${stateLabel} State Tax`} brackets={r.st.taxByBracket} color="#8B5CF6" total={r.st.incomeTax} income={income} />
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: 12 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: `${C.info}10`, color: C.info, border: `1px solid ${C.info}25` }}>SDI 0.9%</span>
                      <span style={{ flex: 1, color: C.textSec }}>State Disability Insurance</span>
                      <span style={{ fontFamily: font.mono, fontWeight: 600 }}>{fmt(r.st.sdi)}</span>
                    </div>
                    {r.st.mentalHealthSurcharge > 0 && (<div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: 12 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: `${C.danger}10`, color: C.danger, border: `1px solid ${C.danger}25` }}>MHS 1%</span>
                      <span style={{ flex: 1, color: C.textSec }}>Mental Health Surcharge (&gt;$1M)</span>
                      <span style={{ fontFamily: font.mono, fontWeight: 600 }}>{fmt(r.st.mentalHealthSurcharge)}</span>
                    </div>)}
                    <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, marginTop: 8, borderTop: `2px solid ${C.border}` }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Total Tax Owed</span>
                      <span style={{ fontFamily: font.serif, fontSize: 20, color: C.text }}>{fmt(r.combined.totalTax)}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </KPI>

          <KPI label="Effective Tax Rate" value={"≈" + fmtP(r.combined.effectiveRate)} color={C.primary} desc={`Take-home: ${fmt(r.combined.takeHome)}/yr · ${fmt(r.combined.monthlyTakeHome)}/mo`} icon={TrendingDown} delay={0.1}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${C.primary}08`, border: `1px solid ${C.primary}15`, borderRadius: 99, padding: "4px 12px", marginTop: 10, fontSize: 12, color: C.primary, fontWeight: 600 }}>
              Marginal: {fmtP(r.fed.marginalRate)} fed + {fmtP(r.st.marginalRate)} {stateCode}
            </div>
          </KPI>
        </div>

        <Sect>Where Your Money Goes</Sect>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "24px 28px", boxShadow: shadow.card, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${C.info}, #8B5CF6)`, opacity: 0.7 }} />
          <Bar label="Gross Income" amount={fmt(income)} pct={100} color={`linear-gradient(90deg, ${C.info}, #8B5CF6)`} delay={0.1} />
          <Bar label="Federal Standard Deduction" amount={"−" + fmt(r.fed.standardDeduction)} amtColor={C.success} pct={income > 0 ? r.fed.standardDeduction / income * 100 : 0} color={C.success} delay={0.15} />
          <Bar label="Federal Taxable Income" amount={fmt(r.fed.taxableIncome)} amtColor={C.accent} pct={income > 0 ? r.fed.taxableIncome / income * 100 : 0} color={`linear-gradient(90deg, ${C.accent}, #F97316)`} delay={0.2} />
          <Bar label="Federal Income Tax" amount={"≈" + fmt(r.fed.totalTax)} amtColor={C.danger} pct={income > 0 ? r.fed.totalTax / income * 100 : 0} color={C.danger} delay={0.25} />
          <Bar label={`${stateCode} Standard Deduction`} amount={"−" + fmt(r.st.standardDeduction)} amtColor={C.success} pct={income > 0 ? r.st.standardDeduction / income * 100 : 0} color={`${C.success}90`} delay={0.3} />
          <Bar label={`${stateCode} State Tax`} amount={"≈" + fmt(r.st.totalTax)} amtColor="#8B5CF6" pct={income > 0 ? r.st.totalTax / income * 100 : 0} color="#8B5CF6" delay={0.35} />
        </motion.div>

        <div style={{ height: 1, background: C.border, margin: "44px 0" }} />

        {hasPenalty && r.penalty && (<>
          <Sect>Late Filing Penalty & How to Fix It</Sect>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 14 }}>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, boxShadow: shadow.card, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: C.danger, opacity: 0.7 }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>The Problem</div>
              <div style={{ background: `${C.danger}06`, border: `1px solid ${C.danger}18`, borderRadius: 12, padding: 18, marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                  <span style={{ background: `${C.danger}10`, color: C.danger, fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 99, border: `1px solid ${C.danger}25` }}>⚠ Late Filing Penalty</span>
                  <span style={{ fontFamily: font.serif, fontSize: 26, color: C.danger }}>{fmt(r.penalty.estimatedPenalty)}</span>
                </div>
                <p style={{ fontSize: 14, color: C.textSec, lineHeight: 1.7, marginBottom: 10 }}>IRS charges 5% of unpaid tax per month (up to 25%). With ≈{fmt(r.combined.totalTax)} owed and ~5 months late, {fmt(r.penalty.estimatedPenalty)} is in range.</p>
                <p style={{ fontSize: 14, color: C.danger, fontWeight: 700 }}>Your CPA filed late — this is on them, not you.</p>
              </div>
              <div style={{ fontSize: 14, color: C.textSec, lineHeight: 1.8 }}>Call IRS: <strong style={{ color: C.primary }}>1-800-829-1040</strong><br />Say: <em>"{r.penalty.irsScript}"</em></div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, boxShadow: shadow.card, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: C.primary, opacity: 0.7 }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 18 }}>First-Time Abatement (FTA)</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <FStep n={1} title="Check Eligibility" desc="No penalties in the 3 tax years before the penalty year. All returns filed. Tax paid or in arrangement." />
                <FStep n={2} title="Call or Write the IRS" desc="Phone is fastest — often approved same call. Use Form 843 by mail if penalty is already paid." />
                <FStep n={3} title={`${fmt(r.penalty.estimatedPenalty)} Penalty Wiped`} desc="Covers failure-to-file and failure-to-pay. One-time use per taxpayer." />
                <FStep n={4} title="Resets After 3 Clean Years" desc="File on time, pay what you owe — eligible again after 3 consecutive clean years from the penalty year." />
              </div>
              <div style={{ marginTop: 18, padding: "14px 16px", background: `${C.primary}06`, border: `1px solid ${C.primary}12`, borderRadius: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, marginBottom: 8 }}>3-Year Lookback (from penalty year 2024)</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {r.penalty.lookbackYears.map(y => (<div key={y.year} style={{ flex: 1, textAlign: "center", padding: "8px 0", background: C.surface, borderRadius: 8, border: `1px solid ${C.border}` }}><div style={{ fontFamily: font.mono, fontSize: 14, fontWeight: 700, color: C.primary }}>{y.year}</div><div style={{ fontSize: 10, color: C.success, fontWeight: 700, marginTop: 2 }}>Must be clean</div></div>))}
                  <div style={{ flex: 1, textAlign: "center", padding: "8px 0", background: `${C.accent}08`, borderRadius: 8, border: `1px solid ${C.accent}20` }}><div style={{ fontFamily: font.mono, fontSize: 14, fontWeight: 700, color: C.accentDark }}>2024</div><div style={{ fontSize: 10, color: C.danger, fontWeight: 700, marginTop: 2 }}>Penalty year</div></div>
                </div>
              </div>
            </motion.div>
          </div>
          <div style={{ height: 1, background: C.border, margin: "44px 0" }} />
        </>)}

        <Sect>Potential Savings</Sect>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ background: `linear-gradient(135deg, ${C.primary}06, ${C.info}06)`, border: `1px solid ${C.primary}15`, borderRadius: 16, padding: "22px 26px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 18, marginBottom: 20 }}>
          <div><div style={{ fontFamily: font.serif, fontSize: 17, color: C.text }}>💡 If You Take Action</div><div style={{ fontSize: 13, color: C.textSec, marginTop: 4 }}>Credits + abatement + deductions</div></div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {hasPenalty && r.penalty && (<div style={{ textAlign: "right" }}><div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 2 }}>FTA Saves</div><div style={{ fontFamily: font.serif, fontSize: 20, color: C.success }}>{fmt(r.penalty.ftaSavings)}</div></div>)}
            <div style={{ textAlign: "right" }}><div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 2 }}>EITC</div><div style={{ fontFamily: font.serif, fontSize: 20, color: r.eitc.eligible ? C.accent : C.muted }}>{r.eitc.eligible ? "+" + fmt(r.eitc.amount) : "N/A"}</div></div>
            <div style={{ textAlign: "right" }}><div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 2 }}>Max Savings</div><div style={{ fontFamily: font.serif, fontSize: 20, color: C.text }}>≈{fmt(maxSave)}</div></div>
          </div>
        </motion.div>

        <Sect>Savings & Credits — Opportunity Map</Sect>
        <div style={{ marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ fontSize: 14, color: C.text, fontWeight: 700 }}>We found {opportunities.length} opportunities in your profile.</div>
          {!hasFullAccess && (
            <div style={{ fontSize: 12, color: C.muted }}>
              Full diagnostic is free. Unlock full prescriptions from <strong style={{ color: C.text }}>$4.99/mo</strong>.
            </div>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 265px), 1fr))", gap: 14 }}>
          {primaryOpportunity && (
            <SCard
              icon={primaryOpportunity.icon}
              name={`${primaryOpportunity.name} (Revealed)`}
              delay={0.05}
              value={primaryOpportunity.value}
              vColor={primaryOpportunity.vColor}
              desc={primaryOpportunity.desc}
              badge={primaryOpportunity.badge}
              bColor={primaryOpportunity.bColor}
            />
          )}
          {lockedOpportunities.map((item, idx) => (
            <SCard
              key={item.id}
              icon={item.icon}
              name={item.name}
              delay={0.08 + idx * 0.03}
              value={item.value}
              vColor={item.vColor}
              desc={item.desc}
              badge={item.badge}
              bColor={item.bColor}
              locked={!hasFullAccess}
              range={item.range}
              onUnlock={() => openPaywall("credits")}
            />
          ))}
          {hasFullAccess && (
            <>
              {hasPenalty && <SCard icon="⚠️" name="FTA Penalty Waiver" delay={0.2} value={r.penalty ? fmt(r.penalty.ftaSavings) + " saved" : "$0"} vColor={C.danger} desc="First-Time Abatement removes your penalty. Clean 3-year history required." badge="One-Time Use" bColor="green" />}
              <SCard icon="🎓" name="Student Loan Interest" delay={0.23} value="Up to $2,500" vColor="#8B5CF6" desc={`Above-the-line deduction. At ${short(income)} you're under the $75K phase-out.`} badge="Above-the-Line" bColor="purple" />
              <SCard icon="💼" name="Self-Employment Deductions" delay={0.26} value="Varies" vColor={C.info} desc="If 1099: home office, phone, software, mileage — all deductible." badge="If Self-Employed" bColor="blue" />
              <SCard icon="📱" name="Saver's Credit" delay={0.29} value={r.savers.eligible ? `${fmtP(r.savers.rate)} credit` : "Over income limit"} vColor={r.savers.eligible ? C.accentDark : C.muted} desc={r.savers.eligible ? `$2K IRA earns extra ${fmt(r.savers.maxCredit)} credit.` : `Above the $36,500 limit.`} badge={r.savers.eligible ? "Non-Refundable" : "Over Limit"} bColor={r.savers.eligible ? "amber" : "gray"} />
            </>
          )}
        </div>

        <div style={{ height: 1, background: C.border, margin: "44px 0" }} />

        <Sect>Your Questions, Answered</Sect>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <QA q="Should I use the FTA waiver to get rid of a penalty?" open={hasPenalty}>
            <p><strong style={{ color: C.success }}>Yes — 100%.</strong> It's IRS-sanctioned with zero downside. $600 back for a 10-minute call.</p>
            <p style={{ marginTop: 10 }}>Call <strong style={{ color: C.primary }}>1-800-829-1040</strong>: <em>"I'd like to request a First-Time Penalty Abatement."</em></p>
            <p style={{ marginTop: 10 }}><strong>Key detail:</strong> The 3-year lookback is from the <em>penalty year</em>, not today. Penalty for 2024? IRS checks 2021–2023.</p>
          </QA>
          <QA q="How do I approach my CPA about their mistake?">
            <p>Be <strong style={{ color: C.text }}>direct, factual, calm:</strong></p>
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.primary}`, borderRadius: 8, padding: "14px 16px", margin: "12px 0", fontStyle: "italic", color: C.text }}>
              "Hey [name], the late filing generated a penalty. Since the delay was on the filing side, please call the IRS and request the FTA on my behalf. Can you handle that this week?"
            </div>
            <p style={{ marginTop: 8 }}>If they refuse — time for a new CPA.</p>
          </QA>
          <QA q="What are the signs of a good CPA?">
            <p><strong style={{ color: C.success }}>Green flags:</strong> Proactive before deadlines, plain-English explanations, mentions credits unprompted, owns mistakes.</p>
            <p style={{ marginTop: 8 }}><strong style={{ color: C.danger }}>Red flags:</strong> Only contacts you at tax time, won't fix their errors, never mentioned EITC/IRA.</p>
            <p style={{ marginTop: 8 }}><strong>Find one:</strong> CPAverify.org, NATP.org. Expect $200–$400.</p>
          </QA>
          <QA q="Do these estimates include every possible tax detail?">
            <p>The model includes federal and California brackets, standard deductions, and common credits for educational planning.</p>
            <p style={{ marginTop: 8 }}>It may not include every local tax, phase-out edge case, or one-off item from your return. Use this to prepare better questions for your CPA, then confirm final filing numbers with them.</p>
          </QA>
          <QA q="What should I do if my income changes mid-year?">
            <p>Re-run your scenario each time income shifts (raise, bonus, freelance project) and compare your new effective rate + take-home.</p>
            <p style={{ marginTop: 8 }}>If estimated tax owed jumps, set aside part of each paycheck/invoice immediately to avoid end-of-year surprises.</p>
          </QA>
        </div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ marginTop: 44, padding: 26, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, boxShadow: shadow.card }}>
          <div style={{ fontFamily: font.serif, fontSize: 18, color: C.text, marginBottom: 20 }}>⚡ Your Next {actionItems.length} Actions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {actionItems.map((a, i) => (
              <div key={a.id} style={{ display: "flex", gap: 14, alignItems: "flex-start", fontSize: 14, color: C.textSec, lineHeight: 1.65, opacity: actions[a.id] ? 0.5 : 1, transition: "opacity 0.2s" }}>
                <button onClick={() => toggleAction(a.id)} aria-label={`Mark action ${i + 1} complete`} style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, marginTop: 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", background: actions[a.id] ? C.primary : `${C.primary}08`, border: `2px solid ${actions[a.id] ? C.primary : C.primary + "30"}` }}>
                  {actions[a.id] ? <Check size={13} color="#fff" /> : <span style={{ fontFamily: font.mono, fontSize: 11, fontWeight: 700, color: C.primary }}>{i + 1}</span>}
                </button>
                <span style={{ textDecoration: actions[a.id] ? "line-through" : "none" }}>{a.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div style={{ marginTop: 40, padding: "14px 18px", background: `${C.primary}04`, border: `1px solid ${C.primary}10`, borderRadius: 12, fontSize: 11, color: C.muted, lineHeight: 1.7 }}>
          <strong style={{ color: C.textSec }}>Disclaimer:</strong> {DISCLAIMER}
        </div>
        {!userId && checkoutSessionId && (
          <div style={{ marginTop: 14, padding: "12px 14px", background: `${C.warning}10`, border: `1px solid ${C.warning}30`, borderRadius: 12, fontSize: 13, color: C.textSec }}>
            Payment detected. To protect your purchase across devices, create or log in to your account from the top-right <strong style={{ color: C.text }}>Log In / Sign Up</strong> button.
          </div>
        )}
        {checkoutNotice && (
          <div style={{ marginTop: 12, fontSize: 13, color: checkoutNotice.toLowerCase().includes("could not") ? C.danger : C.success }}>
            {checkoutNotice}
          </div>
        )}
      </div>

      <AnimatePresence>
        {paywallOpen && !hasFullAccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(10,18,28,0.55)", backdropFilter: "blur(4px)", zIndex: 1100, display: "grid", placeItems: "center", padding: 14 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              style={{ width: "min(860px, 100%)", background: "#fff", borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: shadow.md, padding: "22px 22px 18px" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: "0.08em" }}>Full X-Ray Unlocked</div>
                  <h3 style={{ margin: "6px 0 0", fontFamily: font.serif, fontSize: 30, color: C.text }}>Unlock your full tax prescription</h3>
                </div>
                <button onClick={() => setPaywallOpen(false)} style={{ border: "none", background: C.bg, width: 36, height: 36, borderRadius: 10, cursor: "pointer" }}>
                  <X size={18} color={C.textSec} />
                </button>
              </div>
              <p style={{ margin: "8px 0 16px", fontSize: 14, color: C.textSec, lineHeight: 1.65 }}>
                {paywallReason === "income" && "You crossed into advanced planning territory. Your diagnostic stays free; detailed recommendations are part of Full Access."}
                {paywallReason === "credits" && "We found additional opportunities in your profile. Unlock card-level guidance and exact math behind each one."}
                {paywallReason === "export" && "Exporting your CPA pack is included in Full Access and Pro + AI."}
                {paywallReason === "ai" && "Your AI answer is personalized to this scenario. Unlock Full Access, then upgrade to Pro + AI for unlimited sessions."}
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 12 }}>
                <button onClick={() => setSelectedPlan("full")} style={{ textAlign: "left", borderRadius: 14, border: `2px solid ${selectedPlan === "full" ? C.primary : C.border}`, background: selectedPlan === "full" ? `${C.primary}08` : "#fff", padding: 14, cursor: "pointer" }}>
                  <div style={{ fontSize: 12, color: C.muted, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Full Access</div>
                  <div style={{ fontFamily: font.serif, color: C.text, fontSize: 28, margin: "2px 0" }}>$4.99<span style={{ fontSize: 15, color: C.muted }}>/mo</span></div>
                  <div style={{ fontSize: 12, color: C.textSec }}>Full opportunity cards, exports, and complete recommendation details.</div>
                </button>
                <button onClick={() => setSelectedPlan("pro")} style={{ textAlign: "left", borderRadius: 14, border: `2px solid ${selectedPlan === "pro" ? C.primary : C.border}`, background: selectedPlan === "pro" ? `${C.primary}08` : "#fff", padding: 14, cursor: "pointer" }}>
                  <div style={{ fontSize: 12, color: C.muted, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Pro + AI</div>
                  <div style={{ fontFamily: font.serif, color: C.text, fontSize: 28, margin: "2px 0" }}>$9.99<span style={{ fontSize: 15, color: C.muted }}>/mo</span></div>
                  <div style={{ fontSize: 12, color: C.textSec }}>Everything in Full Access plus unlimited personalized AI sessions.</div>
                </button>
              </div>

              <div style={{ marginTop: 12, fontSize: 12, color: C.muted }}>
                3-month minimum commitment applies. Cancel anytime after the minimum term.
              </div>
              {primaryOpportunity && (
                <div style={{ marginTop: 10, fontSize: 13, color: C.textSec }}>
                  Example from your profile: <strong style={{ color: C.text }}>{primaryOpportunity.name}</strong> shows meaningful savings potential.
                </div>
              )}
              {checkoutNotice && <div style={{ marginTop: 10, fontSize: 12, color: C.danger }}>{checkoutNotice}</div>}

              <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  style={{ border: "none", borderRadius: 12, background: C.primary, color: "#fff", fontSize: 14, fontWeight: 700, padding: "12px 16px", cursor: checkoutLoading ? "wait" : "pointer" }}
                >
                  {checkoutLoading ? "Starting checkout..." : `Unlock ${selectedPlan === "pro" ? "Pro + AI" : "Full Access"}`}
                </button>
                <button onClick={() => setPaywallOpen(false)} style={{ border: `1px solid ${C.border}`, borderRadius: 12, background: "#fff", color: C.textSec, fontSize: 14, fontWeight: 700, padding: "12px 16px", cursor: "pointer" }}>
                  Keep exploring free diagnostic
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button onClick={() => setChatOpen(!chatOpen)} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
        style={{ position: "fixed", bottom: 22, right: 16, width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})`, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 20px ${C.primary}40`, zIndex: 1000 }}
        aria-label={chatOpen ? "Close chat" : "Open tax assistant"}>
        {chatOpen ? <X size={20} color="#fff" /> : <MessageCircle size={20} color="#fff" />}
      </motion.button>
      <AnimatePresence>
        {chatOpen && (
          <Chat
            result={r}
            isOpen={chatOpen}
            onClose={() => setChatOpen(false)}
            teaser={!hasFullAccess || (!hasProAI && !canUseAI)}
            isPro={hasProAI}
            remainingFree={Math.max(0, 2 - aiFreeUses)}
            onUse={() => {
              const next = aiFreeUses + 1;
              setAiFreeUses(next);
              localStorage.setItem("taxed_ai_free_uses", String(next));
            }}
            onUpgrade={() => {
              setSelectedPlan("pro");
              openPaywall("ai");
            }}
          />
        )}
      </AnimatePresence>
      <style>{`
        @media (max-width: 768px) {
          .calculator-page { padding-bottom: 92px !important; }
          .calculator-report { padding: 20px 14px !important; }
        }

        @media (max-width: 480px) {
          .calculator-report { padding: 16px 10px !important; }
        }
      `}</style>
    </div>
  );
}
