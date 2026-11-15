"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Ban, CircleCheck, CircleX, Loader2, Monitor, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { priorityClass } from "@/lib/priority";

type Result = 'passed' | 'failed' | 'blocked';

type TestCase = {
    code: string;
    title: string;
    module: string | null;
    platform: 'web' | 'mobile';
    priority: string;
    preconditions: string[];
    steps: string[];
    expected: string[];
    result: { result: Result; notes: string | null; severity: string | null; frequency: string | null; device: string | null } | null;
};

type Form = {
    done: boolean[];
    result: Result | null;
    notes: string;
    severity: string;
    frequency: string;
    device: string;
};

const RESULTS = [
    { key: 'passed', label: 'Pass', Icon: CircleCheck, on: 'border-[#2E8B57] bg-pass-bg text-pass' },
    { key: 'failed', label: 'Fail', Icon: CircleX, on: 'border-[#D9453B] bg-fail-bg text-fail' },
    { key: 'blocked', label: 'Blocked', Icon: Ban, on: 'border-[#E0A100] bg-blocked-bg text-blocked' },
] as const;

const SEVERITY = [
    { key: 'minor', label: 'Minor', hint: 'A small problem. I could still finish the task.' },
    { key: 'major', label: 'Major', hint: 'It got in the way of finishing the task.' },
    { key: 'critical', label: 'Critical', hint: 'I could not continue, or the app closed unexpectedly.' },
];

const FREQUENCY = [
    { key: 'every', label: 'Every time' },
    { key: 'sometimes', label: 'Sometimes' },
    { key: 'once', label: 'Only once' },
];

const NOTE_LABEL = { none: 'Comments (optional)', passed: 'Comments (optional)', failed: 'What actually happened?', blocked: 'What stopped you?' };
const NOTE_HOLDER = {
    none: 'Anything the team should know about this test case',
    passed: 'Anything the team should know about this test case',
    failed: 'Describe what you saw instead of the expected result',
    blocked: 'Tell us which step you could not reach and why',
};
const RESULT_HINT = {
    none: 'Choose Pass, Fail or Blocked after you finish the steps.',
    passed: 'Everything matched the expected result.',
    failed: 'Tell us what went wrong so the team can reproduce it.',
    blocked: 'You could not complete the steps. Say why below.',
};

const inputClass =
    "w-full rounded-xl border border-gray-400 bg-white px-4 text-[15px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

const draftKey = (code: string) => `prime-draft:${code}`;

function readDraft(code: string): Form | null {
    try {
        const raw = localStorage.getItem(draftKey(code));
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}
function writeDraft(code: string, form: Form) {
    try { localStorage.setItem(draftKey(code), JSON.stringify(form)); } catch { }
}
function clearDraft(code: string) {
    try { localStorage.removeItem(draftKey(code)); } catch { }
}

export default function RunTestCasePage() {
    const { code } = useParams<{ code: string }>();
    const router = useRouter();

    const [tc, setTc] = useState<TestCase | null>(null);
    const [form, setForm] = useState<Form | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await api<TestCase>(`/test-cases/${code}`, { method: 'GET' });
                const draft = readDraft(code);

                setTc(data);
                setForm({
                    done: data.steps.map((_, i) => draft ? !!draft.done?.[i] : !!data.result),
                    result: draft ? draft.result : data.result?.result ?? null,
                    notes: draft ? draft.notes : data.result?.notes ?? '',
                    severity: draft ? draft.severity : data.result?.severity ?? 'major',
                    frequency: draft ? draft.frequency : data.result?.frequency ?? 'every',
                    device: draft ? draft.device : data.result?.device ?? '',
                });
            } catch (err: any) {
                toast.error(err?.message ?? 'Could not load this test case.');
                router.push('/tests');
            }
        };
        load();
    }, [code, router]);

    if (!tc || !form) {
        return <p className="mx-auto max-w-7xl px-4 py-10 text-sm text-subtle sm:px-6">Loading test case…</p>;
    }

    // every change goes through here, so the draft is always up to date
    function change(patch: Partial<Form>) {
        const next = { ...form!, ...patch };
        setForm(next);
        writeDraft(code, next);
    }

    function toggleStep(i: number) {
        change({ done: form!.done.map((d, idx) => (idx === i ? !d : d)) });
    }

    function saveDraft() {
        writeDraft(code, form!);
        toast.success('Draft saved on this device');
        router.push('/tests');
    }

    async function submit() {
        const f = form!;
        if (!f.result) return toast.error('Choose Pass, Fail or Blocked first.');
        if (f.result !== 'passed' && !f.notes.trim()) {
            return toast.error(f.result === 'failed' ? 'Tell us what actually happened.' : 'Tell us what stopped you.');
        }
        if (f.result === 'failed' && !f.device.trim()) return toast.error('Add the device or browser you used.');

        const isFail = f.result === 'failed';
        const payload = {
            result: f.result,
            notes: f.notes.trim() || null,
            severity: isFail ? f.severity : null,
            frequency: isFail ? f.frequency : null,
            device: isFail ? f.device.trim() : null,
        };

        try {
            setIsSubmitting(true);
            await api(`/test-cases/${code}/result`, { method: 'POST', body: JSON.stringify(payload) });
            clearDraft(code);
            toast.success('Result saved');
            router.push('/tests');
        } catch (err: any) {
            const firstValidationError = err?.errors
                ? (Object.values(err.errors) as string[][])[0]?.[0]
                : null;
            toast.error(firstValidationError ?? err?.message ?? 'Could not save your result.');
        } finally {
            setIsSubmitting(false);
        }
    }

    const stepsDone = form.done.filter(Boolean).length;
    const key = form.result ?? 'none';
    const isFail = form.result === 'failed';

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
                <button type="button" onClick={() => router.push('/tests')} className="font-medium text-primary">
                    My test cases
                </button>
                <span aria-hidden className="text-subtle">/</span>
                <span className="text-gray-700">{tc.code}</span>
            </nav>

            <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary px-3 py-1.5 text-[13px] font-semibold text-white">{tc.code}</span>
                    {tc.module && (
                        <span className="rounded-full border border-line bg-white px-3 py-1 text-[13px] text-gray-700">{tc.module}</span>
                    )}
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1 text-[13px] text-gray-700">
                        {tc.platform === 'web' ? <Monitor className="h-3.5 w-3.5" /> : <Smartphone className="h-3.5 w-3.5" />}
                        {tc.platform === 'web' ? 'Web' : 'Mobile app'}
                    </span>
                    <span className={`rounded-full px-3 py-1.5 text-[13px] font-medium capitalize ${priorityClass(tc.priority)}`}>
                        {tc.priority} priority
                    </span>
                </div>
                <h1 className="text-3xl font-semibold leading-tight">{tc.title}</h1>
            </div>

            <div className="flex flex-col items-start gap-6 lg:flex-row">
                <div className="flex w-full min-w-0 flex-1 flex-col gap-6">
                    {tc.preconditions.length > 0 && (
                        <section className="flex flex-col gap-3 rounded-2xl border border-line bg-white px-5 py-6 sm:px-7">
                            <h2 className="text-base font-semibold">Before you start</h2>
                            <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-gray-700">
                                {tc.preconditions.map((p, i) => <li key={i}>{p}</li>)}
                            </ul>
                        </section>
                    )}

                    <section className="flex flex-col gap-4 rounded-2xl border border-line bg-white px-5 py-6 sm:px-7">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <h2 className="text-base font-semibold">Steps to reproduce</h2>
                            <p className="text-[13px] text-subtle">{stepsDone} of {tc.steps.length} steps done</p>
                        </div>
                        <p className="text-sm leading-relaxed text-subtle">
                            Tick each step as you complete it. If a step does not work, stop and mark the result as Fail.
                        </p>
                        <div className="flex flex-col gap-2.5">
                            {tc.steps.map((text, i) => (
                                <label
                                    key={i}
                                    className={`flex cursor-pointer items-start gap-4 rounded-xl border border-line px-4 py-4 ${form.done[i] ? 'bg-[#F1F7F3]' : 'bg-white'}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={form.done[i]}
                                        onChange={() => toggleStep(i)}
                                        className="mt-0.5 h-[22px] w-[22px] shrink-0 accent-primary"
                                    />
                                    <span className="flex min-w-0 flex-col gap-0.5">
                                        <span className="text-xs font-semibold tracking-wide text-subtle">STEP {i + 1}</span>
                                        <span className="text-[13px] leading-relaxed">{text}</span>
                                    </span>
                                </label>
                            ))}
                        </div>
                    </section>

                    <section className="flex flex-col gap-3 rounded-2xl border border-[#C9D8F0] bg-primary-tint px-5 py-6 sm:px-7">
                        <h2 className="text-base font-semibold text-[#0A3578]">Expected result</h2>
                        <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed">
                            {tc.expected.map((e, i) => <li key={i}>{e}</li>)}
                        </ul>
                    </section>
                </div>

                <aside className="flex w-full flex-col gap-6 rounded-2xl border border-line bg-white p-5 sm:p-7 lg:w-[380px] lg:shrink-0">
                    <div className="flex flex-col gap-1.5">
                        <h2 className="text-base font-semibold">Your result</h2>
                        <p className="text-sm leading-relaxed text-subtle">{RESULT_HINT[key]}</p>
                    </div>

                    <div role="group" aria-label="Result" className="flex flex-wrap gap-2.5">
                        {RESULTS.map(({ key: k, label, Icon, on }) => {
                            const isActive = form.result === k;
                            return (
                                <button
                                    type="button"
                                    key={k}
                                    aria-pressed={isActive}
                                    onClick={() => change({ result: k })}
                                    className={`flex min-h-[76px] flex-1 basis-24 flex-col items-center justify-center gap-1.5 rounded-xl border-2 text-sm font-semibold ${
                                        isActive ? on : 'border-gray-400 bg-white text-ink'
                                    }`}
                                >
                                    <Icon className="h-[22px] w-[22px]" />
                                    {label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="notes" className="text-sm font-medium">{NOTE_LABEL[key]}</label>
                        <textarea
                            id="notes"
                            rows={4}
                            placeholder={NOTE_HOLDER[key]}
                            value={form.notes}
                            onChange={(e) => change({ notes: e.target.value })}
                            className={`${inputClass} resize-y py-3 leading-relaxed`}
                        />
                    </div>

                    {isFail && (
                        <div className="flex flex-col gap-6 border-t border-line pt-6">
                            <div className="flex flex-col gap-2">
                                <p className="text-sm font-medium">How serious is it?</p>
                                <div role="group" aria-label="Severity" className="flex flex-wrap gap-2">
                                    {SEVERITY.map((o) => (
                                        <Segment key={o.key} active={form.severity === o.key} onClick={() => change({ severity: o.key })}>
                                            {o.label}
                                        </Segment>
                                    ))}
                                </div>
                                <p className="text-[13px] leading-relaxed text-subtle">
                                    {SEVERITY.find((o) => o.key === form.severity)?.hint}
                                </p>
                            </div>

                            <div className="flex flex-col gap-2">
                                <p className="text-sm font-medium">Does it happen every time?</p>
                                <div role="group" aria-label="How often" className="flex flex-wrap gap-2">
                                    {FREQUENCY.map((o) => (
                                        <Segment key={o.key} active={form.frequency === o.key} onClick={() => change({ frequency: o.key })}>
                                            {o.label}
                                        </Segment>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="device" className="text-sm font-medium">Device or browser</label>
                                <input
                                    id="device"
                                    placeholder={tc.platform === 'web' ? 'e.g. Chrome on Windows' : 'e.g. Android phone, PRIME mobile app'}
                                    value={form.device}
                                    onChange={(e) => change({ device: e.target.value })}
                                    className={`${inputClass} h-12`}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-2.5 pt-2">
                        <button
                            type="button"
                            onClick={submit}
                            disabled={!form.result || isSubmitting}
                            className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary text-[15px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
                        >
                            {isSubmitting ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : null}
                            Save and continue
                            {!isSubmitting && <ArrowRight className="h-[18px] w-[18px]" />}
                        </button>
                        <button
                            type="button"
                            onClick={saveDraft}
                            disabled={isSubmitting}
                            className="min-h-12 rounded-xl border border-gray-400 bg-white text-[15px] font-medium"
                        >
                            Save as draft
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
}

function Segment({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            type="button"
            aria-pressed={active}
            onClick={onClick}
            className={`min-h-11 flex-1 basis-24 rounded-[10px] border text-sm font-medium ${
                active ? 'border-primary bg-primary text-white' : 'border-gray-400 bg-white text-ink'
            }`}
        >
            {children}
        </button>
    );
}