"use client";

import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

type Status = 'passed' | 'failed' | 'blocked' | null;
type Row = { code: string; title: string; platform: 'web' | 'mobile'; results: Status[] }; // one result per tester, same order as TESTERS
type Tester = {
    code: string
    name: string
}
type Response = {
    data: Row[];
    testers: Tester[]
}
const SYMBOL: Record<string, Status> = { P: 'passed', F: 'failed', B: 'blocked', '-': null };

const CELL = {
    passed: { sym: 'P', label: 'Passed', cls: 'bg-pass-bg text-pass' },
    failed: { sym: 'F', label: 'Failed', cls: 'bg-fail-bg text-fail' },
    blocked: { sym: 'B', label: 'Blocked', cls: 'bg-blocked-bg text-blocked' },
};
const NOT_TESTED = { sym: '–', label: 'Not tested', cls: 'bg-page text-subtle' };
const LEGEND = [...Object.values(CELL), NOT_TESTED];

const count = (list: Status[], s: Status) => list.filter((x) => x === s).length;

export default function ResultsPage() {
    const [testCases, setTestCases] = useState<Row[]>([]);
    const [testers, setTesters] = useState<{ code: string; name: string }[]>([]);

    const stats = useMemo(() => {
        const all = testCases.flatMap((t) => t.results);
        const passed = count(all, 'passed');
        const failed = count(all, 'failed');
        const blocked = count(all, 'blocked');
        const recorded = passed + failed + blocked;

        const progress = testers.map((code, i) => {
            const done = testCases.filter((t) => t.results[i]).length;
            return { code, done, full: done === testCases.length };
        });

        const attention = testCases
            .map((t) => ({ t, failed: count(t.results, 'failed'), blocked: count(t.results, 'blocked') }))
            .filter((x) => x.failed > 0 || x.blocked > 0)
            .sort((a, b) => b.failed - a.failed || b.blocked - a.blocked)
            .slice(0, 5);

        return {
            passed, failed, blocked, recorded,
            passRate: recorded ? Math.round((passed / recorded) * 100) : 0,
            failedCases: testCases.filter((t) => t.results.includes('failed')).length,
            blockedCases: testCases.filter((t) => t.results.includes('blocked')).length,
            testersDone: progress.filter((p) => p.full).length,
            progress,
            attention,
        };
    }, [testCases, testers]);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await api('/admin/results', {
                    method: 'GET',
                });

                setTestCases((res as Response).data)
                setTesters((res as Response).testers)
            } catch (err: any) {
                toast.error(err?.message ?? 'Could not fetch test cases.');
            }
        }

        fetchResults();
    }, [])

    const summary = [
        { title: 'Testers finished', value: stats.testersDone, note: `of ${testers.length}`, color: '' },
        { title: 'Pass rate', value: `${stats.passRate}%`, note: `of ${stats.recorded} results`, color: 'text-pass' },
        { title: 'Failed', value: stats.failed, note: `across ${stats.failedCases} test cases`, color: 'text-fail' },
        { title: 'Blocked', value: stats.blocked, note: `across ${stats.blockedCases} test cases`, color: 'text-blocked' },
    ];

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-4 py-5 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-3xl font-bold">Pilot results</h1>
                    </div>
                    <p className="text-sm text-gray-600">
                        Aggregates the results from all the tester's sessions.
                    </p>
                </div>
                <button
                    type="button"
                    className="flex w-fit items-center gap-2 rounded-md border border-primary bg-white px-4 py-2.5 text-[13px] font-medium text-primary"
                >
                    <Download size={16} />
                    Export results
                </button>
            </div>

            <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {summary.map((s) => (
                    <div key={s.title} className="rounded-md border border-line bg-white px-6 py-5">
                        <p className="text-[13px] text-subtle">{s.title}</p>
                        <p className={`text-3xl font-semibold ${s.color}`}>
                            {s.value} <span className="text-[13px] font-normal text-subtle">{s.note}</span>
                        </p>
                    </div>
                ))}
            </section>

            <div className="flex flex-col items-start gap-5 xl:flex-row">
                <section aria-label="Results matrix" className="flex w-full min-w-0 flex-1 flex-col gap-4 rounded-md border border-line bg-white p-4 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                        <h2 className="text-lg font-semibold">Test cases by tester</h2>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-gray-700">
                            {LEGEND.map((l) => (
                                <span key={l.label} className="inline-flex items-center gap-1.5">
                                    <span className={`grid h-[22px] w-[22px] place-items-center rounded-md text-xs font-bold ${l.cls}`}>{l.sym}</span>
                                    {l.label}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <div className="flex min-w-[860px] flex-col gap-1.5">
                            <div className="flex items-center gap-1.5 border-b border-line pb-1.5 text-xs font-semibold text-subtle">
                                <p className="w-14 shrink-0">ID</p>
                                <p className="min-w-60 flex-1">Test case</p>
                                {testers.map((t) => (
                                    <p key={t.code} className="w-10 shrink-0 text-center">{t.code}</p>
                                ))}
                            </div>

                            {testCases.map((tc) => (
                                <div key={tc.code} className="flex items-center gap-1.5 py-1">
                                    <p className="w-14 shrink-0 text-[13px] font-semibold text-subtle">{tc.code}</p>
                                    <div className="min-w-60 flex-1">
                                        <p className="text-sm font-medium leading-snug">{tc.title}</p>
                                        <p className="text-xs capitalize text-subtle">{tc.platform}</p>
                                    </div>
                                    {tc.results.map((res, i) => {
                                        const cell = res ? CELL[res] : NOT_TESTED;
                                        return (
                                            <span
                                                key={testers[i].code}
                                                role="img"
                                                aria-label={`Tester ${testers[i]}, ${tc.code}: ${cell.label}`}
                                                className={`grid h-9 w-10 shrink-0 place-items-center rounded-lg text-[13px] font-bold ${cell.cls}`}
                                            >
                                                {cell.sym}
                                            </span>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <aside className="flex w-full min-w-0 flex-col gap-5 xl:w-80 xl:shrink-0">
                    <section className="flex flex-col gap-4 rounded-md border border-line bg-white p-6">
                        <h2 className="text-lg font-semibold">Needs attention</h2>
                        <p className="text-[13px] leading-relaxed text-subtle">
                            Test cases with the most failures, out of {testers.length} testers.
                        </p>
                        {stats.attention.map(({ t, failed, blocked }) => (
                            <div key={t.code} className="flex flex-col gap-2 border-t border-line pt-3.5">
                                <div className="flex items-baseline gap-2.5">
                                    <span className="shrink-0 text-[13px] font-semibold text-subtle">{t.code}</span>
                                    <span className="text-sm font-medium leading-snug">{t.title}</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-page">
                                    <div className="h-full rounded-full bg-[#D9453B]" style={{ width: `${(failed / testers.length) * 100}%` }} />
                                </div>
                                <p className="text-[13px] text-gray-700">{failed} failed · {blocked} blocked</p>
                            </div>
                        ))}
                    </section>

                    <section className="flex flex-col gap-4 rounded-md border border-line bg-white p-6">
                        <h2 className="text-lg font-semibold">Tester progress</h2>
                        {stats.progress.map((p) => (
                            <div key={p.code.code} className="flex flex-wrap items-center gap-x-3 gap-y-2">
                                <p className="w-9 shrink-0 text-[13px] font-semibold text-subtle">{p.code.code}</p>
                                <div className="h-2 min-w-24 flex-1 overflow-hidden rounded-full bg-line">
                                    <div className="h-full rounded-full bg-primary" style={{ width: `${(p.done / testCases.length) * 100}%` }} />
                                </div>
                                <p className="w-16 shrink-0 text-[13px] text-gray-700">{p.done} of {testCases.length}</p>
                                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${p.full ? 'bg-pass-bg text-pass' : 'bg-primary-tint text-primary'}`}>
                                    {p.full ? 'Finished' : 'In progress'}
                                </span>
                            </div>
                        ))}
                    </section>
                </aside>
            </div>
        </div>
    );
}