import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const font = { serif: "'DM Serif Display', Georgia, serif", sans: "'DM Sans', system-ui, sans-serif" };

const glass = {
    background: 'rgba(10,10,18,0.75)',
    backdropFilter: 'blur(40px) saturate(180%)',
    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
};

export default function Navbar() {
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
            ...glass,
            borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
            transition: 'border-color 0.3s ease',
            zIndex: 999,
            fontFamily: font.sans,
        }}>
            <div className="nav-shell" style={{
                maxWidth: 1200, margin: '0 auto', padding: '0 24px',
                height: 64, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
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
                            <span className="brand-name" style={{ fontFamily: font.serif, fontSize: 20, color: '#fff', letterSpacing: '-0.01em' }}>Taxed</span>
                        </>
                    )}
                </Link>

                {/* Desktop Nav */}
                <div style={{ display: 'none', gap: 8, alignItems: 'center' }} className="nav-desktop">
                    {links.map(l => (
                        <Link key={l.path} to={l.path} style={{
                            fontSize: 14, fontWeight: 500,
                            color: isActive(l.path) ? '#34D399' : 'rgba(255,255,255,0.65)',
                            textDecoration: 'none', padding: '8px 14px', borderRadius: 10,
                            transition: 'all 0.2s',
                            background: isActive(l.path) ? 'rgba(52,211,153,0.1)' : 'transparent',
                        }}
                            onMouseEnter={e => { if (!isActive(l.path)) e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { if (!isActive(l.path)) e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}
                        >
                            {l.name}
                        </Link>
                    ))}
                    <Link to="/calculator" style={{
                        marginLeft: 8,
                        padding: "10px 20px", borderRadius: 99,
                        background: '#34D399', color: "#000",
                        fontSize: 13, fontWeight: 700, textDecoration: 'none',
                        boxShadow: '0 4px 20px rgba(52,211,153,0.35)',
                        transition: 'all 0.2s', display: 'inline-block', whiteSpace: 'nowrap'
                    }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 28px rgba(52,211,153,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(52,211,153,0.35)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        Get Full Access — $29.99
                    </Link>
                </div>

                {/* Mobile toggle */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="nav-mobile-btn"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile drawer */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'absolute', top: '100%', left: 0, right: 0,
                            ...glass,
                            borderBottom: '1px solid rgba(255,255,255,0.08)',
                            padding: '16px 24px 24px',
                            display: 'flex', flexDirection: 'column', gap: 4
                        }}
                    >
                        {links.map(l => (
                            <Link key={l.path} to={l.path} onClick={() => setIsOpen(false)} style={{
                                fontSize: 16, fontWeight: 600,
                                color: isActive(l.path) ? '#34D399' : 'rgba(255,255,255,0.8)',
                                textDecoration: 'none', padding: '14px 16px', borderRadius: 12,
                                background: isActive(l.path) ? 'rgba(52,211,153,0.08)' : 'transparent',
                            }}>
                                {l.name}
                            </Link>
                        ))}
                        <Link to="/calculator" onClick={() => setIsOpen(false)} style={{
                            marginTop: 8, padding: "16px", borderRadius: 14,
                            background: '#34D399', color: "#000",
                            textAlign: 'center', fontSize: 15, fontWeight: 700, textDecoration: 'none',
                            boxShadow: '0 4px 20px rgba(52,211,153,0.35)'
                        }}>
                            Get Full Access — $29.99
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
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
