'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { signInSchema } from '@/lib/validations';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const result = signInSchema.safeParse({ email, password });
    if (!result.success) {
      const formatted: { email?: string; password?: string } = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as 'email' | 'password';
        if (!formatted[field]) formatted[field] = err.message;
      });
      setFieldErrors(formatted);
      return;
    }

    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    window.location.href = '/dashboard';
  }

  return (
    <div className="w-full max-w-md animate-slide-up">
      <div className="card-dark p-8">
        <h2 className="text-xl font-semibold text-white mb-6 text-center">
          Welcome back
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-dark-200 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-dark"
              placeholder="you@example.com"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-danger">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-dark-200 mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-dark"
              placeholder="Enter your password"
            />
            {fieldErrors.password && (
              <p className="mt-1 text-sm text-danger">{fieldErrors.password}</p>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-danger/10 border border-danger/30 px-4 py-3">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full py-2.5 rounded-lg text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => setError('Please contact support at help@reservapro.com to reset your password.')}
            className="text-sm text-dark-200 hover:text-gold-500 transition-colors cursor-pointer"
          >
            Forgot your password?
          </button>

          <p className="text-sm text-dark-300">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-gold-500 hover:text-gold-400 transition-colors font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
