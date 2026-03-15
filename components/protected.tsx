'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';

export function Protected({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace('/login');
      setLoading(false);
    });
  }, [router]);
  if (loading) return <div className='grid'>{Array.from({ length: 4 }).map((_, i) => <div className='skeleton' key={i} />)}</div>;
  return <>{children}</>;
}
