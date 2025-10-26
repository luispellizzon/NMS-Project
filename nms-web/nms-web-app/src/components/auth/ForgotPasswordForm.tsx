// src/components/auth/ForgotPasswordForm.tsx

'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { sendPasswordReset } from '@/lib/firebase/auth-service';
import { CheckCircle, AlertTriangle } from 'lucide-react';

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [messageSent, setMessageSent] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        setMessageSent(false);

        try {
            await sendPasswordReset(email);
            setMessageSent(true);
        } catch (err: unknown) {
            if (typeof err === 'object' && err !== null && 'code' in err) {
                const errorCode = (err as { code: string }).code;
                if (errorCode === 'auth/user-not-found') {
                    setMessageSent(true);
                } else {
                    setError('An unexpected error occurred. Please try again.');
                }
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold text-foreground mb-2">
                Forgot Your Password?
            </h1>
            <p className="text-muted-foreground mb-8">
                No problem. Enter your email address and we&apos;ll send you a link to reset it.
            </p>

            {error && (
                <div className="mb-4 p-3 flex items-center gap-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
                    <AlertTriangle className="h-5 w-5" />
                    <span>{error}</span>
                </div>
            )}

            {messageSent ? (
                <div className="p-4 flex flex-col items-center text-center gap-4 bg-success/10 border border-success/20 rounded-lg text-success">
                    <CheckCircle className="h-10 w-10" />
                    <div>
                        <h3 className="font-semibold text-foreground">Check your inbox</h3>
                        <p className="text-sm">If an account with that email exists, we&apos;ve sent a password reset link.</p>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                            Email address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="Enter your email"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#0d7377] hover:bg-[#0a5c5f] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Sending Link...' : 'Send Reset Link'}
                    </button>
                </form>
            )}

            <p className="text-center text-sm text-muted-foreground mt-6">
                Remembered your password?{' '}
                <Link href="/signin" className="text-ring font-medium hover:underline">
                    Sign In
                </Link>
            </p>
        </div>
    );
}