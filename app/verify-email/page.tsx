'use client';

/**
 * Travel Planet (Voyage8) — Email Verification & Resend Console
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mail, CheckCircle, AlertCircle, RefreshCw, Plane, ArrowRight } from 'lucide-react';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  // Resend state
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Auto-verify if token is provided in URL
  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    setVerifying(true);
    setError('');

    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.status === true || data.user?.emailVerified) {
          setVerified(true);
        } else if (data.error) {
          setError(data.error.message || 'This verification link is invalid or has expired.');
        } else {
          setVerified(true);
        }
      })
      .catch(() => {
        if (isMounted) setError('Network error verifying your email. Please try again.');
      })
      .finally(() => {
        if (isMounted) setVerifying(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Cooldown timer effect
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail || resendCooldown > 0) return;

    setResending(true);
    setResendSuccess('');
    setError('');

    try {
      const res = await fetch('/api/auth/send-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.status !== false) {
        setResendSuccess('A new verification link has been sent to your inbox.');
        setResendCooldown(45); // 45 seconds cooldown
      } else {
        setError(data.error?.message || "We couldn't complete that request. Please try again.");
      }
    } catch {
      setError("We couldn't complete that request. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-600/20 text-sky-400 border border-sky-500/30 mb-4 shadow-lg shadow-sky-500/10">
          <Plane className="w-7 h-7 transform -rotate-45" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          Verify your email address
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Confirm your identity to secure itineraries and booking operations
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/90 py-8 px-6 shadow-2xl rounded-2xl border border-slate-800 sm:px-10 backdrop-blur-xl">
          {verifying && (
            <div className="text-center py-8">
              <div className="w-10 h-10 border-3 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white">Verifying your email...</h3>
              <p className="text-xs text-slate-400 mt-1">Please wait while we validate your security token.</p>
            </div>
          )}

          {!verifying && verified && (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Email Verified Successfully</h3>
              <p className="text-sm text-slate-300 mb-6">
                Your email has been confirmed. You can now access your travel space, manage bookings, and communicate with consultants.
              </p>
              <Link
                href="/login"
                className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 transition"
              >
                <span>Continue to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {!verifying && !verified && (
            <div>
              {error && (
                <div className="mb-6 rounded-lg bg-rose-500/10 border border-rose-500/30 p-4 text-sm text-rose-300 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {resendSuccess && (
                <div className="mb-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-4 text-sm text-emerald-300 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" />
                  <span>{resendSuccess}</span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Need a new verification link?</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your email address below and we will dispatch a fresh verification link.
                </p>
              </div>

              <form onSubmit={handleResend} className="space-y-4">
                <div>
                  <label htmlFor="resendEmail" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    id="resendEmail"
                    type="email"
                    required
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="traveler@domain.com"
                    className="mt-1 block w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={resending || resendCooldown > 0}
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {resending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending link...</span>
                    </>
                  ) : resendCooldown > 0 ? (
                    <span>Resend in {resendCooldown}s</span>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Resend Verification Email</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-800 text-center">
                <Link href="/login" className="text-xs text-slate-400 hover:text-white transition">
                  ← Back to Sign in
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
