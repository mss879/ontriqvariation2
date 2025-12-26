'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Lock, Mail } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const supabaseConfigured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const nextPath = useMemo(() => searchParams.get('next') || '/admin', [searchParams]);

  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState<string>('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabaseConfigured) {
      setStatus('error');
      setError('Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
      return;
    }

    setStatus('loading');
    setError('');

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await res.json().catch(() => null)) as null | { ok?: boolean; error?: string };
      if (!res.ok || payload?.ok === false) {
        throw new Error(payload?.error || 'Login failed');
      }

      router.replace(nextPath);
      router.refresh();
    } catch (e) {
      setStatus('error');
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setStatus((s) => (s === 'loading' ? 'idle' : s));
    }
  }

  return (
    <main className="min-h-screen bg-white pt-32 pb-24 text-slate-900 md:pt-40 md:pb-28">
      <div className="mx-auto w-full max-w-[1440px] px-4 md:px-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div className="space-y-4">
              <h1 className="text-[44px] font-semibold tracking-tight text-slate-900 md:text-6xl lg:text-7xl leading-[1.1]">
                Admin <span className="text-slate-400">Login.</span>
              </h1>
              <p className="max-w-[540px] text-base text-slate-500 md:text-lg leading-relaxed">
                Sign in to manage inquiries and move leads through your CRM pipelines.
              </p>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm">
              {!supabaseConfigured ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700">
                  <p className="font-semibold text-slate-900">Supabase is not configured.</p>
                  <p className="mt-2 text-slate-600">
                    Create a <span className="font-medium">.env.local</span> file and set:
                  </p>
                  <ul className="mt-3 space-y-1 text-slate-600">
                    <li>NEXT_PUBLIC_SUPABASE_URL</li>
                    <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                  </ul>
                  <p className="mt-3 text-slate-600">Then restart the dev server.</p>
                </div>
              ) : null}

              <form className="space-y-6" onSubmit={onSubmit} aria-label="Admin login">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="admin@ontriq.com"
                      className="h-12 rounded-2xl bg-slate-50 border-slate-200 pl-12 focus-visible:ring-[#F75834]"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      className="h-12 rounded-2xl bg-slate-50 border-slate-200 pl-12 focus-visible:ring-[#F75834]"
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#F75834] px-8 py-4 text-base font-semibold text-white transition-all hover:bg-[#e04826] focus:outline-none focus:ring-2 focus:ring-[#F75834] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === 'loading' ? 'Signing in...' : 'Sign in'}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </button>

                {error ? (
                  <p role="status" aria-live="polite" className="text-sm text-red-600">
                    {error}
                  </p>
                ) : (
                  <p className="text-sm text-slate-500">
                    No account creation here — admin users are created in Supabase.
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
