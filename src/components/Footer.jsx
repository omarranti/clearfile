import { Link } from 'react-router-dom';
import { FileText, Github, Twitter, Mail, Instagram } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SOCIAL_LINKS } from '../config/socials';

const font = { serif: "'DM Serif Display', Georgia, serif", sans: "'DM Sans', system-ui, sans-serif" };

function TikTokIcon({ size = 16 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.18V2h-3.24v13.34a2.9 2.9 0 1 1-2-2.76V9.3a6.13 6.13 0 1 0 5.24 6.04V8.53a8.07 8.07 0 0 0 4.77 1.56V6.86c-.34 0-.68-.06-1-.17Z" />
        </svg>
    );
}

export default function Footer() {
    const [activeTip, setActiveTip] = useState(null);
    const [logoError, setLogoError] = useState(false);
    const wordmarkSrc = `${import.meta.env.BASE_URL}branding/taxedhq-logo-transparent.png`;

    useEffect(() => {
        if (!activeTip) return undefined;
        const timer = setTimeout(() => setActiveTip(null), 1300);
        return () => clearTimeout(timer);
    }, [activeTip]);

    const iconMap = {
        twitter: Twitter,
        instagram: Instagram,
        tiktok: TikTokIcon,
        github: Github,
        mail: Mail,
    };

    return (
        <footer className="site-footer" style={{
            background: 'rgba(255,255,255,0.03)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            padding: '64px 24px 40px',
            fontFamily: font.sans,
            position: 'relative',
            zIndex: 1,
        }}>
            <div className="footer-grid" style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 48 }}>

                {/* Brand */}
                <div>
                    <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: 'none', marginBottom: 16 }}>
                        {!logoError ? (
                            <img
                                src={wordmarkSrc}
                                alt="Taxed HQ"
                                onError={() => setLogoError(true)}
                                style={{ height: 34, width: 'auto', display: 'block' }}
                            />
                        ) : (
                            <>
                                <div style={{
                                    width: 34, height: 34, borderRadius: 10,
                                    background: 'linear-gradient(135deg, #34D399, #059669)',
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    boxShadow: '0 4px 14px rgba(52,211,153,0.3)'
                                }}>
                                    <FileText size={16} color="#fff" />
                                </div>
                                <span style={{ fontFamily: font.serif, fontSize: 20, color: '#fff' }}>Taxed</span>
                            </>
                        )}
                    </Link>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
                        Finally see where your money goes.<br />
                        Educational purpose tax tools and world-class insights.
                    </p>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        {SOCIAL_LINKS.map((item) => {
                            const Icon = iconMap[item.icon];
                            return (
                            <a key={item.id} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                                className="social-btn"
                                title={`${item.label} ${item.handle}`}
                                aria-label={`${item.label} ${item.handle}`}
                                onTouchStart={() => setActiveTip(item.id)}
                                style={{
                                    width: 36, height: 36, borderRadius: 10,
                                    background: 'rgba(255,255,255,0.07)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'rgba(255,255,255,0.5)',
                                    transition: 'all 0.2s',
                                    textDecoration: 'none',
                                    position: 'relative',
                                }}
                                onMouseEnter={e => {
                                    setActiveTip(item.id);
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                                    e.currentTarget.style.color = '#fff';
                                }}
                                onMouseLeave={e => {
                                    setActiveTip(null);
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                                    e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                                }}
                            >
                                <Icon size={16} />
                                <span className={`social-tip ${activeTip === item.id ? 'show' : ''}`}>
                                    {item.handle}
                                </span>
                            </a>
                        )})}
                    </div>
                </div>

                {/* Tools */}
                <div>
                    <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#34D399', marginBottom: 20 }}>Tools</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {[
                            { label: 'Tax Navigator', path: '/calculator' },
                            { label: 'Scenario Modeler', path: '/calculator' },
                            { label: 'Credit Finder', path: '/calculator' },
                        ].map((item, i) => (
                            <li key={i}>
                                <Link to={item.path} style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
                                >{item.label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Resources */}
                <div>
                    <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#34D399', marginBottom: 20 }}>Resources</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {[
                            { label: 'Tax Deadlines 2024', path: '/resources' },
                            { label: 'IRS Form Guides', path: '/resources' },
                            { label: 'Find a CPA', path: '/resources' },
                        ].map((item, i) => (
                            <li key={i}>
                                <Link to={item.path} style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
                                >{item.label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Legal */}
                <div>
                    <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#34D399', marginBottom: 20 }}>Legal</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {[
                            { label: 'Privacy Policy', path: '/privacy' },
                            { label: 'Terms of Service', path: '/terms' },
                        ].map((item, i) => (
                            <li key={i}>
                                <Link to={item.path} style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
                                >{item.label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="footer-bottom" style={{
                maxWidth: 1200, margin: '48px auto 0', paddingTop: 24,
                borderTop: '1px solid rgba(255,255,255,0.07)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexWrap: 'wrap', gap: 12, fontSize: 12, color: 'rgba(255,255,255,0.3)'
            }}>
                <span>&copy; {new Date().getFullYear()} Taxed. Not actual tax advice.</span>
                <div className="footer-legal-links" style={{ display: 'flex', gap: 24 }}>
                    <Link to="/privacy" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.3)', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                    >Privacy Policy</Link>
                    <Link to="/terms" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.3)', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                    >Terms of Service</Link>
                </div>
            </div>
            <style>{`
              @media (max-width: 900px) {
                .site-footer { padding: 52px 20px 34px !important; }
                .footer-grid { gap: 36px !important; }
              }

              @media (max-width: 640px) {
                .site-footer { padding: 44px 16px 28px !important; }
                .footer-grid { gap: 28px !important; }
                .footer-bottom { margin-top: 36px !important; text-align: center; justify-content: center !important; }
                .footer-legal-links { width: 100%; justify-content: center; gap: 18px !important; }
              }

              .social-btn .social-tip {
                position: absolute;
                left: 50%;
                top: -8px;
                transform: translate(-50%, -100%);
                background: rgba(8, 8, 12, 0.95);
                color: rgba(255,255,255,0.9);
                border: 1px solid rgba(255,255,255,0.14);
                border-radius: 8px;
                padding: 4px 8px;
                font-size: 10px;
                line-height: 1;
                letter-spacing: 0.02em;
                white-space: nowrap;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.16s ease;
              }

              .social-btn .social-tip.show {
                opacity: 1;
              }
            `}</style>
        </footer>
    );
}
