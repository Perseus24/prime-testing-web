"use client";

import { useState } from "react";
import { FileText, FileUp, X } from "lucide-react";
import { toast } from "sonner";

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB is plenty for test cases

type Props = {
    file: File | null;
    onFile: (file: File | null) => void;
};

export default function CsvDropzone({ file, onFile }: Props) {
    const [isDragging, setIsDragging] = useState(false);

    function accept(picked?: File) {
        if (!picked) return;

        const isCsv = picked.name.toLowerCase().endsWith('.csv') || picked.type === 'text/csv';
        if (!isCsv) return toast.error('That is not a CSV file. Save it as CSV (UTF-8) and try again.');
        if (picked.size > MAX_SIZE) return toast.error('That file is too large. The limit is 2 MB.');

        onFile(picked);
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(false);
        accept(e.dataTransfer.files?.[0]);
    }

    function handleDragLeave(e: React.DragEvent) {
        // ignore the flicker when the pointer moves over a child element
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setIsDragging(false);
    }

    const size = file ? `${(file.size / 1024).toFixed(1)} KB` : '';

    return (
        <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col items-center gap-3.5 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors sm:px-6 sm:py-10 ${
                isDragging ? 'border-primary bg-primary-tint' : 'border-gray-400 bg-[#FAF9F7]'
            }`}
        >
            {file ? (
                <>
                    <div className="flex w-full max-w-sm items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 text-left">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-tint text-primary">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{file.name}</p>
                            <p className="text-xs text-subtle">{size}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => onFile(null)}
                            aria-label="Remove file"
                            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-subtle hover:bg-page"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <input
                        id="csv-file"
                        type="file"
                        accept=".csv,text/csv"
                        className="peer sr-only"
                        onChange={(e) => { accept(e.target.files?.[0]); e.target.value = ''; }}
                    />
                    <label
                        htmlFor="csv-file"
                        className="cursor-pointer text-sm font-semibold text-primary peer-focus-visible:underline"
                    >
                        Choose a different file
                    </label>
                </>
            ) : (
                <>
                    <div className="grid h-14 w-14 place-items-center rounded-full bg-primary-tint text-primary">
                        <FileUp className="h-[26px] w-[26px]" />
                    </div>
                    <p className="text-[17px] font-semibold">
                        {isDragging ? 'Drop the file to upload' : 'Drag your CSV file here'}
                    </p>
                    <p className="text-sm text-subtle">or</p>

                    <input
                        id="csv-file"
                        type="file"
                        accept=".csv,text/csv"
                        className="peer sr-only"
                        onChange={(e) => { accept(e.target.files?.[0]); e.target.value = ''; }}
                    />
                    <label
                        htmlFor="csv-file"
                        className="inline-flex min-h-12 cursor-pointer items-center rounded-xl bg-primary px-6 text-[15px] font-semibold text-white peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 peer-focus-visible:ring-offset-2"
                    >
                        Choose CSV file
                    </label>

                    <p className="max-w-sm text-[13px] leading-relaxed text-subtle">
                        Save the file as CSV (UTF-8). The first row should hold the column names.
                    </p>
                </>
            )}
        </div>
    );
}