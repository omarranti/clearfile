import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, DollarSign, Calculator, FileText, Check, ShieldCheck, PlayCircle } from 'lucide-react';

const font = { serif: "'DM Serif Display', Georgia, serif", sans: "'DM Sans', system-ui, sans-serif" };

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.25, 0.1, 0.25, 1] } }
};
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

const glassBase = {
    background: 'rgba(255,255,255,0.055)',
    backdropFilter: 'blur(28px) saturate(160%)',
    WebkitBackdropFilter: 'blur(28px) saturate(160%)',
    border: '1px solid rgba(255,255,255,0.1)',
};
const demoVideoSrc = `${import.meta.env.BASE_URL}media/model-demo.mp4`;
const demoPosterSrc = `${import.meta.env.BASE_URL}og-image.png`;

function GradientOrbs() {
    return (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-15%', right: '-5%', width: '55vw', height: '55vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,211,153,0.13) 0%, transparent 65%)', filter: 'blur(48px)' }} />
            <div style={{ position: 'absolute', bottom: '-20%', left: '-8%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 65%)', filter: 'blur(48px)' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '35vw', height: '35vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(96,165,250,0.06) 0%, transparent 65%)', filter: 'blur(40px)' }} />
        </div>
    );
}

function Feature({ icon: Icon, title, text }) {
    return (
        <motion.div variants={fadeUp}
            style={{ ...glassBase, padding: '32px', borderRadius: 24, position: 'relative', cursor: 'default', transition: 'all 0.3s' }}
            whileHover={{ background: 'rgba(255,255,255,0.09)', y: -6, boxShadow: '0 24px 64px rgba(0,0,0,0.35), 0 0 0 1px rgba(52,211,153,0.15)' }}
        >
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
                <Icon size={24} color="#34D399" />
            </div>
            <h3 style={{ fontFamily: font.sans, fontSize: 19, fontWeight: 700, color: '#fff', marginBottom: 12 }}>{title}</h3>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, lineHeight: 1.7 }}>{text}</p>
        </motion.div>
    );
}

export default function Landing() {
    return (
        <div className="landing-page" style={{ fontFamily: font.sans, background: '#0A0A12', position: 'relative', minHeight: '100vh' }}>
            <GradientOrbs />

            {/* ── Hero ── */}
            <section className="hero-section" style={{ position: 'relative', zIndex: 1, padding: '148px 24px 120px' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
                    <motion.div initial="hidden" animate="show" variants={stagger}>

                        {/* Badge */}
                        <motion.div className="hero-badge" variants={fadeUp} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px', ...glassBase, borderRadius: 99, color: '#34D399', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 40 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34D399', boxShadow: '0 0 8px #34D399' }} />
                            Tax Clarity Platform
                            <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.15)' }} />
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>2024 Updated</span>
                        </motion.div>

                        {/* Headline */}
                        <motion.h1 className="hero-title" variants={fadeUp} style={{ fontFamily: font.serif, fontSize: 'clamp(48px, 8vw, 90px)', color: '#fff', lineHeight: 1.04, letterSpacing: '-0.025em', marginBottom: 28 }}>
                            Finally see where <br />
                            <span style={{ background: 'linear-gradient(120deg, #34D399 0%, #60A5FA 55%, #A78BFA 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                your money really goes.
                            </span>
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p className="hero-subtitle" variants={fadeUp} style={{ fontSize: 'clamp(17px, 2.5vw, 21px)', color: 'rgba(255,255,255,0.58)', lineHeight: 1.65, maxWidth: 640, margin: '0 auto 52px' }}>
                            Taxed is not a tax filing service. It's a visual platform that lets you navigate your tax picture across income levels, uncover hidden savings, and understand every risk — before you sit down with a pro.
                        </motion.p>

                        {/* CTAs */}
                        <motion.div className="hero-cta" variants={fadeUp} style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 52 }}>
                            <Link className="hero-primary-cta" to="/calculator" style={{ padding: '16px 38px', borderRadius: 99, background: '#34D399', color: '#000', fontSize: 16, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 40px rgba(52,211,153,0.35), 0 0 0 1px rgba(52,211,153,0.2)', transition: 'all 0.25s' }}
                                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 50px rgba(52,211,153,0.5), 0 0 0 1px rgba(52,211,153,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 8px 40px rgba(52,211,153,0.35), 0 0 0 1px rgba(52,211,153,0.2)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                Model My Tax Scenarios <ArrowRight size={18} />
                            </Link>
                            <Link className="hero-secondary-cta" to="/resources" style={{ padding: '16px 38px', borderRadius: 99, ...glassBase, color: 'rgba(255,255,255,0.85)', fontSize: 16, fontWeight: 600, textDecoration: 'none', transition: 'all 0.25s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.055)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
                            >
                                Browse Resources
                            </Link>
                        </motion.div>

                        {/* Price pill */}
                        <motion.div variants={fadeUp} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                            <div className="price-pill" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 30px', ...glassBase, borderRadius: 99, flexWrap: 'wrap', justifyContent: 'center', rowGap: 8 }}>
                                <span style={{ fontFamily: font.serif, fontSize: 24, color: '#34D399', fontWeight: 700 }}>$29.99</span>
                                <span style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.12)' }} className="price-divider" />
                                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>one-time · full lifetime access</span>
                                <span style={{ padding: '4px 12px', background: 'rgba(52,211,153,0.1)', color: '#34D399', borderRadius: 99, fontSize: 11, fontWeight: 700, border: '1px solid rgba(52,211,153,0.22)' }}>Not a subscription</span>
                            </div>
                            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Less than a pizza dinner to understand your exact tax situation.</p>
                        </motion.div>

                    </motion.div>
                </div>
            </section>

            {/* ── Trust bar ── */}
            <section style={{ position: 'relative', zIndex: 1, padding: '0 24px' }}>
                <div style={{ maxWidth: 860, margin: '0 auto' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
                        className="trust-card"
                        style={{ ...glassBase, borderRadius: 22, padding: '28px 40px' }}>
                        <p style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.28)', marginBottom: 20, textAlign: 'center' }}>Built for clarity and awareness — not filing</p>
                        <div style={{ display: 'flex', gap: 'clamp(20px, 5vw, 56px)', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {['2024 Tax Brackets Updated', 'CA State Tax Integrated', 'Educational — Not Tax Advice'].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontSize: 14 }}>
                                    <CheckCircle2 color="#34D399" size={18} style={{ flexShrink: 0 }} /> {item}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── Product Demo Video ── */}
            <section className="demo-section" style={{ padding: '112px 24px 100px', position: 'relative', zIndex: 1 }}>
                <div style={{ maxWidth: 1180, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 38 }}>
                        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', ...glassBase, borderRadius: 99, color: '#34D399', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
                            <PlayCircle size={14} /> See It In Action
                        </motion.div>
                        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                            style={{ fontFamily: font.serif, fontSize: 'clamp(30px, 5vw, 52px)', color: '#fff', lineHeight: 1.08, letterSpacing: '-0.02em', marginBottom: 12 }}>
                            Watch how fast tax clarity happens.
                        </motion.h2>
                        <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}
                            style={{ maxWidth: 700, margin: '0 auto', fontSize: 17, color: 'rgba(255,255,255,0.52)', lineHeight: 1.65 }}>
                            This walkthrough shows a real model flow: input your numbers, compare outcomes, then get clear next actions in minutes.
                        </motion.p>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="demo-band"
                        style={{ ...glassBase, borderRadius: 28, padding: '22px', display: 'grid', gridTemplateColumns: 'minmax(0,1.45fr) minmax(0,1fr)', gap: 20, alignItems: 'stretch' }}>
                        <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: '#05060B', position: 'relative' }}>
                            <video
                                src={demoVideoSrc}
                                poster={demoPosterSrc}
                                controls
                                muted
                                playsInline
                                preload="metadata"
                                style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover', minHeight: 280 }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
                            {[
                                'Turn raw paycheck data into a visual tax story.',
                                'Clone scenarios to compare raise, bonus, or job-change outcomes.',
                                'Get actionable checklists so you know what to do next.',
                            ].map((item, idx) => (
                                <div key={idx} style={{ ...glassBase, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                    <CheckCircle2 size={16} color="#34D399" style={{ marginTop: 2, flexShrink: 0 }} />
                                    <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1.6 }}>{item}</span>
                                </div>
                            ))}
                            <Link
                                to="/calculator"
                                style={{ marginTop: 8, alignSelf: 'flex-start', padding: '13px 24px', borderRadius: 99, background: '#34D399', color: '#000', fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 36px rgba(52,211,153,0.34)' }}
                            >
                                Try The Model Yourself <ArrowRight size={16} />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── Features ── */}
            <section id="how-it-works" className="features-section" style={{ padding: '128px 24px', position: 'relative', zIndex: 1 }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 72 }}>
                        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#34D399', marginBottom: 16 }}>Platform Features</motion.p>
                        <motion.h2 initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ fontFamily: font.serif, fontSize: 'clamp(32px, 5vw, 54px)', color: '#fff', marginBottom: 20, lineHeight: 1.08, letterSpacing: '-0.02em' }}>Your Personal Tax Intelligence Platform</motion.h2>
                        <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} style={{ fontSize: 18, color: 'rgba(255,255,255,0.52)', maxWidth: 560, margin: '0 auto', lineHeight: 1.65 }}>
                            Stop blindly trusting a number on a screen. Taxed gives you the full picture — across every income level, scenario, and life change.
                        </motion.p>
                    </div>
                    <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={stagger}
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 20 }}>
                        <Feature icon={Calculator} title="Scenario Modeling" text="Drag the income slider and instantly see how a raise, a new contract, or a life change affects your effective tax rate, take-home, and bracket exposure." />
                        <Feature icon={ShieldCheck} title="Risk Identification" text="Uncover penalty risks, compliance blind spots, and costly misunderstandings before they land on your doorstep. Know what you're exposed to." />
                        <Feature icon={DollarSign} title="Benefit & Credit Discovery" text="We don't stop at what you owe. Taxed surfaces every available reduction — EITC, Saver's Credit, HSA, IRA deductions — based on your specific numbers." />
                    </motion.div>
                </div>
            </section>

            {/* ── Comparison ── */}
            <section className="comparison-section" style={{ padding: '0 24px 128px', position: 'relative', zIndex: 1 }}>
                <div style={{ maxWidth: 960, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 56 }}>
                        <motion.h2 initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ fontFamily: font.serif, fontSize: 'clamp(28px, 4vw, 46px)', color: '#fff', marginBottom: 14, letterSpacing: '-0.02em' }}>The gap no one was filling</motion.h2>
                        <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} style={{ fontSize: 17, color: 'rgba(255,255,255,0.5)' }}>TurboTax files. CPAs file. Taxed <em>explains</em>.</motion.p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                        {[
                            { title: 'TurboTax / TaxAct', price: '$0–$115/yr', tag: 'Filing Software', items: ['Guides you to file', 'Hides bracket math', 'No scenario modeling', 'Annual, per-file cost'], highlight: false },
                            { title: 'CPA Consultation', price: '$200–$400/hr', tag: 'Professional Service', items: ['Expert advice', 'No visual dashboard', 'Only at tax time', 'High entry cost'], highlight: false },
                            { title: 'Taxed', price: '$29.99 one-time', tag: 'Tax Clarity Platform', items: ['Visual scenario modeling', 'Full bracket transparency', 'Credit + risk discovery', 'Understand before you file'], highlight: true },
                        ].map((col, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                                style={{
                                    padding: '28px 26px', borderRadius: 24, position: 'relative',
                                    ...(col.highlight
                                        ? { background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.28)', boxShadow: '0 0 60px rgba(52,211,153,0.08), inset 0 1px 0 rgba(52,211,153,0.15)' }
                                        : glassBase
                                    )
                                }}>
                                {col.highlight && (
                                    <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: '#34D399', color: '#000', fontSize: 10, fontWeight: 800, padding: '4px 14px', borderRadius: 99, whiteSpace: 'nowrap', letterSpacing: '0.06em', textTransform: 'uppercase' }}>The Gap We Fill</div>
                                )}
                                <div style={{ fontSize: 10, fontWeight: 700, color: col.highlight ? '#34D399' : 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{col.tag}</div>
                                <div style={{ fontFamily: font.serif, fontSize: 20, color: '#fff', marginBottom: 4 }}>{col.title}</div>
                                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 24 }}>{col.price}</div>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {col.items.map((item, j) => (
                                        <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: col.highlight ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.45)' }}>
                                            <Check size={14} color={col.highlight ? '#34D399' : 'rgba(255,255,255,0.22)'} style={{ flexShrink: 0 }} /> {item}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Resources CTA ── */}
            <section className="resource-section" style={{ padding: '0 24px 100px', position: 'relative', zIndex: 1 }}>
                <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
                    className="resource-band"
                    style={{ maxWidth: 1200, margin: '0 auto', background: 'rgba(52,211,153,0.06)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', border: '1px solid rgba(52,211,153,0.18)', borderRadius: 32, padding: 'clamp(40px, 8vw, 80px)', position: 'relative', overflow: 'hidden', display: 'flex', flexWrap: 'wrap', gap: 52, alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 0 80px rgba(52,211,153,0.06)' }}>
                    <div style={{ position: 'absolute', top: -120, right: -120, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,211,153,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
                    <div style={{ maxWidth: 480, position: 'relative', zIndex: 1 }}>
                        <h2 style={{ fontFamily: font.serif, fontSize: 'clamp(28px, 5vw, 46px)', lineHeight: 1.12, marginBottom: 18, color: '#fff', letterSpacing: '-0.02em' }}>Free tax knowledge for everyone.</h2>
                        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.68, marginBottom: 36 }}>From penalty abatement scripts to plain-English IRS form walkthroughs — our open resource directory is always free.</p>
                        <Link to="/resources" style={{ padding: '15px 32px', borderRadius: 99, background: '#34D399', color: '#000', fontSize: 15, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10, boxShadow: '0 6px 32px rgba(52,211,153,0.35)', transition: 'all 0.25s' }}
                            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 10px 44px rgba(52,211,153,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 6px 32px rgba(52,211,153,0.35)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            Visit Resource Hub <ArrowRight size={17} />
                        </Link>
                    </div>
                    <div className="resource-list" style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', zIndex: 1 }}>
                        {["Income Level Navigation Guide", "How to Request IRS Penalty Abatement", "Credits You're Probably Missing"].map((t, i) => (
                            <div key={i} style={{ padding: '18px 22px', ...glassBase, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <FileText size={17} color="#34D399" />
                                </div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{t}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* ── Final CTA ── */}
            <section className="final-cta-section" style={{ padding: '60px 24px 150px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
                    <h2 style={{ fontFamily: font.serif, fontSize: 'clamp(30px, 5vw, 54px)', color: '#fff', marginBottom: 18, lineHeight: 1.08, letterSpacing: '-0.02em' }}>Ready to stop guessing about your taxes?</h2>
                    <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.5)', maxWidth: 460, margin: '0 auto 48px', lineHeight: 1.65 }}>One payment. Full access. No subscriptions, no surprises.</p>
                    <Link to="/calculator" style={{ padding: '20px 56px', borderRadius: 99, background: '#34D399', color: '#000', fontSize: 18, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 14, boxShadow: '0 12px 56px rgba(52,211,153,0.4)', transition: 'all 0.25s' }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 18px 70px rgba(52,211,153,0.55)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 12px 56px rgba(52,211,153,0.4)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        Start Navigating — $29.99 <ArrowRight size={20} />
                    </Link>
                    <p style={{ marginTop: 20, fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>Educational tool only. Taxed does not file taxes or provide tax advice.</p>
                </motion.div>
            </section>
            <style>{`
              @media (max-width: 1024px) {
                .hero-section { padding-top: 132px !important; padding-bottom: 96px !important; }
                .demo-section { padding-top: 96px !important; padding-bottom: 88px !important; }
                .features-section { padding-top: 108px !important; padding-bottom: 108px !important; }
                .comparison-section { padding-bottom: 104px !important; }
              }

              @media (max-width: 768px) {
                .hero-section { padding: 118px 16px 82px !important; }
                .hero-title { margin-bottom: 20px !important; }
                .hero-subtitle { margin-bottom: 34px !important; }
                .hero-cta { gap: 10px !important; margin-bottom: 34px !important; }
                .hero-primary-cta, .hero-secondary-cta { width: min(100%, 340px); justify-content: center; padding: 14px 22px !important; font-size: 15px !important; }
                .price-pill { padding: 12px 18px !important; gap: 10px !important; }
                .trust-card { padding: 20px 18px !important; }
                .demo-section { padding: 72px 16px 72px !important; }
                .demo-band { grid-template-columns: 1fr !important; border-radius: 22px !important; padding: 14px !important; gap: 14px !important; }
                .features-section { padding: 88px 16px !important; }
                .comparison-section { padding: 0 16px 88px !important; }
                .resource-section { padding: 0 16px 80px !important; }
                .resource-band { border-radius: 24px !important; gap: 26px !important; }
                .resource-list { min-width: 100% !important; }
                .final-cta-section { padding: 34px 16px 112px !important; }
              }

              @media (max-width: 480px) {
                .hero-badge { padding: 7px 12px !important; gap: 6px !important; font-size: 10px !important; letter-spacing: 0.05em !important; margin-bottom: 26px !important; }
                .hero-cta { width: 100%; }
                .hero-primary-cta, .hero-secondary-cta { width: 100%; max-width: 100%; }
                .price-pill .price-divider { display: none; }
                .demo-section { padding-top: 64px !important; }
              }
            `}</style>
        </div>
    );
}
