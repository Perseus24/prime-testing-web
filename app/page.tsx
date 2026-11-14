'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ArrowRight } from 'lucide-react';
import { setSession } from '@/lib/session';

const STEPS = [
    {
        title: 'Sign In',
        description: 'Use the tester ID and access code from the PRIME team.',
    },
    {
        title: 'Run each test case',
        description: 'Follow the steps to reproduce, then mark Pass, Fail or Blocked.',
    },
    {
        title: 'Submit your results',
        description: 'Review your inputs and submit your results.',
    }
]
export default function SignIn() {
    const router = useRouter();
    const [code, setCode] = useState('');
    const [accessCode, setAccessCode] = useState('');
    const [error, setError] = useState('');

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        try {
            const res = await api<{ token: string; tester: { role: string } }>('/login', {
                method: 'POST',
                body: JSON.stringify({ code, access_code: accessCode }),
            });
            setSession(res.token, res.tester.role);
            router.push(res.tester.role === 'admin' ? '/admin' : '/tests');
        } catch (err: any) {
            setError(err?.errors?.code?.[0] ?? 'Could not sign in.');
        }
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-white md:p-6">
            <div className="flex w-full max-w-5xl flex-col overflow-hidden bg-page md:flex-row md:rounded-lg">
                <div className="flex w-full flex-col gap-8 bg-primary p-6 sm:p-10 md:w-1/2 md:gap-12 md:p-16">
                    <div className="flex flex-col">
                        <p className="text-lg font-bold text-white">PRIME</p>
                        <p className="text-sm text-white/80">Pilot Testing Portal</p>
                    </div>

                    <section className="flex flex-col gap-2">
                        <h1 className="text-2xl font-bold text-white sm:text-3xl">Pilot Testing for PRIME</h1>
                        <p className="text-sm leading-relaxed text-white/80">
                            Work through each test case on the PRIME web dashboard and mobile app,
                            then record whether it passed or failed.
                        </p>
                    </section>

                    <section className="hidden flex-col gap-3 md:flex">
                        {
                            STEPS.map((step, i) => (
                                <div
                                    key={i}
                                    className="flex gap-4 rounded-md border border-white/20 px-5 py-4"
                                >
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white">
                                        <p className="text-sm font-bold text-primary">{i + 1}</p>
                                    </div>

                                    <div className="flex flex-col">
                                        <p className="text-sm font-semibold text-white">{step.title}</p>
                                        <p className="text-[13px] text-white/80">{step.description}</p>
                                    </div>
                                </div>
                            ))
                        }
                    </section>

                    <p className="hidden text-xs text-white/60 md:block">Promoting Resilient Innovation for Microenterprise Empowerment</p>
                </div>

                <div className="flex w-full flex-col items-center justify-center px-4 py-8 sm:px-10 md:w-1/2 md:px-12">
                    <form className="flex w-full max-w-md flex-col gap-6 rounded-md bg-white p-6 shadow-md sm:p-10">
                        <div className="flex flex-col gap-1">
                            <p className="text-lg font-semibold">Sign in to start testing</p>
                            <p className="text-sm text-gray-500">
                                You can find your tester ID and access code from the PRIME team.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="code" className="text-sm font-medium">Tester ID</label>
                            <input
                                className="w-full rounded-md border border-gray-300 px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                id="code" value={code} onChange={(e) => setCode(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="access" className="text-sm font-medium">Access code</label>
                            <input
                                className="w-full rounded-md border border-gray-300 px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                id="access" type="password" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} />
                        </div>
                        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
                        <button
                            onClick={submit}
                            className="flex w-full items-center justify-center rounded-lg bg-primary py-3 font-semibold text-white transition hover:opacity-90"
                            type="submit">
                            Start testing
                            <ArrowRight className="ml-2" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}