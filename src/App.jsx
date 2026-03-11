import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Calculator from './pages/Calculator';
import Resources from './pages/Resources';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

const SEO_MAP = {
    "/": {
        title: "ClearFile | Tax Navigation CRM",
        desc: "ClearFile is a visual Tax Navigation CRM. Model tax scenarios, discover hidden credits, and identify risks across any income level. Not a tax filing service."
    },
    "/calculator": {
        title: "Model Your Tax Scenario | ClearFile CRM",
        desc: "Instantly see how life changes affect your effective tax rate, take-home pay, and bracket exposure. ClearFile's tax modeling tool."
    },
    "/resources": {
        title: "Tax Resource Hub | ClearFile",
        desc: "Free tax knowledge for everyone. Explore IRS form walkthroughs, penalty abatement scripts, and compliance guides."
    },
    "/privacy": {
        title: "Privacy Policy | ClearFile",
        desc: "Read the ClearFile Privacy Policy. We do not store personal financial data or Social Security numbers."
    },
    "/terms": {
        title: "Terms of Service | ClearFile",
        desc: "ClearFile Terms of Service. ClearFile is an educational CRM tool, not tax advice or a filing service."
    }
};

function RouteHandler() {
    const { pathname } = useLocation();
    
    useEffect(() => {
        // Scroll to top
        window.scrollTo(0, 0);
        
        // Update SEO Tags
        const seo = SEO_MAP[pathname] || SEO_MAP["/"];
        document.title = seo.title;
        
        let metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute("content", seo.desc);
        }
        
        // Also update OG tags
        let ogTitle = document.querySelector('meta[property="og:title"]');
        let ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogTitle) ogTitle.setAttribute("content", seo.title);
        if (ogDesc) ogDesc.setAttribute("content", seo.desc);
    }, [pathname]);
    
    return null;
}

export default function App() {
    return (
        <Router>
            <RouteHandler />
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#FAFAF8' }}>
                <Navbar />
                {/* Main content area needs top padding to account for fixed navbar */}
                <main style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: 64 }}>
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/calculator" element={<Calculator />} />
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
