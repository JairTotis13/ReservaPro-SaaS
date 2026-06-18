'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { signUpSchema } from '@/lib/validations';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFieldErrors({});

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    const result = signUpSchema.safeParse({ name, email, password });
    if (!result.success) {
      const formatted: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as string;
        if (!formatted[field]) formatted[field] = err.message;
      });
      setFieldErrors(formatted);
      return;
    }

    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: 'business_owner',
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setSuccess(
      'Account created! Please check your email for a confirmation link.'
    );
    setLoading(false);
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  }

  return (
    <div className="w-full max-w-md animate-slide-up">
      <div className="card-dark p-8">
        <h2 className="text-xl font-semibold text-white mb-6 text-center">
          Create your account
        </h2>

        {success ? (
          <div className="text-center space-y-4">
            <div className="rounded-lg bg-success/10 border border-success/30 px-4 py-4">
              <p className="text-sm text-success font-medium">{success}</p>
            </div>
            <Link
              href="/auth/login"
              className="btn-gold inline-block w-full py-2.5 rounded-lg text-sm text-center"
            >
              Go to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-dark-200 mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-dark"
                placeholder="John Doe"
              />
              {fieldErrors.name && (
                <p className="mt-1 text-sm text-danger">{fieldErrors.name}</p>
              )}
            </div>

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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-dark"
                placeholder="Min. 8 characters"
              />
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-danger">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark-200 mb-1.5">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-dark"
                placeholder="Re-enter your password"
              />
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-sm text-danger">{fieldErrors.confirmPassword}</p>
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
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        {!success && (
          <p className="mt-6 text-sm text-center text-dark-300">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-gold-500 hover:text-gold-400 transition-colors font-medium">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
