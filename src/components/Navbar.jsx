import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { font, navGlass as glass } from '../lib/ui';

export default function Navbar({ session, onSignOut, isAdmin, onAdminLogout }) {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [logoError, setLogoError] = useState(false);
    const location = useLocation();
    const wordmarkSrc = `${import.meta.env.BASE_URL}branding/taxedhq-logo-transparent.png`;

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => { setIsOpen(false); }, [location.pathname]);

    const links = [
        { name: "How it Works", path: "/#how-it-works" },
        { name: "Tax Navigator", path: "/calculator" },
        { name: "Resource Hub", path: "/resources" },
    ];

    const isActive = (path) => path === '/calculator' || path === '/resources'
        ? location.pathname === path
        : false;

    return (
        <nav style={{
            position: 'fixed',
            top: 0, left: 0, right: 0,
            paddingTop: 'env(safe-area-inset-top)',
            ...glass,
            borderBottom: scrolled ? '1px solid rgba(16,42,67,0.08)' : '1px solid transparent',
            transition: 'border-color 0.3s ease',
            zIndex: 999,
            fontFamily: font.sans,
        }}>
            <div className="nav-shell" style={{
                maxWidth: 1160, margin: '0 auto', padding: '0 28px',
                height: 68, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                {/* Logo */}
                <Link to="/" className="brand-link" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: 'none' }}>
                    {!logoError ? (
                        <img
                            src={wordmarkSrc}
                            alt="Taxed HQ"
                            onError={() => setLogoError(true)}
                            style={{ height: 30, width: 'auto', display: 'block' }}
                        />
                    ) : (
                        <>
                            <div style={{
                                width: 34, height: 34, borderRadius: 10,
                                background: 'linear-gradient(135deg, #34D399, #059669)',
                                display: "flex", alignItems: "center", justifyContent: "center",
                                boxShadow: '0 4px 16px rgba(52,211,153,0.35)'
                            }}>
                                <FileText size={16} color="#fff" />
                            </div>
                            <span className="brand-name" style={{ fontFamily: font.serif, fontSize: 20, color: '#102a43', letterSpacing: '-0.01em' }}>Taxed</span>
                        </>
                    )}
                </Link>

                {/* Desktop Nav */}
                <div style={{ display: 'none', gap: 8, alignItems: 'center' }} className="nav-desktop">
                    {links.map(l => (
                        <Link key={l.path} to={l.path} className={`nav-pill${isActive(l.path) ? ' nav-pill--active' : ''}`} style={{
                            fontSize: 13, fontWeight: 500,
                            color: isActive(l.path) ? '#1f9d8b' : '#4f6478',
                            textDecoration: 'none', padding: '7px 12px', borderRadius: 999,
                            transition: 'all 0.18s',
                            background: isActive(l.path) ? 'rgba(31,157,139,0.1)' : 'transparent',
                        }}>
                            {l.name}
                        </Link>
                    ))}
                    {session ? (
                        <button
                            onClick={onSignOut}
                            className="nav-secondary-btn"
                            style={{
                                marginLeft: 8,
                                padding: "9px 16px", borderRadius: 99,
                                background: '#eef4fb', color: "#102a43",
                                border: '1px solid #d8e3f0',
                                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                transition: 'all 0.18s', display: 'inline-block', whiteSpace: 'nowrap'
                            }}
                        >
                            Log Out
                        </button>
                    ) : (
                        <Link to="/auth" className="nav-primary-btn" style={{
                            marginLeft: 8,
                            padding: "9px 18px", borderRadius: 99,
                            background: '#1f9d8b', color: "#fff",
                            fontSize: 13, fontWeight: 600, textDecoration: 'none',
                            boxShadow: '0 3px 12px rgba(31,157,139,0.22)',
                            transition: 'all 0.18s', display: 'inline-block', whiteSpace: 'nowrap'
                        }}>
                            Unlock / Sign In
                        </Link>
                    )}
                    {isAdmin && (
                        <button
                            onClick={onAdminLogout}
                            className="nav-secondary-btn"
                            style={{
                                marginLeft: 8,
                                padding: "9px 16px", borderRadius: 99,
                                background: '#fff4ef', color: "#9a3412",
                                border: '1px solid #fed7aa',
                                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                transition: 'all 0.18s', display: 'inline-block', whiteSpace: 'nowrap'
                            }}
                        >
                            Admin Log Out
                        </button>
                    )}
                </div>

                {/* Mobile toggle */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="nav-mobile-btn"
                    aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
                    aria-expanded={isOpen}
                    style={{ background: '#eef4fb', border: '1px solid #d8e3f0', borderRadius: 12, padding: '12px', cursor: 'pointer', color: '#102a43', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 44, minHeight: 44 }}
                >
                    {isOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
                </button>
            </div>

            {/* Mobile drawer */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.16 }}
                        style={{
                            position: 'absolute', top: '100%', left: 0, right: 0,
                            ...glass,
                            borderBottom: '1px solid rgba(16,42,67,0.1)',
                            padding: '16px 24px 24px',
                            display: 'flex', flexDirection: 'column', gap: 4
                        }}
                    >
                        {links.map(l => (
                            <Link key={l.path} to={l.path} onClick={() => setIsOpen(false)} className="nav-mobile-pill" style={{
                                fontSize: 16, fontWeight: 600,
                                color: isActive(l.path) ? '#1f9d8b' : '#334e68',
                                textDecoration: 'none', padding: '14px 16px', borderRadius: 12,
                                background: isActive(l.path) ? 'rgba(31,157,139,0.1)' : 'transparent',
                            }}>
                                {l.name}
                            </Link>
                        ))}
                        {session ? (
                            <button
                                onClick={async () => { setIsOpen(false); await onSignOut(); }}
                                className="nav-secondary-btn"
                                style={{
                                    marginTop: 8, padding: "16px", borderRadius: 14,
                                    background: '#eef4fb', color: "#102a43",
                                    border: '1px solid #d8e3f0',
                                    textAlign: 'center', fontSize: 15, fontWeight: 700, cursor: 'pointer'
                                }}
                            >
                                Log Out
                            </button>
                        ) : (
                            <Link to="/auth" onClick={() => setIsOpen(false)} className="nav-primary-btn" style={{
                                marginTop: 8, padding: "16px", borderRadius: 14,
                                background: '#1f9d8b', color: "#fff",
                                textAlign: 'center', fontSize: 15, fontWeight: 700, textDecoration: 'none',
                                boxShadow: '0 4px 18px rgba(31,157,139,0.26)'
                            }}>
                                Unlock / Sign In
                            </Link>
                        )}
                        {isAdmin && (
                            <button
                                onClick={() => { setIsOpen(false); onAdminLogout(); }}
                                className="nav-secondary-btn"
                                style={{
                                    marginTop: 8, padding: "16px", borderRadius: 14,
                                    background: '#fff4ef', color: "#9a3412",
                                    border: '1px solid #fed7aa',
                                    textAlign: 'center', fontSize: 15, fontWeight: 700, cursor: 'pointer'
                                }}
                            >
                                Admin Log Out
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
        .nav-pill:active,
        .nav-mobile-pill:active,
        .nav-primary-btn:active,
        .nav-secondary-btn:active,
        .nav-mobile-btn:active {
          transform: translateY(0.5px) scale(0.98);
        }

        .nav-pill:focus-visible,
        .nav-mobile-pill:focus-visible,
        .nav-primary-btn:focus-visible,
        .nav-secondary-btn:focus-visible,
        .nav-mobile-btn:focus-visible {
          box-shadow: 0 0 0 3px rgba(31,157,139,0.24);
          outline: none;
        }

        .nav-pill--active {
          color: #1f9d8b !important;
        }

        @media (min-width: 900px) {
          .nav-desktop { display: flex !important; }
          .nav-mobile-btn { display: none !important; }
        }

        @media (max-width: 899px) {
          .nav-shell { padding: 0 16px !important; }
          .brand-link { gap: 8px !important; }
          .brand-name { font-size: 19px !important; }
        }
      `}</style>
        </nav>
    );
}
