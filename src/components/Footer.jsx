import { Link } from 'react-router-dom';
import { FileText, Github, Twitter, Mail, Instagram } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SOCIAL_LINKS } from '../config/socials';
import { font } from '../lib/ui';

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
            background: 'rgba(255,255,255,0.66)',
            borderTop: '1px solid rgba(16,42,67,0.1)',
            padding: '72px 24px 44px',
            fontFamily: font.sans,
            position: 'relative',
            zIndex: 1,
        }}>
            <div className="footer-grid" style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 56 }}>

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
                                <span style={{ fontFamily: font.serif, fontSize: 20, color: '#102a43' }}>Taxed</span>
                            </>
                        )}
                    </Link>
                    <p style={{ color: '#4f6478', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
                        Finally see where your money goes.<br />
                        Educational purpose tax tools and world-class insights.
                    </p>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        {(Array.isArray(SOCIAL_LINKS) ? SOCIAL_LINKS : []).map((item, i) => {
                            const Icon = iconMap[item?.icon] || FileText;
                            const href = item?.href || '#';
                            const isExternal = typeof href === 'string' && href.startsWith('http');
                            return (
                            <a key={item?.id || i} href={href} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noopener noreferrer' : undefined}
                                className="social-btn"
                                title={`${item.label} ${item.handle}`}
                                aria-label={`${item.label} ${item.handle}`}
                                onTouchStart={() => setActiveTip(item.id)}
                                style={{
                                    width: 44, height: 44, borderRadius: 12,
                                    background: '#eef4fb',
                                    border: '1px solid #d8e3f0',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#4f6478',
                                    transition: 'all 0.18s',
                                    textDecoration: 'none',
                                    position: 'relative',
                                }}
                                onMouseEnter={() => setActiveTip(item.id)}
                                onMouseLeave={() => setActiveTip(null)}
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
                    <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#1f9d8b', marginBottom: 20 }}>Tools</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {[
                            { label: 'Tax Navigator', path: '/calculator' },
                            { label: 'Scenario Modeler', path: '/calculator' },
                            { label: 'Credit Finder', path: '/calculator' },
                        ].map((item, i) => (
                            <li key={i}>
                                <Link to={item.path} className="footer-link" style={{ color: '#4f6478', textDecoration: 'none', fontSize: 13, transition: 'color 0.18s' }}>{item.label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Resources */}
                <div>
                    <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#1f9d8b', marginBottom: 20 }}>Resources</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {[
                            { label: 'Tax Deadlines', path: '/resources' },
                            { label: 'IRS Form Guides', path: '/resources' },
                            { label: 'Find a CPA', path: '/resources' },
                        ].map((item, i) => (
                            <li key={i}>
                                <Link to={item.path} className="footer-link" style={{ color: '#4f6478', textDecoration: 'none', fontSize: 13, transition: 'color 0.18s' }}>{item.label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Legal */}
                <div>
                    <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#1f9d8b', marginBottom: 20 }}>Legal</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {[
                            { label: 'Privacy Policy', path: '/privacy' },
                            { label: 'Terms of Service', path: '/terms' },
                        ].map((item, i) => (
                            <li key={i}>
                                <Link to={item.path} className="footer-link" style={{ color: '#4f6478', textDecoration: 'none', fontSize: 13, transition: 'color 0.18s' }}>{item.label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="footer-bottom" style={{
                maxWidth: 1160, margin: '56px auto 0', paddingTop: 26,
                borderTop: '1px solid rgba(16,42,67,0.1)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexWrap: 'wrap', gap: 12, fontSize: 12, color: '#6b7f93'
            }}>
                <span>&copy; {new Date().getFullYear()} Taxed. Not actual tax advice.</span>
                <div className="footer-legal-links" style={{ display: 'flex', gap: 24 }}>
                    <Link to="/privacy" className="footer-link" style={{ textDecoration: 'none', color: '#6b7f93', transition: 'color 0.2s' }}>Privacy Policy</Link>
                    <Link to="/terms" className="footer-link" style={{ textDecoration: 'none', color: '#6b7f93', transition: 'color 0.2s' }}>Terms of Service</Link>
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
                background: #ffffff;
                color: #102a43;
                border: 1px solid #d8e3f0;
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

              .social-btn:active,
              .footer-link:active {
                transform: translateY(0.5px) scale(0.98);
              }

              .social-btn:focus-visible,
              .footer-link:focus-visible {
                box-shadow: 0 0 0 3px rgba(31,157,139,0.2);
                outline: none;
              }
            `}</style>
        </footer>
    );
}
