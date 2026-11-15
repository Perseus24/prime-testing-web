"use client";

import { api } from "@/lib/api";
import { ArrowRight, Monitor, Smartphone } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type TestCase = {
    code: string;
    module: string;
    title: string;
    platform: string;
    priority: string;
    result: TestResult | null
    number_of_steps: number;
}

type TestResult = {
    test_case_id: number
    result: string
    notes: string
    severity: string
    frequency: string
    device: string
}

type TestCasesResponse = {
    data: TestCase[];
    // meta: Meta
}

const STATUS = {
    passed: { label: 'Pass', cls: 'bg-pass-bg text-pass' },
    failed: { label: 'Fail', cls: 'bg-fail-bg text-fail' },
    blocked: { label: 'Blocked', cls: 'bg-blocked-bg text-blocked' },
} as const;

export default function MyTestCasesPage() {
    const [activePlatform, setActivePlatform] = useState('all');
    const [testCases, setTestCases] = useState<TestCase[]>([]);
    useEffect(() => {
        const fetchTestCases = async () => {
            try {
                const res = await api('/test-cases', {
                    method: 'GET',
                });

                setTestCases((res as TestCase[]));
                // setMeta((res as TestCasesResponse).meta);
            } catch (err: any) {
                toast.error(err?.message ?? 'Could not fetch test cases.');
            }
        }

        fetchTestCases();
    }, [])


    const platformProgress = useMemo(() => {
        return [
            { key: 'all', title: 'All', total: testCases.length, done: testCases.filter(t => t.result).length },
            { key: 'web', title: 'Web', total: testCases.filter(t => t.platform === 'web').length, done: testCases.filter(t => t.platform === 'web' && t.result).length },
            { key: 'mobile', title: 'Mobile', total: testCases.filter(t => t.platform === 'mobile').length, done: testCases.filter(t => t.platform === 'mobile' && t.result).length },
        ]
    }, [testCases])

    const progressCounts = useMemo(() => {
        return [
            { key: 'passed', title: 'Passed', dot: 'bg-[#2E8B57]', count: testCases.filter(t => t.result?.result === 'passed').length },
            { key: 'failed', title: 'Failed', dot: 'bg-[#D9453B]', count: testCases.filter(t => t.result?.result === 'failed').length },
            { key: 'blocked', title: 'Blocked', dot: 'bg-[#E0A100]', count: testCases.filter(t => t.result?.result === 'blocked').length },
            { key: 'remaining', title: 'Remaining', dot: 'bg-line border border-[#8A909C]', count: testCases.filter(t => !t.result).length },
        ]
    }, [testCases])

    const visibleTestCases = useMemo(
        () => activePlatform === 'all' ? testCases : testCases.filter(t => t.platform === activePlatform),
        [testCases, activePlatform]
    );

    return (
        <div className="gap-7 flex flex-col max-w-7xl mx-auto py-5">
            <div className="flex justify-between items-center">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold">Your Test cases</h1>
                    <p className="text-sm text-gray-600">Run each test case on the platform shown, then mark the result. Your answers are automatically saved.</p>
                </div>
                <button className="flex items-center gap-2 bg-white border-primary border px-4 py-2 rounded-md text-primary text-[13px] font-medium">
                    <p>Review and submit</p>
                    <ArrowRight size={16} />
                </button>
            </div>

            <div className="flex flex-col gap-2 bg-white rounded-md p-6 border border-line">
                <p className="text-xs font-medium uppercase mb-2">Your progress</p>
                <div className="flex items-end gap-10">
                    <div className="flex flex-col gap-2 w-3/4">
                        <span>
                            <span className="text-2xl font-bold">{testCases.filter(t => t.result).length} of {testCases.length}</span>
                            <span className="text-sm text-gray-600"> test cases finished</span>
                        </span>
                        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-page">
                            {progressCounts
                                .filter((p) => p.key !== 'remaining')
                                .map((p) => (
                                    <div
                                        key={p.key}
                                        className={`h-full ${p.dot}`}
                                        style={{ width: `${testCases.length ? (p.count / testCases.length) * 100 : 0}%` }}
                                    />
                                ))}
                        </div>
                    </div>
                    <div className="flex gap-3 flex-grow">
                        {
                            platformProgress
                                .filter((p) => p.key !== 'all')
                                .map((p) => (
                                <div
                                    key={p.key}
                                    className="flex flex-col gap-1 bg-page px-3 py-2 rounded-md flex-1"
                                >
                                    <p className="text-xs">{p.title}</p>
                                    <span>
                                        <span className="text-lg font-bold">{p.done}</span>
                                        <span className="text-xs text-gray-600"> of {p.total}</span>
                                    </span>
                                </div>
                            ))
                        }
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {
                        progressCounts.map(p => (
                            <div
                                key={p.key}
                                className="flex items-center gap-2"
                            >
                                <div className={`${p.dot} h-3 w-3`} />
                                <p className="text-xs">{p.title}</p>
                                <p className="text-xs text-gray-600">{p.count}</p>
                            </div>
                        ))
                    }
                </div>
            </div>

            <div className="flex flex-col items-start gap-5 lg:flex-row">
                <section aria-label="Test cases" className="w-full min-w-0 flex-1 overflow-hidden rounded-md border border-line bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
                        <h2 className="text-lg font-semibold">Assigned to you</h2>
                        <div role="group" aria-label="Filter by platform" className="flex flex-wrap gap-2">
                            {platformProgress.map((p) => {
                                const isActive = activePlatform === p.key;
                                return (
                                    <button
                                        type="button"
                                        key={p.key}
                                        aria-pressed={isActive}
                                        onClick={() => setActivePlatform(p.key)}
                                        className={`min-h-10 rounded-full border px-4 text-[13px] font-medium ${
                                            isActive ? 'border-primary bg-primary text-white' : 'border-line bg-white text-ink'
                                        }`}
                                    >
                                        {p.title} · {p.total}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {visibleTestCases.length === 0 && (
                        <p className="border-t border-line px-6 py-10 text-center text-sm text-subtle">
                            No test cases for this platform yet.
                        </p>
                    )}

                    {visibleTestCases.map((tc) => {
                        const status = tc.result ? STATUS[tc.result.result as keyof typeof STATUS] : null;
                        return (
                            <div
                                key={tc.code}
                                className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-line px-4 py-4 sm:px-6"
                            >
                                <p className="w-14 shrink-0 text-[13px] font-semibold text-subtle">{tc.code}</p>

                                <div className="min-w-0 flex-1 basis-60">
                                    <p className="text-[15px] font-medium leading-snug">{tc.title}</p>
                                    <p className="text-[13px] text-subtle">
                                        {tc.module && `${tc.module} · `}{tc.number_of_steps} steps
                                    </p>
                                </div>

                                <div className="inline-flex items-center gap-1.5 rounded-full bg-page px-3 py-1.5 text-[13px] text-gray-700">
                                    {tc.platform === 'web' ? <Monitor className="h-3.5 w-3.5" /> : <Smartphone className="h-3.5 w-3.5" />}
                                    {tc.platform.charAt(0).toUpperCase() + tc.platform.slice(1)}
                                </div>

                                <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-[13px] font-semibold ${status ? status.cls : 'bg-page text-subtle'}`}>
                                    {status ? status.label : 'Not started'}
                                </span>

                                <Link
                                    href={`/test-cases/${tc.code}`}
                                    className={`inline-flex min-h-11 min-w-24 items-center justify-center rounded-[10px] border border-primary px-4 text-sm font-semibold ${
                                        tc.result ? 'bg-white text-primary' : 'bg-primary text-white'
                                    }`}
                                >
                                    {tc.result ? 'Review' : 'Start'}
                                </Link>
                            </div>
                        );
                    })}
                </section>

                <aside className="flex w-full min-w-0 flex-col gap-5 lg:w-80 lg:shrink-0">
                    <section className="flex flex-col gap-4 rounded-md border border-line bg-white p-6">
                        <h2 className="text-lg font-semibold">How to record a result</h2>
                        {[
                            { label: 'Pass', cls: 'bg-pass-bg text-pass', desc: 'It worked exactly as the expected result describes.' },
                            { label: 'Fail', cls: 'bg-fail-bg text-fail', desc: 'The result does not match the expected result.' },
                            { label: 'Blocked', cls: 'bg-blocked-bg text-blocked', desc: 'You could not run the test, for example a screen would not open.' },
                        ].map((r) => (
                            <div key={r.label} className="flex flex-col gap-1.5">
                                <span className={`w-fit rounded-full px-3 py-1 text-[13px] font-semibold ${r.cls}`}>{r.label}</span>
                                <p className="text-sm leading-relaxed text-gray-700">{r.desc}</p>
                            </div>
                        ))}
                    </section>

                    <section className="flex flex-col gap-3 rounded-md border border-line bg-white p-6">
                        <h2 className="text-lg font-semibold">Before you begin</h2>
                        <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-gray-700">
                            <li>Use the PRIME web dashboard for Web test cases and the PRIME mobile app for Mobile ones.</li>
                            <li>When something fails, note your device or browser so the team can reproduce it.</li>
                        </ul>
                    </section>
                </aside>
            </div>
        </div>
    )
}