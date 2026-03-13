import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronDown, Send, MessageCircle, X, Check,
  DollarSign, TrendingDown, FileText, GraduationCap,
  AlertTriangle, ArrowRight, ArrowLeft, Download,
  Phone, Briefcase, Shield, PiggyBank, Heart, CloudUpload,
  ChevronRight, Sparkles, Users, Home, User, ChevronsUpDown
} from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { supabase } from "../lib/supabase";
import { claimEntitlement, getCheckoutStatus, loadEntitlement, startCheckout } from "../lib/billing";
import PersonalizedTaxPlanCard from "../components/PersonalizedTaxPlanCard";
import { buildPersonalizedTaxPlan } from "../lib/personalizedTaxPlan";
import { markFunnelStep, stopFunnelTimer } from "../lib/funnelMetrics";

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

const C = { primary: "#1a3c4d", primaryLight: "#2a6f5f", primaryAccent: "#1f9d8b", teal: "#1f9d8b", gold: "#c9952b", goldLight: "#f5e6c8", accent: "#c9952b", accentDark: "#a67b1d", success: "#1f9d8b", warning: "#c9952b", danger: "#c0392b", info: "#2a6f5f", bg: "#f4f7f4", surface: "#FFFFFF", border: "#e2e0da", text: "#1a2e35", textSec: "#4a6670", muted: "#7a9099", fedPill: "#1a3c4d", caPill: "#2a6f5f", ssPill: "#5a8a7a", medPill: "#c9952b", takePill: "#1f9d8b" };
const font = { sans: "'DM Sans', system-ui, sans-serif" };
const shadow = { sm: "0 2px 8px rgba(26,26,46,0.06)", md: "0 12px 32px rgba(26,26,46,0.1)", card: "0 4px 16px rgba(26,26,46,0.07)" };

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
function Sect({ children, icon }) {
  return (<div style={{ display: "flex", alignItems: "center", gap: 10, margin: "48px 0 20px" }}>{icon && <span style={{ fontSize: 22 }}>{icon}</span>}<span style={{ fontFamily: font.sans, fontSize: 20, fontWeight: 800, color: C.text }}>{children}</span></div>);
}

function KPI({ label, value, color, desc, icon: Icon, delay = 0, children, onClick }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }} onClick={onClick}
      style={{ background: C.surface, borderRadius: 24, padding: "32px 28px", border: `2px solid ${C.border}`, boxShadow: shadow.card, position: "relative", overflow: "hidden", cursor: onClick ? "pointer" : "default" }}
      whileHover={onClick ? { y: -2, boxShadow: shadow.md } : undefined}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        {Icon && <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color || C.primary}14`, display: "grid", placeItems: "center" }}><Icon size={20} color={color || C.primary} /></div>}
        <span style={{ fontSize: 14, fontWeight: 700, color: C.muted }}>{label}</span>
      </div>
      <div style={{ fontFamily: font.sans, fontWeight: 800, fontSize: 42, color: color || C.primary, lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>{value}</div>
      {desc && <div style={{ marginTop: 12, fontSize: 15, color: C.textSec, lineHeight: 1.55 }}>{desc}</div>}
      {children}
    </motion.div>
  );
}

function Bar({ label, amount, amtColor, pct, color, delay = 0 }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
          <span style={{ color: C.text, fontSize: 15, fontWeight: 600 }}>{label}</span>
        </div>
        <span style={{ fontFamily: font.sans, fontWeight: 800, color: amtColor || C.primary, whiteSpace: "nowrap", fontSize: 15, fontVariantNumeric: "tabular-nums" }}>{amount}</span>
      </div>
      <div style={{ height: 18, background: C.border, borderRadius: 99, overflow: "hidden" }}>
        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ type: "spring", stiffness: 80, damping: 20, delay }}
          style={{ height: "100%", width: `${Math.min(100, Math.max(0.4, pct))}%`, background: color, borderRadius: 99, transformOrigin: "left" }} />
      </div>
    </div>
  );
}

function Brackets({ title, brackets, color, total, income }) {
  if (!brackets.length) return (<div style={{ padding: "12px 0" }}><div style={{ fontSize: 14, fontWeight: 700, color: C.muted, marginBottom: 8 }}>{title}</div><div style={{ fontSize: 15, color: C.success, fontWeight: 700 }}>Income below standard deduction — $0 tax ✓</div></div>);
  return (
    <div style={{ padding: "12px 0" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.muted, marginBottom: 12 }}>{title}</div>
      {brackets.map((b, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: i < brackets.length - 1 ? `1px solid ${C.border}` : "none" }}>
          <span style={{ fontSize: 13, fontWeight: 800, padding: "3px 10px", borderRadius: 99, background: `${color}14`, color, whiteSpace: "nowrap" }}>{fmtP(b.rate)}</span>
          <span style={{ flex: 1, fontSize: 14, color: C.textSec }}>{fmt(b.rangeStart + (i > 0 ? 1 : 0))} – {b.rangeEnd === Infinity ? "∞" : fmt(b.rangeEnd)}</span>
          <span style={{ fontFamily: font.sans, fontSize: 14, fontWeight: 700, color: C.text, fontVariantNumeric: "tabular-nums" }}>{fmt(b.taxOnBracket)}</span>
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, marginTop: 8, borderTop: `2px solid ${color}18` }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Subtotal</span>
        <span style={{ fontFamily: font.sans, fontSize: 18, fontWeight: 800, color }}>{fmt(total)} <span style={{ fontSize: 13, color: C.muted, fontWeight: 600, marginLeft: 4 }}>({fmtP(income > 0 ? total / income : 0)} eff.)</span></span>
      </div>
    </div>
  );
}

function SCard({ icon, name, value, vColor, desc, badge, bColor, delay = 0, locked = false, range = "", onUnlock }) {
  const bs = { green: { bg: `${C.success}14`, c: C.success }, amber: { bg: `${C.warning}14`, c: C.accentDark }, blue: { bg: `${C.info}14`, c: C.info }, red: { bg: `${C.danger}14`, c: C.danger }, gray: { bg: `${C.muted}14`, c: C.muted }, purple: { bg: "#6C5CE714", c: "#6C5CE7" } }[bColor] || { bg: `${C.success}14`, c: C.success };
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ background: C.surface, border: `2px solid ${C.border}`, borderRadius: 24, padding: "28px 24px", boxShadow: shadow.sm, transition: "transform 0.2s, box-shadow 0.2s" }}
      whileHover={{ y: -3, boxShadow: shadow.md }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: `${vColor || C.primary}14`, display: "grid", placeItems: "center", marginBottom: 14, fontSize: 24 }}>{icon}</div>
      <div style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 4 }}>{name}</div>
      <div style={{ fontFamily: font.sans, fontSize: 16, fontWeight: 700, color: vColor || C.primary, marginBottom: 10, fontVariantNumeric: "tabular-nums" }}>
        {locked ? (range || "Estimated opportunity") : value}
      </div>
      <div style={{ fontSize: 15, color: C.textSec, lineHeight: 1.65, marginBottom: 14, opacity: locked ? 0.45 : 1, transition: "opacity 0.2s" }}>
        {desc}
      </div>
      {badge && <span style={{ display: "inline-block", fontSize: 13, fontWeight: 800, padding: "6px 14px", borderRadius: 99, background: bs.bg, color: bs.c }}>{badge}</span>}
      {locked && (
        <button onClick={onUnlock} style={{ marginTop: 14, width: "100%", border: "none", borderRadius: 16, background: C.secondary, color: "#fff", padding: "14px 16px", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
          See what you could save
        </button>
      )}
    </motion.div>
  );
}

function FStep({ n, title, desc }) {
  return (<div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}><div style={{ width: 36, height: 36, borderRadius: "50%", background: `${C.primary}14`, color: C.primary, fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{n}</div><div><div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 3 }}>{title}</div><div style={{ fontSize: 15, color: C.textSec, lineHeight: 1.6 }}>{desc}</div></div></div>);
}

function QA({ q, children, open: defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = `qa-panel-${q.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div style={{ background: C.surface, border: `2px solid ${C.border}`, borderRadius: 22, overflow: "hidden", boxShadow: shadow.sm }}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={panelId}
        style={{ width: "100%", padding: "22px 24px", minHeight: 56, fontSize: 17, fontWeight: 700, color: C.text, background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, textAlign: "left", fontFamily: font.sans }}
      >
        {q}<motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}><ChevronDown size={20} color={C.primary} /></motion.div>
      </button>
      <AnimatePresence>
        {open && (<motion.div id={panelId} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 200, damping: 24 }} style={{ overflow: "hidden" }}><div style={{ padding: "0 24px 24px", borderTop: `1px solid ${C.border}`, paddingTop: 18, fontSize: 15, color: C.textSec, lineHeight: 1.75 }}>{children}</div></motion.div>)}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ONBOARDING FLOW — Full-screen immersive
   ═══════════════════════════════════════════ */
function CustomSelect({ value, onChange, options, label }) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find(o => o.val === value)?.label || value;
  
  return (
    <div style={{ position: "relative" }}>
      <button 
        type="button"
        onClick={() => setOpen(!open)}
        style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 16, fontFamily: font.sans, color: C.text, background: C.surface, outline: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <span>{selectedLabel}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown size={18} color={C.muted} /></motion.div>
      </button>
      
      <AnimatePresence>
        {open && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 90 }} onClick={() => setOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.98 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: -10, scale: 0.98 }} 
              transition={{ duration: 0.15, ease: "easeOut" }}
              style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, boxShadow: shadow.md, zIndex: 100, maxHeight: 240, overflowY: "auto", padding: "6px 0" }}
            >
              {options.map(o => (
                <button
                  key={o.val}
                  type="button"
                  onClick={() => { onChange(o.val); setOpen(false); }}
                  style={{ width: "100%", padding: "12px 16px", background: value === o.val ? `${C.primary}08` : "transparent", border: "none", textAlign: "left", fontSize: 15, color: value === o.val ? C.primary : C.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                  onMouseOver={e => { if (value !== o.val) e.currentTarget.style.background = `${C.muted}08`; }}
                  onMouseOut={e => { if (value !== o.val) e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{ fontWeight: value === o.val ? 600 : 400 }}>{o.label}</span>
                  {value === o.val && <Check size={16} color={C.primary} />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

const OB_BG = [
  "#FAFAFA",
  "#FAFAFA",
  "#FAFAFA",
];

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
  const quickPreview = useMemo(
    () => fullCalc(income, status, deps, hasPenalty, 5, true, stateCode),
    [income, status, deps, hasPenalty, stateCode]
  );

  const stepMeta = [
    { h: "How much do you make?", p: "Drag to set your gross annual income." },
    { h: "How do you file?", p: "Pick your filing status and dependents." },
    { h: "Anything else?", p: "Toggle what applies — we'll tailor your report." },
  ];

  const next = () => step < 2 ? setStep(step + 1) : onDone({ income, status, deps, incomeType, stateCode, hasPenalty, hasStudentLoans, hasRetirement, hasHDHP });

  return (
    <div style={{ minHeight: "100vh", background: OB_BG[step], fontFamily: font.sans, display: "flex", flexDirection: "column", transition: "background 0.5s ease" }}>
      {/* Progress */}
      <div style={{ padding: "20px 24px 0", maxWidth: 640, width: "100%", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          {step > 0 && <button onClick={() => setStep(step - 1)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}><ArrowLeft size={22} color={C.text} /></button>}
          <span style={{ fontWeight: 800, fontSize: 18, color: C.text }}>{BRAND.name}</span>
          <span style={{ marginLeft: "auto", fontSize: 14, fontWeight: 700, color: C.muted }}>{step + 1} of 3</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ flex: 1, height: 6, borderRadius: 99, background: i <= step ? C.primary : C.border, transition: "background 0.3s" }} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 24px 24px", maxWidth: 640, width: "100%", margin: "0 auto" }}>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25, ease: "easeInOut" }}>
            <h1 style={{ fontSize: "clamp(24px, 6vw, 36px)", fontWeight: 700, color: C.text, lineHeight: 1.15, marginBottom: 8 }}>{stepMeta[step].h}</h1>
            <p style={{ fontSize: 16, color: C.textSec, lineHeight: 1.55, marginBottom: 40 }}>{stepMeta[step].p}</p>

            {step === 0 && (
              <>
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                  <motion.span key={income} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} style={{ display: "inline-block", fontFamily: font.sans, fontWeight: 700, fontSize: "clamp(36px, 10vw, 56px)", color: C.primary, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>{fmt(income)}</motion.span>
                  <div style={{ fontSize: 15, color: C.muted, marginTop: 4, fontWeight: 500 }}>per year</div>
                </div>
                <div style={{ position: "relative", height: 8, background: C.border, borderRadius: 99, marginBottom: 14 }}>
                  <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${((income - 15000) / (500000 - 15000)) * 100}%`, background: C.primary, borderRadius: 99, transition: "width 0.02s" }} />
                  <input type="range" min={15000} max={500000} step={500} value={income} onChange={e => setIncome(+e.target.value)} aria-label="Gross annual income"
                    style={{ position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)", width: "100%", height: 40, WebkitAppearance: "none", appearance: "none", background: "transparent", outline: "none", cursor: "pointer", margin: 0 }} className="minimal-slider" />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.muted, fontWeight: 500 }}><span>$15K</span><span>$250K</span><span>$500K</span></div>
                <div style={{ marginTop: 16, background: `${C.primary}08`, border: `1px solid ${C.border}`, borderRadius: 14, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                    Instant Preview
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 11, color: C.muted }}>Take-home</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{fmt(quickPreview.combined.takeHome)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: C.muted }}>Effective rate</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{pct(quickPreview.combined.effectiveRate)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: C.muted }}>Total tax</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{fmt(quickPreview.combined.totalTax)}</div>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 32 }}>
                  {["w2", "1099", "mixed"].map(t => (
                    <button key={t} onClick={() => setIncomeType(t)} style={{ flex: 1, padding: "14px 0", borderRadius: 12, border: `1px solid ${incomeType === t ? C.primary : C.border}`, background: incomeType === t ? `${C.primary}08` : C.surface, cursor: "pointer", fontSize: 15, fontWeight: 600, fontFamily: font.sans, color: incomeType === t ? C.primary : C.textSec, transition: "all 0.15s" }}>
                      {t === "w2" ? "W-2" : t === "1099" ? "1099" : "Both"}
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: 28 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.textSec, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>State</div>
                  <CustomSelect value={stateCode} onChange={setStateCode} options={STATES} />
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 12 }}>
                  {FILING.map(f => {
                    const Icon = f.icon; const sel = status === f.value; return (
                      <button key={f.value} onClick={() => setStatus(f.value)} style={{ padding: "18px 16px", borderRadius: 16, border: `1px solid ${sel ? C.primary : C.border}`, background: sel ? `${C.primary}08` : C.surface, cursor: "pointer", textAlign: "left", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: sel ? `${C.primary}12` : `${C.muted}10`, display: "grid", placeItems: "center", flexShrink: 0 }}>
                          <Icon size={20} color={sel ? C.primary : C.muted} />
                        </div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{f.label}</div>
                          <div style={{ fontSize: 13, color: C.textSec, marginTop: 2 }}>{f.sub}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div style={{ marginTop: 28, display: "flex", alignItems: "center", justifyContent: "space-between", background: C.surface, borderRadius: 16, padding: "16px 20px", border: `1px solid ${C.border}` }}>
                  <div><div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>Dependents</div><div style={{ fontSize: 13, color: C.textSec }}>Children or qualifying relatives</div></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <button onClick={() => setDeps(Math.max(0, deps - 1))} style={{ width: 40, height: 40, borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, cursor: "pointer", fontSize: 20, fontWeight: 500, color: C.textSec, fontFamily: font.sans, display: "grid", placeItems: "center", transition: "background 0.15s" }} onMouseOver={e => e.currentTarget.style.background = `${C.muted}10`} onMouseOut={e => e.currentTarget.style.background = C.surface}>−</button>
                    <span style={{ fontFamily: font.sans, fontSize: 24, fontWeight: 600, color: C.text, minWidth: 28, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{deps}</span>
                    <button onClick={() => setDeps(Math.min(10, deps + 1))} style={{ width: 40, height: 40, borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, cursor: "pointer", fontSize: 20, fontWeight: 500, color: C.textSec, fontFamily: font.sans, display: "grid", placeItems: "center", transition: "background 0.15s" }} onMouseOver={e => e.currentTarget.style.background = `${C.muted}10`} onMouseOut={e => e.currentTarget.style.background = C.surface}>+</button>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <div style={{ display: "grid", gap: 12 }}>
                {[
                  { label: "Late filing penalty", sub: "We'll show how to potentially eliminate it", state: hasPenalty, set: setHasPenalty },
                  { label: "Student loans", sub: "Up to $2,500 interest may be deductible", state: hasStudentLoans, set: setHasStudentLoans },
                  { label: "Retirement account (401k/IRA)", sub: "Contributions may reduce taxable income", state: hasRetirement, set: setHasRetirement },
                  { label: "High-deductible health plan", sub: "You may qualify for HSA tax savings", state: hasHDHP, set: setHasHDHP },
                ].map((item, i) => (
                  <label key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderRadius: 16, border: `1px solid ${C.border}`, background: C.surface, cursor: "pointer", transition: "all 0.15s" }}>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{item.label}</div><div style={{ fontSize: 13, color: C.textSec, marginTop: 2 }}>{item.sub}</div></div>
                    <div style={{ width: 44, height: 24, borderRadius: 99, background: item.state ? C.primary : C.border, position: "relative", flexShrink: 0, transition: "background 0.2s ease-in-out", cursor: "pointer" }}>
                      <motion.div animate={{ x: item.state ? 22 : 2 }} transition={{ type: "tween", duration: 0.2, ease: "easeInOut" }} style={{ position: "absolute", top: 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: shadow.sm }} />
                    </div>
                    <input type="checkbox" checked={item.state} onChange={e => item.set(e.target.checked)} style={{ display: "none" }} />
                  </label>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom CTA */}
      <div style={{ padding: "16px 24px 28px", maxWidth: 640, width: "100%", margin: "0 auto" }}>
        <button onClick={next}
          style={{ width: "100%", padding: "16px 24px", borderRadius: 14, border: "none", background: C.primary, color: "#fff", cursor: "pointer", fontSize: 16, fontWeight: 600, fontFamily: font.sans, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "opacity 0.15s" }}
          onMouseOver={e => e.currentTarget.style.opacity = 0.9} onMouseOut={e => e.currentTarget.style.opacity = 1}>
          {step < 2 ? <>Continue <ArrowRight size={18} /></> : <>Show me my breakdown <Sparkles size={18} /></>}
        </button>
        <p style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{DISCLAIMER}</p>
      </div>
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
  const [incomeType, setIncomeType] = useState("w2");
  const [hasPenalty, setHasPenalty] = useState(false);
  const [hasStudentLoans, setHasStudentLoans] = useState(false);
  const [hasRetirement, setHasRetirement] = useState(false);
  const [hasHDHP, setHasHDHP] = useState(false);
  const [bracketOpen, setBracketOpen] = useState(false);
  const [actions, setActions] = useState({});
  const [cloudLoading, setCloudLoading] = useState(false);
  const [cloudMessage, setCloudMessage] = useState("");
  const [entitlement, setEntitlement] = useState({ full_access: false, pro_ai: false, status: "inactive" });
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallReason, setPaywallReason] = useState("unlock");
  const [selectedPlan, setSelectedPlan] = useState("full");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutNotice, setCheckoutNotice] = useState("");
  const [checkoutSessionId, setCheckoutSessionId] = useState(() => localStorage.getItem("taxed_checkout_session_id") || "");
  const [incomeWallShown, setIncomeWallShown] = useState(false);
  const reportRef = useRef(null);
  const hasTrackedFirstReport = useRef(false);
  const userId = session?.user?.id;

  const r = useMemo(() => fullCalc(income, status, deps, hasPenalty, 5, true, stateCode), [income, status, deps, hasPenalty, stateCode]);
  const onBoard = (d) => {
    setIncome(d.income);
    setStatus(d.status);
    setDeps(d.deps);
    setStateCode(d.stateCode);
    setIncomeType(d.incomeType || "w2");
    setHasPenalty(Boolean(d.hasPenalty));
    setHasStudentLoans(Boolean(d.hasStudentLoans));
    setHasRetirement(Boolean(d.hasRetirement));
    setHasHDHP(Boolean(d.hasHDHP));
    markFunnelStep("onboarding_completed", { stepCount: 3 });
    setBoarded(true);
  };
  const hasFullAccess = Boolean(entitlement?.full_access);

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
        setIncomeType(p.incomeType || "w2");
        setHasPenalty(Boolean(p.hasPenalty));
        setHasStudentLoans(Boolean(p.hasStudentLoans));
        setHasRetirement(Boolean(p.hasRetirement));
        setHasHDHP(Boolean(p.hasHDHP));
        setBoarded(true);
        setCloudMessage("Loaded your last saved scenario.");
      }
    };

    loadLatestScenario();
  }, [userId, boarded]);

  useEffect(() => {
    if (!boarded || hasTrackedFirstReport.current) return;
    hasTrackedFirstReport.current = true;
    markFunnelStep("first_report_view");
    stopFunnelTimer("landing_to_report", "time_to_first_report_view");
  }, [boarded]);

  useEffect(() => {
    const syncEntitlement = async () => {
      try {
        if (!userId) {
          setEntitlement({ full_access: false, pro_ai: false, status: "inactive" });
          return;
        }
        const data = await loadEntitlement(userId);
        if (data) setEntitlement(data);
      } catch { /* ignore */ }
    };
    syncEntitlement();
  }, [userId]);

  useEffect(() => {
    try {
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
    } catch { /* ignore */ }
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
      } catch { /* ignore */ }
    };
    claim();
  }, [userId, checkoutSessionId]);

  const iraSave = Math.round(5000 * r.fed.marginalRate);
  const hsaSave = Math.round(4150 * r.fed.marginalRate);
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
  const personalizedPlan = useMemo(
    () =>
      buildPersonalizedTaxPlan({
        report: r,
        opportunities,
        incomeType,
        hasPenalty,
        hasStudentLoans,
        hasRetirement,
        hasHDHP,
        filingStatusLabel: FILING.find((f) => f.value === status)?.label || status,
        stateLabel: STATES.find((s) => s.val === stateCode)?.label || stateCode,
      }),
    [
      r,
      opportunities,
      incomeType,
      hasPenalty,
      hasStudentLoans,
      hasRetirement,
      hasHDHP,
      status,
      stateCode,
    ]
  );

  if (!boarded) return <Onboarding onDone={onBoard} />;

  const sldPct = ((income - 15000) / (500000 - 15000)) * 100;
  const statusLabel = FILING.find(f => f.value === status)?.label || status;
  const stateLabel = STATES.find(s => s.val === stateCode)?.label || stateCode;
  const maxSave = (hasPenalty && r.penalty ? r.penalty.ftaSavings : 0) + r.eitc.amount + iraSave;
  const toggleAction = (id) => setActions(p => ({ ...p, [id]: !p[id] }));

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

  const exportPersonalizedPlan = () => {
    if (!hasFullAccess) {
      openPaywall("plan");
      return;
    }

    const doc = new jsPDF("p", "pt", "letter");
    const margin = 50;
    let y = margin;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Taxed Personalized Tax Plan", margin, y);
    y += 24;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Generated for ${fmt(income)} income • ${statusLabel} • ${stateLabel}`, margin, y);
    y += 20;
    doc.text(`Estimated total impact: ${personalizedPlan.estimatedTotalImpact}`, margin, y);
    y += 20;

    personalizedPlan.phases.forEach((phase) => {
      if (y > 700) {
        doc.addPage();
        y = margin;
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(`${phase.title} (${phase.deadlineLabel})`, margin, y);
      y += 16;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Estimated impact: ${phase.estimatedImpact}`, margin, y);
      y += 14;
      phase.steps.forEach((step) => {
        const lines = doc.splitTextToSize(`• ${step}`, 510);
        doc.text(lines, margin, y);
        y += lines.length * 13;
      });
      doc.text(`Why: ${phase.why}`, margin, y);
      y += 14;
      doc.text(`Confidence: ${phase.confidenceNote}`, margin, y);
      y += 18;
    });

    doc.setFontSize(9);
    doc.text("Educational planning tool only. Confirm filing decisions with your CPA.", margin, 760);
    doc.save("Taxed_Personalized_Tax_Plan.pdf");
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
      incomeType,
      hasPenalty,
      hasStudentLoans,
      hasRetirement,
      hasHDHP,
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

  const handleDashboardIncomeChange = (nextIncome) => {
    if (!hasFullAccess && nextIncome > 50000) {
      setIncome(50000);
      if (!incomeWallShown) {
        setIncomeWallShown(true);
        openPaywall("income");
      }
      return;
    }
    setIncome(nextIncome);
  };

  const handleCheckout = async () => {
    try {
      setCheckoutLoading(true);
      setCheckoutNotice("");
      markFunnelStep("checkout_started", { plan: selectedPlan === "monthly" ? "monthly" : "founders" });
      await startCheckout({
        plan: selectedPlan === "monthly" ? "pro" : "full",
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

  const dynamicQAs = (() => {
    const faqs = [];

    if (hasPenalty) {
      faqs.push({
        id: "fta",
        q: "Should I use the FTA waiver to get rid of a penalty?",
        open: true,
        content: (
          <>
            <p><strong style={{ color: C.success }}>Yes — usually it is worth requesting.</strong> FTA is an IRS path that can remove a first-time penalty if eligibility rules are met.</p>
            <p style={{ marginTop: 10 }}>Call <strong style={{ color: C.primary }}>1-800-829-1040</strong>: <em>"I'd like to request a First-Time Penalty Abatement."</em></p>
            <p style={{ marginTop: 10 }}><strong>Key detail:</strong> The 3-year lookback is from the <em>penalty year</em>, not today. Penalty for 2024? IRS checks 2021–2023.</p>
          </>
        ),
      });
      faqs.push({
        id: "cpa",
        q: "How do I approach my CPA about a late-filing issue?",
        content: (
          <>
            <p>Be <strong style={{ color: C.text }}>direct, factual, and calm</strong>, and ask for a concrete next step + timeline.</p>
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.primary}`, borderRadius: 8, padding: "14px 16px", margin: "12px 0", fontStyle: "italic", color: C.text }}>
              "I noticed a late-filing penalty on my return. Can you request First-Time Penalty Abatement with the IRS this week and send me confirmation?"
            </div>
          </>
        ),
      });
    }

    if (incomeType === "1099" || incomeType === "mixed") {
      faqs.push({
        id: "estimated-tax",
        q: "I have 1099 income. Should I make quarterly estimated payments?",
        content: (
          <>
            <p>Usually yes. With self-employment income, waiting until April can create a larger bill and potential underpayment penalties.</p>
            <p style={{ marginTop: 8 }}>Use this estimate as a planning baseline, then set aside a fixed % from each invoice and validate quarterly targets with your CPA.</p>
          </>
        ),
      });
    }

    if (hasStudentLoans) {
      faqs.push({
        id: "student-loans",
        q: "Can my student loan interest lower my taxes?",
        content: (
          <>
            <p>Potentially. Up to <strong style={{ color: C.primary }}>$2,500</strong> of qualifying interest may be deductible depending on income and filing status.</p>
            <p style={{ marginTop: 8 }}>Bring your Form 1098-E to filing time and confirm phase-out limits with your preparer.</p>
          </>
        ),
      });
    }

    if (hasRetirement) {
      faqs.push({
        id: "retirement",
        q: "How do retirement contributions change this estimate?",
        content: (
          <>
            <p>Traditional pre-tax contributions can reduce taxable income, which may lower your effective tax rate and increase take-home over time.</p>
            <p style={{ marginTop: 8 }}>Re-run your numbers after contribution changes to compare impact before and after.</p>
          </>
        ),
      });
    }

    if (hasHDHP) {
      faqs.push({
        id: "hsa",
        q: "I selected an HDHP. How does an HSA help?",
        content: (
          <>
            <p>An HSA can provide triple tax treatment: pre-tax contributions, tax-free growth, and tax-free qualified medical withdrawals.</p>
            <p style={{ marginTop: 8 }}>If you're HSA-eligible, this can be one of the highest-value tax levers in your profile.</p>
          </>
        ),
      });
    }

    if (deps > 0) {
      faqs.push({
        id: "dependents",
        q: "I have dependents. What credits should I ask about?",
        content: (
          <>
            <p>Start with Child Tax Credit and EITC rules. Eligibility depends on dependent type, income, and filing status.</p>
            <p style={{ marginTop: 8 }}>Use your current estimate as a baseline, then confirm dependent-specific credits with your CPA before filing.</p>
          </>
        ),
      });
    }

    faqs.push({
      id: "coverage",
      q: "Do these estimates include every possible tax detail?",
      content: (
        <>
          <p>
            {stateCode === "CA"
              ? "The model includes federal and California brackets, standard deductions, and common credits for educational planning."
              : `The model includes federal bracket logic and directional ${stateLabel} planning assumptions, plus common credits for educational planning.`}
          </p>
          <p style={{ marginTop: 8 }}>It may not include every local tax, phase-out edge case, or one-off item from your return. Use this to prepare better questions for your CPA, then confirm final filing numbers with them.</p>
        </>
      ),
    });

    if (stateCode !== "CA") {
      faqs.push({
        id: "state-limit",
        q: `I selected ${stateLabel}. Is this state estimate exact?`,
        content: (
          <>
            <p>Not yet. This version currently models California state tax in detail, while non-CA selections are best treated as directional planning inputs.</p>
            <p style={{ marginTop: 8 }}>For filing-accurate state numbers outside CA, confirm with a state-specific calculator or your CPA.</p>
          </>
        ),
      });
    }

    faqs.push({
      id: "income-change",
      q: "What should I do if my income changes mid-year?",
      content: (
        <>
          <p>Re-run your scenario each time income shifts (raise, bonus, freelance project) and compare your new effective rate + take-home.</p>
          <p style={{ marginTop: 8 }}>If estimated tax owed jumps, set aside part of each paycheck/invoice immediately to avoid end-of-year surprises.</p>
        </>
      ),
    });

    return faqs;
  })();

  return (
    <div className="calculator-page" style={{ minHeight: "100vh", background: C.bg, fontFamily: font.sans, paddingBottom: 120 }}>
      <div ref={reportRef} className="calculator-report" style={{ maxWidth: 960, margin: "0 auto", padding: "36px 24px", position: "relative", zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
          <div style={{ background: C.primary, borderRadius: 20, padding: "28px 24px", marginBottom: 20, color: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.15)", display: "grid", placeItems: "center" }}><FileText size={16} color="#fff" /></div>
                <span style={{ fontWeight: 800, fontSize: 18 }}>taxedhq</span>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={generatePDF} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer" }}>
                  <Download size={14} /> Export PDF
                </button>
                {userId && (
                  <button onClick={saveScenarioToCloud} disabled={cloudLoading} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, color: "#fff", cursor: cloudLoading ? "wait" : "pointer", opacity: cloudLoading ? 0.7 : 1 }}>
                    <CloudUpload size={14} /> {cloudLoading ? "Saving..." : "Save"}
                  </button>
                )}
              </div>
            </div>
            {cloudMessage && (
              <div style={{ marginBottom: 12, fontSize: 14, fontWeight: 600, color: cloudMessage.startsWith("Save failed") ? "#fca5a5" : "#a7f3d0" }}>
                {cloudMessage}
              </div>
            )}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.15)", padding: "5px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, marginBottom: 14 }}>TAX CLARITY PLATFORM</div>
            <h1 style={{ fontFamily: font.sans, fontWeight: 800, fontSize: "clamp(24px, 5vw, 34px)", color: "#fff", lineHeight: 1.2, marginBottom: 4 }}>Your Tax Breakdown</h1>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15 }}>{fmt(income)} income · {statusLabel} · {stateLabel}</p>
            {stateCode !== "CA" && (
              <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.28)", borderRadius: 10, padding: "8px 10px", fontSize: 12, color: "#ecf6ff", lineHeight: 1.35 }}>
                <AlertTriangle size={13} />
                Non-CA state estimates are directional. For filing-accurate state math, validate with a CPA or state-specific calculator.
              </div>
            )}
          </div>
        </motion.div>

        <Sect icon="📊">Income & Tax at a Glance</Sect>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 18 }}>
          <KPI label="Gross Income" value={fmt(income)} color={C.info} desc="Drag the slider to explore" icon={DollarSign}>
            <div style={{ marginTop: 16, position: "relative" }}>
              <div style={{ position: "relative", height: 12, background: C.border, borderRadius: 99 }}>
                <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${sldPct}%`, background: `linear-gradient(90deg, ${C.info}, ${C.primary})`, borderRadius: 99, transition: "width 0.02s" }} />
                <input type="range" min={15000} max={500000} step={500} value={income} onChange={e => handleDashboardIncomeChange(+e.target.value)} aria-label="Income"
                  style={{ position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)", width: "100%", height: 32, WebkitAppearance: "none", appearance: "none", background: "transparent", outline: "none", cursor: "pointer", margin: 0 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 14, color: C.muted, fontWeight: 600 }}><span>$15K</span><span>$150K</span><span>$500K</span></div>
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
                      <span style={{ fontSize: 13, fontWeight: 800, padding: "4px 10px", borderRadius: 99, background: `${C.info}14`, color: C.info }}>SDI 0.9%</span>
                      <span style={{ flex: 1, color: C.textSec }}>State Disability Insurance</span>
                      <span style={{ fontFamily: font.sans, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{fmt(r.st.sdi)}</span>
                    </div>
                    {r.st.mentalHealthSurcharge > 0 && (<div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, padding: "4px 10px", borderRadius: 99, background: `${C.danger}14`, color: C.danger }}>MHS 1%</span>
                      <span style={{ flex: 1, color: C.textSec }}>Mental Health Surcharge (&gt;$1M)</span>
                      <span style={{ fontFamily: font.sans, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{fmt(r.st.mentalHealthSurcharge)}</span>
                    </div>)}
                    <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, marginTop: 8, borderTop: `2px solid ${C.border}` }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Total Tax Owed</span>
                      <span style={{ fontFamily: font.sans, fontWeight: 800, fontSize: 22, color: C.text }}>{fmt(r.combined.totalTax)}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </KPI>

          <KPI label="Effective Tax Rate" value={"≈" + fmtP(r.combined.effectiveRate)} color={C.primary} desc={`Take-home: ${fmt(r.combined.takeHome)}/yr · ${fmt(r.combined.monthlyTakeHome)}/mo`} icon={TrendingDown} delay={0.1}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
              <span style={{ padding: "6px 12px", borderRadius: 99, background: C.fedPill, color: "#fff", fontSize: 13, fontWeight: 700 }}>Fed {fmtP(r.fed.effectiveRate)}</span>
              <span style={{ padding: "6px 12px", borderRadius: 99, background: C.caPill, color: "#fff", fontSize: 13, fontWeight: 700 }}>CA {fmtP(r.st.effectiveRate)}</span>
              <span style={{ padding: "6px 12px", borderRadius: 99, background: C.ssPill, color: "#fff", fontSize: 13, fontWeight: 700 }}>SS 6.2%</span>
              <span style={{ padding: "6px 12px", borderRadius: 99, background: C.medPill, color: "#fff", fontSize: 13, fontWeight: 700 }}>Med</span>
              <span style={{ padding: "6px 12px", borderRadius: 99, background: C.takePill, color: "#fff", fontSize: 13, fontWeight: 700 }}>Take-home</span>
            </div>
          </KPI>
        </div>

        <Sect icon="💸">Where Your Money Goes</Sect>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          style={{ background: C.surface, border: `2px solid ${C.border}`, borderRadius: 20, padding: "24px 24px", boxShadow: shadow.card }}>
          <Bar label="Gross Income" amount={fmt(income)} pct={100} color={`linear-gradient(90deg, ${C.info}, #8B5CF6)`} delay={0.1} />
          <Bar label="Federal Standard Deduction" amount={"−" + fmt(r.fed.standardDeduction)} amtColor={C.success} pct={income > 0 ? r.fed.standardDeduction / income * 100 : 0} color={C.success} delay={0.15} />
          <Bar label="Federal Taxable Income" amount={fmt(r.fed.taxableIncome)} amtColor={C.accent} pct={income > 0 ? r.fed.taxableIncome / income * 100 : 0} color={`linear-gradient(90deg, ${C.accent}, #F97316)`} delay={0.2} />
          <Bar label="Federal Income Tax" amount={"≈" + fmt(r.fed.totalTax)} amtColor={C.danger} pct={income > 0 ? r.fed.totalTax / income * 100 : 0} color={C.danger} delay={0.25} />
          <Bar label={`${stateCode} Standard Deduction`} amount={"−" + fmt(r.st.standardDeduction)} amtColor={C.success} pct={income > 0 ? r.st.standardDeduction / income * 100 : 0} color={`${C.success}90`} delay={0.3} />
          <Bar label={`${stateCode} State Tax`} amount={"≈" + fmt(r.st.totalTax)} amtColor="#8B5CF6" pct={income > 0 ? r.st.totalTax / income * 100 : 0} color="#8B5CF6" delay={0.35} />
        </motion.div>

        <div style={{ height: 1, background: C.border, margin: "44px 0" }} />

        {hasPenalty && r.penalty && (<>
          <Sect icon="⚠️">Late Filing Penalty & How to Fix It</Sect>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 14 }}>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, boxShadow: shadow.card, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: C.danger, opacity: 0.7 }} />
              <div style={{ fontSize: 14, fontWeight: 800, color: C.muted, marginBottom: 14 }}>The Problem</div>
              <div style={{ background: `${C.danger}06`, border: `1px solid ${C.danger}18`, borderRadius: 12, padding: 18, marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                  <span style={{ background: `${C.danger}12`, color: C.danger, fontSize: 14, fontWeight: 800, padding: "6px 14px", borderRadius: 99 }}>⚠ Late Filing Penalty</span>
                  <span style={{ fontFamily: font.sans, fontWeight: 800, fontSize: 26, color: C.danger }}>{fmt(r.penalty.estimatedPenalty)}</span>
                </div>
                <p style={{ fontSize: 14, color: C.textSec, lineHeight: 1.7, marginBottom: 10 }}>IRS charges 5% of unpaid tax per month (up to 25%). With ≈{fmt(r.combined.totalTax)} owed and ~5 months late, {fmt(r.penalty.estimatedPenalty)} is in range.</p>
                <p style={{ fontSize: 14, color: C.danger, fontWeight: 700 }}>Your CPA filed late — this is on them, not you.</p>
              </div>
              <div style={{ fontSize: 14, color: C.textSec, lineHeight: 1.8 }}>Call IRS: <strong style={{ color: C.primary }}>1-800-829-1040</strong><br />Say: <em>"{r.penalty.irsScript}"</em></div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, boxShadow: shadow.card, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: C.primary, opacity: 0.7 }} />
              <div style={{ fontSize: 14, fontWeight: 800, color: C.muted, marginBottom: 18 }}>First-Time Abatement (FTA)</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <FStep n={1} title="Check Eligibility" desc="No penalties in the 3 tax years before the penalty year. All returns filed. Tax paid or in arrangement." />
                <FStep n={2} title="Call or Write the IRS" desc="Phone is fastest — often approved same call. Use Form 843 by mail if penalty is already paid." />
                <FStep n={3} title={`${fmt(r.penalty.estimatedPenalty)} Penalty Wiped`} desc="Covers failure-to-file and failure-to-pay. One-time use per taxpayer." />
                <FStep n={4} title="Resets After 3 Clean Years" desc="File on time, pay what you owe — eligible again after 3 consecutive clean years from the penalty year." />
              </div>
              <div style={{ marginTop: 18, padding: "14px 16px", background: `${C.primary}06`, border: `1px solid ${C.primary}12`, borderRadius: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, marginBottom: 8 }}>3-Year Lookback (from penalty year 2024)</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {r.penalty.lookbackYears.map(y => (<div key={y.year} style={{ flex: 1, textAlign: "center", padding: "8px 0", background: C.surface, borderRadius: 8, border: `1px solid ${C.border}` }}><div style={{ fontFamily: font.sans, fontSize: 15, fontWeight: 800, color: C.primary, fontVariantNumeric: "tabular-nums" }}>{y.year}</div><div style={{ fontSize: 12, color: C.success, fontWeight: 700, marginTop: 2 }}>Must be clean</div></div>))}
                  <div style={{ flex: 1, textAlign: "center", padding: "8px 0", background: `${C.accent}08`, borderRadius: 8, border: `1px solid ${C.accent}20` }}><div style={{ fontFamily: font.sans, fontSize: 15, fontWeight: 800, color: C.accentDark, fontVariantNumeric: "tabular-nums" }}>2024</div><div style={{ fontSize: 12, color: C.danger, fontWeight: 700, marginTop: 2 }}>Penalty year</div></div>
                </div>
              </div>
            </motion.div>
          </div>
          <div style={{ height: 1, background: C.border, margin: "44px 0" }} />
        </>)}

        <Sect icon="💡">Potential Savings</Sect>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ background: `linear-gradient(135deg, ${C.primary}06, ${C.info}06)`, border: `1px solid ${C.primary}15`, borderRadius: 16, padding: "22px 26px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 18, marginBottom: 20 }}>
          <div><div style={{ fontFamily: font.sans, fontWeight: 800, fontSize: 18, color: C.text }}>💡 If You Take Action</div><div style={{ fontSize: 15, color: C.textSec, marginTop: 4 }}>Credits + abatement + deductions</div></div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {hasPenalty && r.penalty && (<div style={{ textAlign: "right" }}><div style={{ fontSize: 12, color: C.muted, fontWeight: 700, marginBottom: 2 }}>FTA Saves</div><div style={{ fontFamily: font.sans, fontWeight: 800, fontSize: 22, color: C.success }}>{fmt(r.penalty.ftaSavings)}</div></div>)}
            <div style={{ textAlign: "right" }}><div style={{ fontSize: 12, color: C.muted, fontWeight: 700, marginBottom: 2 }}>EITC</div><div style={{ fontFamily: font.sans, fontWeight: 800, fontSize: 22, color: r.eitc.eligible ? C.accent : C.muted }}>{r.eitc.eligible ? "+" + fmt(r.eitc.amount) : "N/A"}</div></div>
            <div style={{ textAlign: "right" }}><div style={{ fontSize: 12, color: C.muted, fontWeight: 700, marginBottom: 2 }}>Max Savings</div><div style={{ fontFamily: font.sans, fontWeight: 800, fontSize: 22, color: C.text }}>≈{fmt(maxSave)}</div></div>
          </div>
        </motion.div>

        <Sect icon="🎯">Savings & Credits — Opportunity Map</Sect>
        <div style={{ marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ fontSize: 14, color: C.text, fontWeight: 700 }}>We found {opportunities.length} opportunities in your profile.</div>
          {!hasFullAccess && (
            <div style={{ fontSize: 12, color: C.muted }}>
              Full diagnostic is free. Join the Founders Club for <strong style={{ color: C.text }}>$19.99</strong> — 3 months included.
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

        <Sect icon="🗂️">Personalized Tax Plan</Sect>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
          <PersonalizedTaxPlanCard
            plan={personalizedPlan}
            colors={C}
            fonts={font}
            shadows={shadow}
            hasFullAccess={hasFullAccess}
            onExportPlan={exportPersonalizedPlan}
            onUnlockPlan={() => openPaywall("plan")}
          />
        </motion.div>

        <div style={{ height: 1, background: C.border, margin: "44px 0" }} />

        <Sect icon="❓">Your Questions, Answered</Sect>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {dynamicQAs.map((item) => (
            <QA key={item.id} q={item.q} open={Boolean(item.open)}>
              {item.content}
            </QA>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ marginTop: 44, padding: 28, background: C.surface, border: `2px solid ${C.border}`, borderRadius: 24, boxShadow: shadow.card }}>
          <div style={{ fontFamily: font.sans, fontWeight: 800, fontSize: 20, color: C.text, marginBottom: 20 }}>⚡ Your Next {actionItems.length} Actions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {actionItems.map((a, i) => (
              <div key={a.id} style={{ display: "flex", gap: 14, alignItems: "flex-start", fontSize: 15, color: C.textSec, lineHeight: 1.65, opacity: actions[a.id] ? 0.45 : 1, transition: "opacity 0.2s" }}>
                <motion.button onClick={() => toggleAction(a.id)} whileTap={{ scale: 0.85 }} aria-label={`Mark action ${i + 1} complete`} style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, marginTop: 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", background: actions[a.id] ? C.primary : `${C.primary}10`, border: `2px solid ${actions[a.id] ? C.primary : C.primary + "30"}` }}>
                  {actions[a.id] ? <Check size={16} color="#fff" /> : <span style={{ fontFamily: font.sans, fontSize: 14, fontWeight: 800, color: C.primary }}>{i + 1}</span>}
                </motion.button>
                <span style={{ textDecoration: actions[a.id] ? "line-through" : "none" }}>{a.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div style={{ marginTop: 40, padding: "16px 20px", background: `${C.primary}06`, border: `2px solid ${C.primary}10`, borderRadius: 16, fontSize: 13, color: C.muted, lineHeight: 1.7 }}>
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
            style={{ position: "fixed", inset: 0, background: "rgba(26,26,46,0.35)", backdropFilter: "blur(8px)", zIndex: 1100, display: "grid", placeItems: "center", padding: 16 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              style={{ width: "min(520px, 100%)", background: C.surface, borderRadius: 28, border: `2px solid ${C.border}`, boxShadow: shadow.md, padding: "32px 28px 28px" }}
            >
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔓</div>
                <h3 style={{ margin: 0, fontFamily: font.sans, fontWeight: 800, fontSize: 26, color: C.text, lineHeight: 1.2 }}>Unlock your full tax picture</h3>
                <p style={{ margin: "10px 0 0", fontSize: 16, color: C.textSec, lineHeight: 1.55 }}>
                  {paywallReason === "income" && "You're in advanced territory. The full prescription is one tap away."}
                  {paywallReason === "credits" && "We found more opportunities in your profile. Unlock the details."}
                  {paywallReason === "export" && "Exporting your CPA pack is included when you upgrade."}
                  {paywallReason === "forms" && "Auto-generating IRS forms and letters is included in Founders Club."}
                  {paywallReason === "plan" && "Exporting your personalized step-by-step tax plan is included in Founders Club."}
                </p>
              </div>

              <div style={{ display: "grid", gap: 12, marginBottom: 20 }}>
                <button onClick={() => setSelectedPlan("full")} style={{ textAlign: "left", borderRadius: 20, border: `3px solid ${selectedPlan === "full" ? C.primary : C.border}`, background: selectedPlan === "full" ? `${C.primary}0C` : C.surface, padding: "20px 20px", cursor: "pointer", transition: "all 0.15s", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, right: 0, background: C.accent, color: "#fff", fontSize: 12, fontWeight: 800, padding: "4px 12px", borderBottomLeftRadius: 12 }}>Limited offer</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: C.text }}>Founders Club</div>
                      <div style={{ fontSize: 14, color: C.textSec, marginTop: 2 }}>$19.99 now for 3 months, then $9.99/mo</div>
                    </div>
                    <div style={{ fontFamily: font.sans, fontWeight: 800, color: C.primary, fontSize: 28, whiteSpace: "nowrap" }}>$19.99<span style={{ fontSize: 13, color: C.muted, fontWeight: 600 }}> then $9.99/mo</span></div>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 13, color: C.accent, fontWeight: 700 }}>First 10,000 members only — offer ends April 15</div>
                </button>
                <button onClick={() => setSelectedPlan("monthly")} style={{ textAlign: "left", borderRadius: 20, border: `3px solid ${selectedPlan === "monthly" ? C.secondary : C.border}`, background: selectedPlan === "monthly" ? `${C.secondary}0C` : C.surface, padding: "18px 20px", cursor: "pointer", transition: "all 0.15s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Monthly</div>
                      <div style={{ fontSize: 14, color: C.textSec, marginTop: 2 }}>Full access, no commitment</div>
                    </div>
                    <div style={{ fontFamily: font.sans, fontWeight: 800, color: C.secondary, fontSize: 24, whiteSpace: "nowrap" }}>$9.99<span style={{ fontSize: 14, color: C.muted, fontWeight: 600 }}>/mo</span></div>
                  </div>
                </button>
              </div>

              {primaryOpportunity && (
                <div style={{ textAlign: "center", marginBottom: 16, fontSize: 15, color: C.textSec }}>
                  Your top opportunity: <strong style={{ color: C.text }}>{primaryOpportunity.name}</strong>
                </div>
              )}
              {checkoutNotice && <div style={{ textAlign: "center", marginBottom: 12, fontSize: 14, color: C.danger }}>{checkoutNotice}</div>}

              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                style={{ width: "100%", border: "none", borderRadius: 18, background: selectedPlan === "monthly" ? C.secondary : C.primary, color: "#fff", fontSize: 18, fontWeight: 800, padding: "18px 24px", cursor: checkoutLoading ? "wait" : "pointer", boxShadow: `0 6px 20px ${selectedPlan === "pro" ? C.secondary : C.primary}40`, transition: "all 0.15s" }}
              >
                {checkoutLoading ? "Starting checkout..." : "Let's go"}
              </button>
              <button onClick={() => setPaywallOpen(false)} style={{ width: "100%", marginTop: 10, border: "none", background: "transparent", color: C.muted, fontSize: 15, fontWeight: 700, padding: "12px", cursor: "pointer" }}>
                Keep exploring for free
              </button>
              <p style={{ textAlign: "center", marginTop: 8, fontSize: 13, color: C.muted }}>Secure checkout via Stripe. Founders: $19.99 now, then $9.99/mo after 3 months. Cancel anytime.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .calculator-page { padding-bottom: 100px !important; }
          .calculator-report { padding: 20px 16px !important; max-width: 100% !important; }
        }
      `}</style>
    </div>
  );
}
