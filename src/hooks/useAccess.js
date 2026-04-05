import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAccess(session) {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) {
      setHasAccess(false);
      setLoading(false);
      return;
    }

    supabase
      .from('profiles')
      .select('has_lifetime_access')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) console.error('Access check error:', error);
        setHasAccess(data?.has_lifetime_access ?? false);
        setLoading(false);
      });
  }, [session?.user?.id]);

  return { hasAccess, loading };
}
