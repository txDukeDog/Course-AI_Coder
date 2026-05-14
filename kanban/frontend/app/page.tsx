'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Board from '@/components/Board';

export default function Home() {
  const { token, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (token === null) router.replace('/login');
  }, [token, router]);

  function handleLogout() {
    logout();
    router.push('/login');
  }

  if (!token) return null;
  return <Board onLogout={handleLogout} />;
}
