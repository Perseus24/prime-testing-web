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
            router.push(res.tester.role === 'admin' ? '/admin/test-cases' : '/tests');
        } catch (err: any) {
            setError(err?.errors?.code?.[0] ?? 'Could not sign in.');
        }
    }

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-white">
            <div className="flex max-w-5xl mx-auto max-h-5xl my-auto bg-page rounded-lg">
                <div className="w-1/2 bg-primary flex flex-col gap-12 p-16 rounded-l-lg">
                    <div className="flex flex-col">
                        <p className="text-lg font-bold text-white">PRIME</p>
                        <p className="text-sm text-white">Pilot Testing Portal</p>
                    </div>

                    <section className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold text-white">Pilot Testing for PRIME</h1>
                        <p className="text-sm text-white mt--12">
                            Work through each test case on the PRIME web dashboard and mobile app, 
                            then record whether it passed or failed.
                        </p>
                    </section>

                    <section className="flex flex-col gap-3">
                        {
                            STEPS.map((step, i) => (
                                <div
                                    key={i}
                                    className="flex rounded-md border-[0.1px] border-line py-4 px-5 gap-4"
                                >
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white">
                                        <p className="text-sm font-bold text-primary">{i + 1}</p>
                                    </div>

                                    <div className="flex flex-col ">
                                        <p className="text-white font-semibold text-sm">{step.title}</p>
                                        <p className="text-[13px] text-white">{step.description}</p>
                                    </div>
                                </div>
                            ))
                        }
                    </section>

                    <p className="text-xs text-line">Promoting Resilient Innovation for Microenterprise Empowerment</p>
                </div>
                
                <div className="w-1/2 flex flex-col justify-center items-center gap-4 px-12 py-8 rounded-r-lg">
                    <form className="flex flex-col gap-4 bg-white rounded-md p-10 gap-8 shadow-md">
                        <div className="flex flex-col gap-1">
                            <p className="text-lg font-semibold">Sign in to start testing</p>
                            <p className="text-sm text-gray-500">
                                You can find your tester ID and access code from the PRIME team.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="code" className="font-medium text-sm">Tester ID</label>
                            <input className="border-[0.5px] rounded-md px-4 py-2" id="code" value={code} onChange={(e) => setCode(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="access" className="font-medium text-sm">Access code</label>
                            <input className="border-[0.5px] rounded-md px-4 py-2" id="access" type="password" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} />
                        </div>
                        {error && <p role="alert">{error}</p>}
                        <button
                            onClick={submit} 
                            className="bg-primary text-white py-3 font-semibold rounded-lg flex items-center justify-center" 
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