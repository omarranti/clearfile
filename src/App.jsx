import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Calculator from './pages/Calculator';
import Resources from './pages/Resources';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Auth from './pages/Auth';
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
        if (ogTitle) ogTitle.setAttribute("content", seo.title);
        if (ogDesc) ogDesc.setAttribute("content", seo.desc);
    }, [pathname]);
    
    return null;
}

export default function App() {
    const [session, setSession] = useState(null);

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

    return (
        <Router>
            <RouteHandler />
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'transparent' }}>
                <Navbar session={session} onSignOut={signOut} />
                <main style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: 64 }}>
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/calculator" element={session ? <Calculator /> : <Navigate to="/auth" replace />} />
                        <Route path="/auth" element={<Auth session={session} />} />
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
