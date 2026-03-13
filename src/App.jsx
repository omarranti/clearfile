import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Calculator from './pages/Calculator';
import Resources from './pages/Resources';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Auth from './pages/Auth';
import Admin from './pages/Admin';
import UnderstandYourTaxes from './pages/UnderstandYourTaxes';
import TakeHomePayCalculator from './pages/TakeHomePayCalculator';
import FreelanceTaxCalculator from './pages/FreelanceTaxCalculator';
import { supabase } from './lib/supabase';

const SEO_MAP = {
    "/": {
        title: "Taxed | Finally See Where Your Money Goes",
        desc: "Taxed is a visual Tax Clarity Platform. Model tax scenarios, discover hidden credits, and identify risks across any income level. Not a tax filing service."
    },
    "/calculator": {
        title: "Model Your Tax Scenario | Taxed",
        desc: "Instantly see how life changes affect your effective tax rate, take-home pay, and bracket exposure. Taxed's tax modeling tool."
    },
    "/resources": {
        title: "Tax Resource Hub | Taxed",
        desc: "Free tax knowledge for everyone. Explore IRS form walkthroughs, penalty abatement scripts, and compliance guides."
    },
    "/privacy": {
        title: "Privacy Policy | Taxed",
        desc: "Read the Taxed Privacy Policy. We do not store personal financial data or Social Security numbers."
    },
    "/terms": {
        title: "Terms of Service | Taxed",
        desc: "Taxed Terms of Service. Taxed is an educational tool, not tax advice or a filing service."
    },
    "/auth": {
        title: "Sign In | Taxed",
        desc: "Create or access your Taxed account to save tax scenarios and progress."
    },
    "/admin": {
        title: "Admin Login | Taxed",
        desc: "Admin access for Taxed."
    },
    "/understand-your-taxes": {
        title: "Understand Your Taxes - Finally See Where Your Money Goes",
        desc: "TurboTax files your taxes. Taxed explains them. See exactly where your money goes - brackets, deductions, and credits in plain English. One-time $29.99."
    },
    "/tax-calculator-take-home-pay": {
        title: "Tax Calculator: See Your Exact Take-Home Pay Before You Decide",
        desc: "Plug in your income and see your real take-home pay in seconds. Model a raise, side hustle, or job change before you commit. No subscription. No confusion."
    },
    "/freelance-tax-calculator": {
        title: "Freelance Tax Calculator: Know What You Owe Before April",
        desc: "Going freelance? See exactly what you'll owe in taxes - federal + California - before your first invoice. Quarterly estimates, deductions, no surprises."
    }
};

function RouteHandler() {
    const { pathname } = useLocation();
    
    useEffect(() => {
        window.scrollTo(0, 0);
        const seo = SEO_MAP[pathname] || SEO_MAP["/"];
        document.title = seo.title;
        
        let metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute("content", seo.desc);
        
        let ogTitle = document.querySelector('meta[property="og:title"]');
        let ogDesc = document.querySelector('meta[property="og:description"]');
        let ogUrl = document.querySelector('meta[property="og:url"]');
        if (ogTitle) ogTitle.setAttribute("content", seo.title);
        if (ogDesc) ogDesc.setAttribute("content", seo.desc);
        if (ogUrl) ogUrl.setAttribute("content", window.location.href);

        const canonicalHref = `${window.location.origin}${pathname}`;
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', canonicalHref);

        let robots = document.querySelector('meta[name="robots"]');
        if (!robots) {
            robots = document.createElement('meta');
            robots.setAttribute('name', 'robots');
            document.head.appendChild(robots);
        }
        const shouldNoIndex = pathname === '/auth' || pathname === '/admin';
        robots.setAttribute('content', shouldNoIndex ? 'noindex, nofollow' : 'index, follow');
    }, [pathname]);
    
    return null;
}

export default function App() {
    const [session, setSession] = useState(null);
    const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('taxed_admin_auth') === 'true');

    useEffect(() => {
        let mounted = true;

        supabase.auth.getSession().then(({ data }) => {
            if (mounted) setSession(data.session ?? null);
        });

        const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            setSession(nextSession ?? null);
        });

        return () => {
            mounted = false;
            listener.subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const adminLogin = (pin) => {
        if (pin === '1234') {
            localStorage.setItem('taxed_admin_auth', 'true');
            setIsAdmin(true);
            return true;
        }
        return false;
    };

    const adminLogout = () => {
        localStorage.removeItem('taxed_admin_auth');
        setIsAdmin(false);
    };

    return (
        <Router>
            <RouteHandler />
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'transparent' }}>
                <Navbar session={session} onSignOut={signOut} isAdmin={isAdmin} onAdminLogout={adminLogout} />
                <main style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: 64 }}>
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/calculator" element={session ? <Calculator session={session} /> : <Navigate to="/auth" replace />} />
                        <Route path="/auth" element={<Auth session={session} />} />
                        <Route path="/admin" element={<Admin isAdmin={isAdmin} onAdminLogin={adminLogin} onAdminLogout={adminLogout} />} />
                        <Route path="/understand-your-taxes" element={<UnderstandYourTaxes />} />
                        <Route path="/tax-calculator-take-home-pay" element={<TakeHomePayCalculator />} />
                        <Route path="/freelance-tax-calculator" element={<FreelanceTaxCalculator />} />
                        <Route path="/resources" element={<Resources />} />
                        <Route path="/privacy" element={<PrivacyPolicy />} />
                        <Route path="/terms" element={<TermsOfService />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
}
