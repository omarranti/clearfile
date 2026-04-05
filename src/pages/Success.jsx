import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { markFunnelStep } from '../lib/funnelMetrics';

const font = { serif: "'DM Serif Display', Georgia, serif", sans: "'DM Sans', system-ui, sans-serif" };

export default function Success() {
  const navigate = useNavigate();

  useEffect(() => {
    markFunnelStep('purchase_completed');
    const timer = setTimeout(() => navigate('/calculator'), 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      textAlign: 'center',
    }}>
      <h1 style={{
        fontFamily: font.serif,
        fontSize: 'clamp(32px, 5vw, 48px)',
        color: '#1F3044',
        margin: '0 0 16px',
      }}>
        You're in.
      </h1>
      <p style={{
        fontFamily: font.sans,
        fontSize: 18,
        color: '#4f6478',
        maxWidth: 480,
        lineHeight: 1.6,
      }}>
        Full access unlocked. Taking you to your dashboard now.
      </p>
    </div>
  );
}
