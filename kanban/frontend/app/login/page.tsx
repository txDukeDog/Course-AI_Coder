'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        setError('Invalid username or password.');
        return;
      }
      const data = await res.json();
      login(data.token);
      router.push('/');
    } catch {
      setError('Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm border border-gray-100">
        <div className="mb-6">
          <h1 className="text-[#032147] text-2xl font-bold">Sign in</h1>
          <p className="text-[#888888] text-sm mt-1">Kanban Project Board</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-[#032147] mb-1">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#209dd7] text-[#032147] placeholder-[#888888]"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#032147] mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#209dd7] text-[#032147]"
            />
          </div>
          {error && <p role="alert" className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-[#753991] text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-[#5e2d75] transition-colors disabled:opacity-60 cursor-pointer"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
