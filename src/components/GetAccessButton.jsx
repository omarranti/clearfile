import { useState } from 'react';

const font = { sans: "'DM Sans', system-ui, sans-serif" };

export default function GetAccessButton({ session }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!session?.user) return;
    setLoading(true);

    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          email: session.user.email,
        }),
      });

      const { url, error } = await res.json();
      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      window.location.href = url;
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      style={{
        background: '#1F3044',
        color: '#fff',
        border: 'none',
        borderRadius: 12,
        padding: '14px 24px',
        fontSize: 16,
        fontWeight: 700,
        fontFamily: font.sans,
        cursor: loading ? 'wait' : 'pointer',
        transition: 'all 0.15s',
        minHeight: 48,
      }}
    >
      {loading ? 'Loading...' : 'Get Full Access \u2014 $0.99'}
    </button>
  );
}
