import { Link } from 'react-router-dom';
import { Scale } from 'lucide-react';
import { motion, useReducedMotion } from "motion/react";

const C = { primary: "#1f9d8b", bg: "#f5f9ff", surface: "rgba(255,255,255,0.76)", border: "#d8e3f0", text: "#102a43", textSec: "#4f6478", muted: "#6b7f93", danger: "#dc2626", warning: "#f59e0b" };
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

export default function TermsOfService() {
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
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: `${C.primary}10`, borderRadius: 99, color: C.primary, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 20 }}><Scale size={14} /> Legal</div>
                    <h1 style={{ fontFamily: font.serif, fontSize: 'clamp(32px, 5vw, 48px)', color: C.text, marginBottom: 16 }}>Terms of Service</h1>
                    <p style={{ fontSize: 15, color: C.muted }}>Effective Date: March 11, 2025 · Last Updated: March 12, 2026</p>
                    <p style={{ fontSize: 15, color: C.textSec, marginTop: 12, lineHeight: 1.7 }}>Please read these Terms of Service ("Terms") carefully before using Taxed ("we," "us," "our") at <strong>taxedhq.com</strong> ("Service"). By accessing or using the Service, you agree to be bound by these Terms.</p>
                </motion.div>
            </div>
            <motion.div
                style={{ background: `${C.warning}10`, borderBottom: `1px solid ${C.warning}30`, padding: '20px 24px' }}
                initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: reduceMotion ? 0 : 0.4 }}
            >
                <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
                    <p style={{ fontSize: 14, color: '#92400E', lineHeight: 1.7, margin: 0 }}><strong>Taxed is an educational tool only.</strong> It does not provide tax advice, tax preparation services, accounting services, or legal advice. Nothing on this platform constitutes a professional-client relationship of any kind. Always consult a licensed CPA or tax attorney for advice specific to your situation.</p>
                </div>
            </motion.div>
            <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px 0' }}>
                <Section title="1. Acceptance of Terms" reduceMotion={reduceMotion}><p>By accessing or using Taxed, you represent that you are at least 18 years of age, have the legal capacity to enter into these Terms, and agree to comply with all applicable laws and regulations.</p></Section>
                <Section title="2. Description of Service" reduceMotion={reduceMotion}><p>Taxed provides an interactive, web-based tax scenario modeling and educational platform. The Service allows users to model estimated tax exposure across different income levels, explore available tax credits and deductions (for educational awareness only), understand tax bracket structures for federal and California state taxes, access general educational resources about U.S. tax concepts, and use an AI-powered educational chat assistant. Taxed is <strong>not</strong> a tax filing platform and does not prepare, file, or submit any tax documents on your behalf.</p></Section>
                <Section title="3. Not Tax, Legal, or Financial Advice" reduceMotion={reduceMotion}><p>All content, calculations, and outputs provided by Taxed — including but not limited to estimated tax amounts, credit eligibility indicators, bracket breakdowns, and AI chat responses — are for <strong>educational and informational purposes only</strong>. Nothing on this Service constitutes tax advice under IRS Circular 230, legal advice, financial planning advice, or a professional-client relationship. You should not rely on any information provided by Taxed as a substitute for advice from a qualified tax professional.</p></Section>
                <Section title="4. Accuracy of Information" reduceMotion={reduceMotion}><p>While we strive to keep tax bracket data, credit thresholds, and other calculations up to date, we make <strong>no representations or warranties</strong> as to the completeness, accuracy, timeliness, or fitness for any particular purpose. Tax laws change frequently. Always verify figures with the IRS (irs.gov) or a qualified tax professional.</p></Section>
                <Section title="5. Subscription Plans and Billing" reduceMotion={reduceMotion}><p>Taxed offers two current access options: <strong>Founders Club ($19.99 today for 3 months, then $9.99/month)</strong> and <strong>Monthly ($9.99/month)</strong>. Pricing is shown in USD and taxes may apply.</p><p style={{ marginTop: 10 }}><strong>Billing and Cancellation:</strong> Subscription plans renew monthly and can be cancelled from your billing portal or by contacting <strong>support@taxedhq.com</strong>. Founders Club converts to the stated monthly rate after the initial 3-month term.</p><p style={{ marginTop: 10 }}><strong>Refund Policy:</strong> Charges are generally non-refundable except where required by law. For technical billing issues, contact <strong>support@taxedhq.com</strong>.</p></Section>
                <Section title="6. AI Assistant" reduceMotion={reduceMotion}><p>The AI chat feature within Taxed is powered by third-party AI services. The assistant is designed for educational context only and explicitly does not provide personalized tax advice. You acknowledge that AI responses are for educational exploration only, you will not enter personally identifiable information (SSN, full name, address) into the chat, and responses should always be verified with a licensed tax professional.</p></Section>
                <Section title="7. Intellectual Property" reduceMotion={reduceMotion}><p>All content, design, code, and materials on Taxed — including but not limited to text, graphics, logos, software, and user interface elements — are the property of Taxed and are protected by U.S. copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, create derivative works of, publicly display, or commercially exploit any content without our prior written consent.</p></Section>
                <Section title="8. Prohibited Uses" reduceMotion={reduceMotion}><p>You agree not to use the Service to violate any applicable laws, collect or scrape data through automated means, use the Service for commercial resale without permission, attempt to reverse-engineer any part of the Service, transmit malware, or interfere with the integrity or performance of the Service.</p></Section>
                <Section title="9. Disclaimer of Warranties" reduceMotion={reduceMotion}><p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p></Section>
                <Section title="10. Limitation of Liability" reduceMotion={reduceMotion}><p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, TAXED AND ITS OWNERS, OFFICERS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE. OUR TOTAL CUMULATIVE LIABILITY SHALL NOT EXCEED THE TOTAL AMOUNT YOU PAID TO TAXED IN THE PRIOR 12 MONTHS.</p></Section>
                <Section title="11. Indemnification" reduceMotion={reduceMotion}><p>You agree to indemnify, defend, and hold harmless Taxed and its owners, officers, employees, and agents from and against any claims, liabilities, damages, losses, and expenses arising out of your use of the Service or violation of these Terms.</p></Section>
                <Section title="12. Governing Law" reduceMotion={reduceMotion}><p>These Terms shall be governed by and construed in accordance with the laws of the <strong>State of California</strong>. Any disputes arising under these Terms shall be resolved through binding arbitration in California. You agree to waive any right to a jury trial and to participate in class-action lawsuits against Taxed.</p></Section>
                <Section title="13. Changes to These Terms" reduceMotion={reduceMotion}><p>We reserve the right to modify these Terms at any time. Your continued use of the Service after changes constitutes acceptance of the revised Terms.</p></Section>
                <Section title="14. Contact" reduceMotion={reduceMotion}>
                    <p>If you have questions about these Terms, please contact us at:</p>
                    <div style={{ marginTop: 12, padding: '16px 20px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, fontSize: 14 }}>
                        <strong>Taxed</strong><br />
                        Email: <a href="mailto:legal@taxedhq.com" style={{ color: C.primary }}>legal@taxedhq.com</a><br />
                        Website: <a href="https://taxedhq.com" style={{ color: C.primary }}>taxedhq.com</a>
                    </div>
                </Section>
                <div style={{ marginTop: 40, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <Link to="/privacy" style={{ color: C.primary, fontSize: 14, fontWeight: 600 }}>View Privacy Policy →</Link>
                    <Link to="/" style={{ color: C.textSec, fontSize: 14 }}>← Back to Home</Link>
                </div>
            </div>
        </div>
    );
}
