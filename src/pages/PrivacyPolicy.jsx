import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { motion, useReducedMotion } from "motion/react";

const C = { primary: "#1f9d8b", bg: "#f5f9ff", surface: "rgba(255,255,255,0.76)", border: "#d8e3f0", text: "#102a43", textSec: "#4f6478", muted: "#6b7f93" };
const font = { serif: "'DM Serif Display', Georgia, serif", sans: "'DM Sans', system-ui, sans-serif" };

function Section({ title, children, reduceMotion }) {
    return (
        <motion.div
            style={{ marginBottom: 40 }}
            initial={reduceMotion ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 12, filter: "blur(5px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-48px" }}
            transition={{ duration: reduceMotion ? 0 : 0.45 }}
        >
            <h2 style={{ fontFamily: font.serif, fontSize: 22, color: C.primary, marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>{title}</h2>
            <div style={{ fontSize: 15, color: C.textSec, lineHeight: 1.85 }}>{children}</div>
        </motion.div>
    );
}

export default function PrivacyPolicy() {
    const reduceMotion = useReducedMotion();
    return (
        <div style={{ fontFamily: font.sans, background: C.bg, paddingBottom: 120 }}>
            <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '64px 24px 48px' }}>
                <motion.div
                    style={{ maxWidth: 760, margin: '0 auto' }}
                    initial={reduceMotion ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 16, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: reduceMotion ? 0 : 0.52 }}
                >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: `${C.primary}10`, borderRadius: 99, color: C.primary, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 20 }}><ShieldCheck size={14} /> Legal</div>
                    <h1 style={{ fontFamily: font.serif, fontSize: 'clamp(32px, 5vw, 48px)', color: C.text, marginBottom: 16 }}>Privacy Policy</h1>
                    <p style={{ fontSize: 15, color: C.muted }}>Effective Date: March 11, 2025 · Last Updated: March 12, 2026</p>
                    <p style={{ fontSize: 15, color: C.textSec, marginTop: 12, lineHeight: 1.7 }}>This Privacy Policy describes how Taxed ("we," "us," or "our") collects, uses, and protects information when you visit and use <strong>taxedhq.com</strong> (the "Service"). This policy is compliant with applicable U.S. federal and state privacy laws, including the California Consumer Privacy Act (CCPA) and the California Privacy Rights Act (CPRA).</p>
                </motion.div>
            </div>
            <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px 0' }}>
                <Section title="1. Who We Are" reduceMotion={reduceMotion}><p>Taxed is an educational tax navigation tool. We are <strong>not</strong> a tax preparation service, accounting firm, or financial advisor. Our Service provides general, educational information and interactive scenario modeling for informational purposes only.</p></Section>
                <Section title="2. Information We Collect" reduceMotion={reduceMotion}>
                    <p><strong>Information You Provide:</strong> Taxed does not require account creation. The only data you input is voluntarily entered within the tax modeling tool (e.g., estimated income, filing status, number of dependents). This information is used solely to render calculations on your screen.</p>
                    <p style={{ marginTop: 12 }}><strong>Automatically Collected Information:</strong> When you visit our site, we may automatically collect: IP address and general geographic location, browser type and version, device type and operating system, pages visited, clickstream data, and session duration, and referral source.</p>
                    <p style={{ marginTop: 12 }}><strong>What We Do NOT Collect:</strong> We do not collect your Social Security number, actual tax return data, bank account information, or any personally identifiable financial records.</p>
                </Section>
                <Section title="3. How We Use Your Information" reduceMotion={reduceMotion}><p>To operate and improve the Service, analyze usage patterns, detect and prevent fraudulent or abusive activity, and comply with legal obligations. We do <strong>not</strong> sell your personal information to third parties.</p></Section>
                <Section title="4. Cookies and Tracking Technologies" reduceMotion={reduceMotion}><p>We may use cookies and similar technologies to enhance your experience, remember preferences, and analyze traffic. You may control cookie behavior through your browser settings. We may use third-party analytics tools that collect anonymized usage data independently under their own privacy policies.</p></Section>
                <Section title="5. AI Assistant" reduceMotion={reduceMotion}><p>Taxed includes an optional AI chat assistant powered by third-party AI APIs. When you use the chat feature, your messages (along with your computed tax scenario context) are transmitted to the third-party API provider for processing. Do not enter personal identifying information (name, SSN, address) into the chat assistant.</p></Section>
                <Section title="6. Data Retention and Storage" reduceMotion={reduceMotion}><p>Taxed does not persistently store the income or tax data you enter into the modeling tool. All calculations happen in your browser session. When you close or reload the page, your inputs are discarded. Automatically collected analytics data may be retained for up to 24 months.</p></Section>
                <Section title="7. Third-Party Links" reduceMotion={reduceMotion}><p>Our Service may contain links to third-party websites (e.g., IRS.gov, CPAverify.org). We are not responsible for the privacy practices or content of those external sites.</p></Section>
                <Section title="8. Your Rights (U.S. Residents)" reduceMotion={reduceMotion}>
                    <p><strong>California Residents (CCPA/CPRA):</strong> You have the right to know what personal information we collect and how it is used, request deletion, opt out of the sale of your personal information (we do not sell data), and non-discrimination for exercising your privacy rights.</p>
                    <p style={{ marginTop: 12 }}>To exercise these rights, contact us at: <strong>privacy@taxedhq.com</strong></p>
                </Section>
                <Section title="9. Children's Privacy" reduceMotion={reduceMotion}><p>Taxed is not directed toward children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided information to us, please contact us at <strong>privacy@taxedhq.com</strong>.</p></Section>
                <Section title="10. Data Security" reduceMotion={reduceMotion}><p>We implement reasonable administrative, technical, and physical safeguards to protect information from unauthorized access, disclosure, or alteration. However, no method of transmission over the internet is 100% secure.</p></Section>
                <Section title="11. Changes to This Policy" reduceMotion={reduceMotion}><p>We may update this Privacy Policy from time to time. We will post the revised policy on this page with an updated effective date. Your continued use of the Service after any changes constitutes your acceptance of the updated policy.</p></Section>
                <Section title="12. Contact Us" reduceMotion={reduceMotion}>
                    <p>If you have any questions or concerns about this Privacy Policy, please contact us at:</p>
                    <div style={{ marginTop: 12, padding: '16px 20px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, fontSize: 14 }}>
                        <strong>Taxed</strong><br />
                        Email: <a href="mailto:privacy@taxedhq.com" style={{ color: C.primary }}>privacy@taxedhq.com</a><br />
                        Website: <a href="https://taxedhq.com" style={{ color: C.primary }}>taxedhq.com</a>
                    </div>
                </Section>
                <div style={{ marginTop: 40, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <Link to="/terms" style={{ color: C.primary, fontSize: 14, fontWeight: 600 }}>View Terms of Service →</Link>
                    <Link to="/" style={{ color: C.textSec, fontSize: 14 }}>← Back to Home</Link>
                </div>
            </div>
        </div>
    );
}
