"use client"

import CsvDropzone from "@/components/csv-dropzone"
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Check, CircleAlert, Download, FileText, Loader2 } from "lucide-react";
import { priorityClass } from "@/lib/priority";

type Filter = 'all' | 'new' | 'error' | 'duplicate';

const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'new', label: 'Ready' },
    { key: 'error', label: 'Needs fixing' },
    { key: 'duplicate', label: 'Skipped' },
];

const STATUS = {
    new: { label: 'Ready', chip: 'bg-pass-bg text-pass', row: '', issue: '' },
    error: { label: 'Needs fixing', chip: 'bg-fail-bg text-fail', row: 'bg-fail-bg/40', issue: 'text-fail' },
    duplicate: { label: 'Skipped', chip: 'bg-blocked-bg text-blocked', row: 'bg-blocked-bg/40', issue: 'text-blocked' },
};

type PreviewRow = {
    line: number;
    status: 'new' | 'duplicate' | 'error';
    errors: string[];
    data: {
        code: string;
        title: string;
        module: string | null;
        platform: 'web' | 'mobile';
        priority: 'low' | 'medium' | 'high';
        preconditions: string[];
        steps: string[];
        expected: string[];
    };
};

export default function ImportTestCasePage() {
    const [isImporting, setIsImporting] = useState(false);
    const [rows, setRows] = useState<PreviewRow[]>([]);
    const [step, setStep] = useState<'upload' | 'review'>('upload');
    const [filter, setFilter] = useState<Filter>('all');
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    
    
    async function submit(e: React.FormEvent) {
        e.preventDefault();

        if (!file) return toast.error('Choose a CSV file first.');

        const body = new FormData();
        body.append('file', file);

        try {
            setIsSubmitting(true);

            const res = await api<{ data: PreviewRow[] }>('/admin/test-cases/import/preview', {
                method: 'POST',
                body,
            });
            setRows(res.data);
            setFilter('all');
            setStep('review');
        } catch (err: any) {
            const firstValidationError = err?.errors
                ? (Object.values(err.errors) as string[][])[0]?.[0]
                : null;
            toast.error(firstValidationError ?? err?.message ?? 'Could not save the test case.');
        } finally {
            setIsSubmitting(false);
        }
    }

    const counts = useMemo(() => ({
        all: rows.length,
        new: rows.filter((r) => r.status === 'new').length,
        error: rows.filter((r) => r.status === 'error').length,
        duplicate: rows.filter((r) => r.status === 'duplicate').length,
    }), [rows]);

    const visibleRows = useMemo(
        () => (filter === 'all' ? rows : rows.filter((r) => r.status === filter)),
        [rows, filter]
    );

    async function importRows() {
        if (!file) return;

        const body = new FormData();
        body.append('file', file);

        try {
            setIsImporting(true);
            const res = await api<{ created: number; updated: number; skipped: number; failed: number }>(
                '/admin/test-cases/import',
                { method: 'POST', body }
            );
            toast.success(`Imported ${res.created} test cases`);
            router.push('/admin/test-cases');
        } catch (err: any) {
            const firstValidationError = err?.errors
                ? (Object.values(err.errors) as string[][])[0]?.[0]
                : null;
            toast.error(firstValidationError ?? err?.message ?? 'Could not import the test cases.');
        } finally {
            setIsImporting(false);
        }
    }

    
    return (
        <div className="gap-7 flex flex-col max-w-6xl mx-auto py-5">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold sm:text-3xl">
                    {step === 'upload' ? 'Import test case from CSV' : 'Review your import'}
                </h1>
                <p className="text-sm text-gray-600">
                    {step === 'upload'
                        ? 'Upload a spreadsheet of test cases. You will check every row before anything is added.'
                        : 'Nothing has been added yet. Check each row, then import the ones that are ready.'}
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {['Upload', 'Review', 'Import'].map((s, i) => {
                    const current = step === 'upload' ? 0 : 1;
                    const isDone = i < current;
                    const isCurrent = i === current;
                    return (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                                isDone ? 'bg-pass-bg text-pass'
                                : isCurrent ? 'bg-primary text-white'
                                : 'border-2 border-line text-gray-600'
                            }`}>
                                {isDone ? <Check className="h-4 w-4" /> : i + 1}
                            </div>
                            <p className={`text-[13px] font-medium ${isCurrent ? 'text-primary' : ''}`}>{s}</p>
                            {i !== 2 && <div className="h-1 w-10 bg-line" />}
                        </div>
                    );
                })}
            </div>

            {step === 'upload' ? (
                <div className="flex w-full gap-8">
                    <section className="flex w-7/10 flex-col gap-2 bg-white p-6 rounded-md h-fit">
                        <CsvDropzone file={file} onFile={setFile} />
                        <div className="h-[1px] w-full bg-line my-5"></div>
                        <div className="flex gap-4 items-center justify-end">
                            <button className="text-sm font-medium text-gray-600 cursor-pointer">
                                Cancel
                            </button>
                            <button onClick={submit} className="bg-primary text-white px-4 py-2 cursor-pointer rounded-md font-medium text-sm flex items-center">
                                Continue to review
                                <ArrowRight className="ml-2 text-white h-4 w-4" />
                            </button>
                        </div>
                    </section>
                    <aside className="flex flex-grow flex-col gap-1 bg-white p-6 rounded-md max-w-3/10">
                        <div className="flex items-center gap-4">
                            <p className="font-semibold text-lg">
                                CSV Format
                            </p>
                            <button className="flex items-center border border-primary text-primary px-4 py-2 rounded-md font-medium text-sm w-fit">
                                <Download className="h-4 w-4" />
                                Download template
                            </button>
                        </div>
                        <div className="h-[1px] w-full bg-line my-2"></div>
                        <div className="flex items-start gap-4">
                            <p className="w-1/4 shrink-0 text-[13px] font-medium">code</p>
                            <div className="flex-1 text-[13px]">
                                <span className="font-semibold text-gray-600">Optional.</span>{" "}
                                <span>e.g. TC-13.</span>
                            </div>
                        </div>
                        <div className="h-[1px] w-full bg-line my-2"></div>
                        <div className="flex items-start gap-4">
                            <p className="w-1/4 shrink-0 text-[13px] font-medium">title</p>
                            <div className="flex-1 text-[13px]">
                                <span className="font-semibold text-primary">Required.</span>{" "}
                                <span>A short name for the test case.</span>
                            </div>
                        </div>
                        <div className="h-[1px] w-full bg-line my-2"></div>
                        <div className="flex items-start gap-4">
                            <p className="w-1/4 shrink-0 text-[13px] font-medium">module</p>
                            <div className="flex-1 text-[13px]">
                                <span className="font-semibold text-gray-600">Optional.</span>{" "}
                                <span>e.g. Analytics, Access</span>
                            </div>
                        </div>
                        <div className="h-[1px] w-full bg-line my-2"></div>
                        <div className="flex items-start gap-4">
                            <p className="w-1/4 shrink-0 text-[13px] font-medium">platform</p>
                            <div className="flex-1 text-[13px]">
                                <span className="font-semibold text-primary">Required.</span>{" "}
                                <span>Either web or mobile.</span>
                            </div>
                        </div>
                        <div className="h-[1px] w-full bg-line my-2"></div>
                        <div className="flex items-start gap-4">
                            <p className="w-1/4 shrink-0 text-[13px] font-medium">priority</p>
                            <div className="flex-1 text-[13px]">
                                <span className="font-semibold text-gray-600">Optional.</span>{" "}
                                <span>low, medium or high. Defaults to medium.</span>
                            </div>
                        </div>
                        <div className="h-[1px] w-full bg-line my-2"></div>
                        <div className="flex items-start gap-4">
                            <p className="w-1/4 shrink-0 text-[13px] font-medium">preconditions</p>
                            <div className="flex-1 text-[13px]">
                                <span className="font-semibold text-gray-600">Optional.</span>{" "}
                                <span>What must be in place first.</span>
                            </div>
                        </div>
                        <div className="h-[1px] w-full bg-line my-2"></div>
                        <div className="flex items-start gap-4">
                            <p className="w-1/4 shrink-0 text-[13px] font-medium">steps</p>
                            <div className="flex-1 text-[13px]">
                                <span className="font-semibold text-primary">Required.</span>{" "}
                                <span>The steps to reproduce, in order.</span>
                            </div>
                        </div>
                        <div className="h-[1px] w-full bg-line my-2"></div>
                        <div className="flex items-start gap-4">
                            <p className="w-1/4 shrink-0 text-[13px] font-medium">expected</p>
                            <div className="flex-1 text-[13px]">
                                <span className="font-semibold text-primary">Required.</span>{" "}
                                <span>What should happen.</span>
                            </div>
                        </div>

                        <div className="bg-line rounded-md p-4 mt-4 text-[13px]">
                                To put several items in one cell, separate them with a comma ( , ). Use it for preconditions, steps and expected results.
                        </div>
                    </aside>
                </div>
            ) : (
                <>
                    <div className="flex w-fit items-center gap-2.5 rounded-xl border border-line bg-white px-4 py-2.5 text-sm">
                        <FileText className="h-[18px] w-[18px] text-subtle" />
                        <span className="font-medium">{file?.name}</span>
                        <span className="text-subtle">{rows.length} rows</span>
                    </div>

                    <section aria-label="Summary" className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-md border border-line bg-white px-6 py-5">
                            <p className="text-[13px] text-subtle">Ready to import</p>
                            <p className="text-3xl font-semibold text-pass">
                                {counts.new} <span className="text-[13px] font-normal text-subtle">test cases</span>
                            </p>
                        </div>
                        <div className="rounded-md border border-line bg-white px-6 py-5">
                            <p className="text-[13px] text-subtle">Need fixing</p>
                            <p className="text-3xl font-semibold text-fail">
                                {counts.error} <span className="text-[13px] font-normal text-subtle">rows, not imported</span>
                            </p>
                        </div>
                        <div className="rounded-md border border-line bg-white px-6 py-5">
                            <p className="text-[13px] text-subtle">Skipped</p>
                            <p className="text-3xl font-semibold text-blocked">
                                {counts.duplicate} <span className="text-[13px] font-normal text-subtle">ID already exists</span>
                            </p>
                        </div>
                    </section>

                    <section aria-label="Rows" className="overflow-hidden rounded-md border border-line bg-white">
                        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
                            <h2 className="text-lg font-semibold">Rows in your file</h2>
                            <div role="group" aria-label="Filter rows" className="flex flex-wrap gap-2">
                                {FILTERS.map((f) => {
                                    const isActive = filter === f.key;
                                    return (
                                        <button
                                            type="button"
                                            key={f.key}
                                            aria-pressed={isActive}
                                            onClick={() => setFilter(f.key)}
                                            className={`min-h-10 rounded-full border px-4 text-[13px] font-medium ${
                                                isActive ? 'border-primary bg-primary text-white' : 'border-line bg-white text-ink'
                                            }`}
                                        >
                                            {f.label} · {counts[f.key]}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {visibleRows.length === 0 && (
                            <p className="border-t border-line px-6 py-10 text-center text-sm text-subtle">No rows to show.</p>
                        )}

                        {visibleRows.map((r) => {
                            const s = STATUS[r.status];
                            const issue = r.status === 'error'
                                ? r.errors.join(' ')
                                : r.status === 'duplicate'
                                    ? `${r.data.code} already exists, so this row is skipped.`
                                    : '';
                            return (
                                <div
                                    key={r.line}
                                    className={`flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-line px-4 py-4 sm:px-6 ${s.row}`}
                                >
                                    <p className="w-14 shrink-0 text-xs text-subtle">Row {r.line}</p>
                                    <p className="w-14 shrink-0 text-[13px] font-semibold text-subtle">{r.data.code}</p>

                                    <div className="min-w-0 flex-1 basis-60">
                                        <p className="text-[15px] font-medium leading-snug">{r.data.title}</p>
                                        {r.data.module && <p className="text-[13px] text-subtle">{r.data.module}</p>}
                                        {issue && (
                                            <p className={`mt-1.5 flex items-start gap-1.5 text-[13px] font-medium leading-relaxed ${s.issue}`}>
                                                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                                                {issue}
                                            </p>
                                        )}
                                    </div>

                                    <span className="w-[84px] shrink-0 rounded-full bg-page py-1.5 text-center text-[13px] font-medium capitalize text-gray-700">
                                        {r.data.platform || '–'}
                                    </span>
                                    <span className={`w-[84px] shrink-0 rounded-full py-1.5 text-center text-[13px] font-medium capitalize ${priorityClass(r.data.priority)}`}>
                                        {r.data.priority || '–'}
                                    </span>
                                    <p className="w-16 shrink-0 text-[13px] font-medium">{r.data.steps.length} steps</p>
                                    <span className={`w-28 shrink-0 rounded-full py-1.5 text-center text-[13px] font-semibold ${s.chip}`}>
                                        {s.label}
                                    </span>
                                </div>
                            );
                        })}
                    </section>

                    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 rounded-md border border-line bg-white px-4 py-5 sm:px-6">
                        <p className="flex-1 basis-80 text-sm leading-relaxed text-gray-700">
                            Rows that need fixing are not imported. Fix them in your file and upload again, or import the ready rows now.
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                disabled={isImporting}
                                onClick={() => setStep('upload')}
                                className="px-4 py-2.5 text-sm font-medium text-gray-600"
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                disabled={counts.new === 0 || isImporting}
                                onClick={importRows}
                                className="flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
                            >
                                {isImporting && <Loader2 className="h-4 w-4 animate-spin" />}
                                Import {counts.new} test cases
                            </button>
                        </div>
                    </div>
                </>
            )}

            
        </div>
    )
}