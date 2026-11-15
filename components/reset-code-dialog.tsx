"use client"

import { useState } from "react";
import { Loader2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function ResetCodeDialog({ tester }: { tester: { code: string; name: string } }) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newCode, setNewCode] = useState<string | null>(null);

    function handleOpenChange(next: boolean) {
        if (isSubmitting) return; 
        setOpen(next);
        if (!next) setNewCode(null);
    }

    async function reset() {
        try {
            setIsSubmitting(true);
            const res = await api<{ access_code: string }>(`/admin/testers/${tester.code}/reset-code`, {
                method: 'POST',
            });
            setNewCode(res.access_code);
        } catch (err: any) {
            toast.error(err?.message ?? 'Could not reset the code.');
        } finally {
            setIsSubmitting(false);
        }
    }

    async function copy() {
        try {
            await navigator.clipboard.writeText(newCode!);
            toast.success('Access code copied');
        } catch {
            toast.error('Could not copy. Select the text and copy it by hand.');
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger as-child="true">
                <div className="font-semibold text-[13px] text-primary cursor-pointer">
                    Reset code
                </div>
            </DialogTrigger>

            <DialogContent className="sm:max-w-sm bg-white">
                {newCode ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>New access code</DialogTitle>
                            
                        </DialogHeader>

                        <div className="flex items-center justify-between gap-3 rounded-md border border-gray-300 bg-page px-4 py-3">
                            <p className="font-mono text-xl font-semibold tracking-[0.18em]">{newCode}</p>
                            <button
                                type="button"
                                onClick={copy}
                                className="rounded-md border border-primary px-3 py-2 text-[13px] font-semibold text-primary"
                            >
                                Copy
                            </button>
                        </div>

                        <p role="status" className="rounded-md bg-blocked-bg px-4 py-3 text-[13px] leading-relaxed text-blocked">
                            <strong className="font-semibold">This is the only time you will see this code.</strong>{' '}
                            If it gets lost, reset it again.
                        </p>

                        <DialogFooter>
                            <button
                                type="button"
                                onClick={() => handleOpenChange(false)}
                                className="rounded-md bg-primary px-4 py-2.5 text-[13px] font-semibold text-white"
                            >
                                Done
                            </button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <DialogHeader className="items-start">
                            <div className="mb-1 grid h-10 w-10 place-items-center rounded-full bg-fail-bg text-fail">
                                <TriangleAlert className="h-5 w-5" />
                            </div>
                            <DialogTitle>Reset code for {tester.name}?</DialogTitle>
                            <DialogDescription>
                                This replaces their current access code with a new one.
                            </DialogDescription>
                        </DialogHeader>

                        <ul className="flex flex-col gap-2 text-sm leading-relaxed">
                            <li className="flex gap-2">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-fail" />
                                The old code stops working right away.
                            </li>
                            <li className="flex gap-2">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-fail" />
                                They are signed out on every device.
                            </li>
                        </ul>

                        <DialogFooter className="gap-3 bg-white sm:justify-end">
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => handleOpenChange(false)}
                                className="text-[13px] font-medium text-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={reset}
                                className={`flex items-center justify-center gap-2 rounded-md bg-fail px-4 py-2.5 text-[13px] font-semibold text-white ${
                                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                Reset code
                            </button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}