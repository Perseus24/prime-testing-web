'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CircleAlert, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { setSession } from '@/lib/session';

const STEPS = ['Sign in', 'Run tests', 'Submit'];
const RINGS = [1, 1.7, 2.4, 3.1, 3.8, 4.5, 5.2, 5.9];

export default function SignIn() {
    const router = useRouter();
    const [code, setCode] = useState('');
    const [accessCode, setAccessCode] = useState('');
    const [showCode, setShowCode] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        try {
        setIsSubmitting(true);
        const res = await api<{ token: string; tester: { role: string } }>('/login', {
            method: 'POST',
            body: JSON.stringify({ code, access_code: accessCode }),
        });
        setSession(res.token, res.tester.role);
        router.push(res.tester.role === 'admin' ? '/admin/test-cases' : '/tests');
        } catch (err: any) {
        setError(err?.errors?.code?.[0] ?? 'Could not sign in.');
        } finally {
        setIsSubmitting(false);
        }
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-page text-ink">
        {/* contour lines, like the elevation lines on a hazard map */}
        <svg
            aria-hidden="true"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="xMaxYMid slice"
            className="pointer-events-none absolute inset-0 h-full w-full text-primary/10 lg:text-primary/15 [mask-image:linear-gradient(to_right,transparent,black_55%)]"
        >
            <defs>
            <path
                id="contour-ring"
                d="M 0 -100 C 60 -105 120 -70 130 -10 C 140 55 95 105 30 110 C -45 118 -125 85 -128 15 C -130 -55 -65 -96 0 -100 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
            />
            </defs>
            {RINGS.map((s, i) => (
            <use
                key={s}
                href="#contour-ring"
                transform={`translate(${760 + i * 5} ${620 - i * 3}) scale(${s})`}
            />
            ))}
        </svg>

        <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-6 sm:px-8">
            <header className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-white">
                <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="leading-tight">
                <p className="text-sm font-bold">PRIME</p>
                <p className="text-xs text-muted">Pilot Test Portal</p>
            </div>
            </header>

            <main className="flex flex-1 items-center py-10">
            <div className="w-full max-w-md">
                <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
                Sign in to start testing
                </h1>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">
                Use the tester ID and access code the PRIME team sent you.
                </p>

                <ol aria-label="What happens next" className="mt-6 flex items-center gap-3 text-xs">
                {STEPS.map((label, i) => (
                    <li key={label} className="flex items-center gap-3">
                    <span
                        aria-current={i === 0 ? 'step' : undefined}
                        className={`flex items-center gap-2 ${i === 0 ? 'font-semibold text-primary' : 'text-muted'}`}
                    >
                        <span
                        className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-semibold ${
                            i === 0 ? 'bg-primary text-white' : 'border border-muted/50'
                        }`}
                        >
                        {i + 1}
                        </span>
                        {label}
                    </span>
                    {i < STEPS.length - 1 && <span aria-hidden="true" className="h-px w-6 bg-muted/40" />}
                    </li>
                ))}
                </ol>

                <form onSubmit={submit} className="mt-8 flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="tester-id" className="text-sm font-medium">Tester ID</label>
                    <input
                    id="tester-id"
                    required
                    autoComplete="username"
                    autoCapitalize="off"
                    spellCheck={false}
                    placeholder="e.g. T-04"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="h-12 w-full rounded-xl border border-line bg-white px-4 text-[15px] outline-none transition placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="access-code" className="text-sm font-medium">Access code</label>
                    <div className="relative">
                    <input
                        id="access-code"
                        required
                        type={showCode ? 'text' : 'password'}
                        autoComplete="current-password"
                        spellCheck={false}
                        placeholder="Enter your access code"
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value)}
                        className="h-12 w-full rounded-xl border border-line bg-white pl-4 pr-12 text-[15px] outline-none transition placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                        type="button"
                        onClick={() => setShowCode((v) => !v)}
                        aria-label={showCode ? 'Hide access code' : 'Show access code'}
                        className="absolute right-1 top-1 grid h-10 w-10 place-items-center rounded-lg text-muted hover:text-ink"
                    >
                        {showCode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                    </div>
                </div>

                {error && (
                    <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-fail/20 bg-fail-bg px-4 py-3 text-sm text-fail"
                    >
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{error}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[15px] font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing in...
                    </>
                    ) : (
                    <>
                        Start testing
                        <ArrowRight className="h-4 w-4" />
                    </>
                    )}
                </button>
                </form>

                <p className="mt-6 text-sm text-muted">
                Lost your access code? Ask the PRIME team to send you a new one.
                </p>
            </div>
            </main>

            <footer className="text-xs text-muted">
                Promoting Resilient Innovation for Microenterprise Empowerment
            </footer>
        </div>
        </div>
    );
}