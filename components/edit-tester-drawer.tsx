"use client"

import { useState } from "react";
import { Check, Loader2, Plus, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import ResetCodeDialog from "./reset-code-dialog";

const ROLES = [
    { key: 'tester', title: 'Tester', desc: 'Runs test cases and submits results.' },
    { key: 'admin', title: 'Admin', desc: 'Manages test cases and testers, and sees every result.' },
];

const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

type Tester = {
    id: number;
    code: string;
    name: string;
    lgu: string;
    role: string;
    position: string;
    total_submitted_results: number;
}


interface Props {
    tester: Tester
    onSaved?: () => void
}

export default function EditTesterDrawer({ tester, onSaved }: Props) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [role, setRole] = useState(tester.role);
    const [code, setCode] = useState(tester.code);
    const [name, setName] = useState(tester.name);
    const [lgu, setLgu] = useState(tester.lgu);
    const [position, setPosition] = useState(tester.position);

    const [view, setView] = useState<'form' | 'confirm' | 'created'>('form');
    const [newCode, setNewCode] = useState<string | null>(null);
    const [isResetting, setIsResetting] = useState(false);

    async function copyCode() {
        try {
            await navigator.clipboard.writeText(newCode!);
            toast.success('Access code copied');
        } catch {
            toast.error('Could not copy. Select the text and copy it by hand.');
        }
    }   

    async function resetCode() {
        try {
            setIsResetting(true);
            const res = await api<{ access_code: string }>(`/admin/testers/${tester.code}/reset-code`, {
                method: 'POST',
            });
            setNewCode(res.access_code);
            setView('created');
        } catch (err: any) {
            toast.error(err?.message ?? 'Could not reset the code.');
        } finally {
            setIsResetting(false);
        }
    }

    function handleOpenChange(next: boolean) {
        if (isResetting) return;
        setOpen(next);
        if (!next) {
            setView('form');
            setNewCode(null);
        }
    }

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        const payload = { role, code, name, lgu, position };

        try {
            setIsSubmitting(true);
            const res = await api<{ access_code: string }>(`/admin/testers/${tester.code}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
            });

            toast.success('Tester updated');
            handleOpenChange(false)
            onSaved?.();
        } catch (err: any) {
            const firstValidationError = err?.errors
                ? (Object.values(err.errors) as string[][])[0]?.[0]
                : null;
            toast.error(firstValidationError ?? err?.message ?? 'Could not add the tester.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Drawer direction="right" open={open} onOpenChange={handleOpenChange}>
            <DrawerTrigger asChild>
                <button className="rounded-md text-primary border  border-primary text-[13px] font-semibold px-3 py-2">
                    Edit
                </button>
            </DrawerTrigger>

            <DrawerContent className="bg-white border-none">
                <DrawerHeader>
                    <DrawerTitle>
                        {view === 'form' && 'Edit tester'}
                        {view === 'confirm' && 'Reset access code'}
                        {view === 'created' && 'New access code'}
                    </DrawerTitle>
                    <DrawerDescription>
                        {view === 'form' && "Change this user's details."}
                        {view === 'confirm' && 'Check this before you continue.'}
                        {view === 'created' && 'Send them their new login.'}
                    </DrawerDescription>
                </DrawerHeader>

                {view === 'confirm' && (
                    <>
                        <div className="flex flex-1 flex-col gap-5 px-4 pb-4">
                            <div className="grid h-10 w-10 place-items-center rounded-full bg-fail-bg text-fail">
                                <TriangleAlert className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-semibold">Reset code for {tester.name}?</p>
                                <p className="text-sm text-gray-600">This replaces their current access code with a new one.</p>
                            </div>
                            <ul className="flex flex-col gap-2 text-sm leading-relaxed">
                                <li>The old code stops working right away.</li>
                                <li>They are signed out on every device.</li>
                                <li>Their results are kept. You will see the new code once.</li>
                            </ul>
                        </div>

                        <DrawerFooter className="flex-row justify-end gap-3 border-t border-line bg-white">
                            <button type="button" disabled={isResetting} onClick={() => setView('form')}
                                className="text-[13px] font-medium text-gray-600">
                                Back
                            </button>
                            <button type="button" disabled={isResetting} onClick={resetCode}
                                className={`flex items-center gap-2 rounded-md bg-fail px-4 py-2.5 text-[13px] font-semibold text-white ${isResetting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {isResetting && <Loader2 className="h-4 w-4 animate-spin" />}
                                Reset code
                            </button>
                        </DrawerFooter>
                    </>
                )}

                {view === 'created' && newCode && (
                    <>
                        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-4">
                            <div className="flex items-center justify-between gap-3 rounded-md border border-gray-300 bg-page px-4 py-3">
                                <p className="font-mono text-xl font-semibold tracking-[0.18em]">{newCode}</p>
                                <button type="button" onClick={copyCode}
                                    className="rounded-md border border-primary px-3 py-2 text-[13px] font-semibold text-primary">
                                    Copy
                                </button>
                            </div>
                            <p role="status" className="rounded-md bg-blocked-bg px-4 py-3 text-[13px] leading-relaxed text-blocked">
                                <strong className="font-semibold">This is the only time you will see this code.</strong>{' '}
                                If it gets lost, reset it again.
                            </p>
                        </div>

                        <DrawerFooter className="flex-row justify-end gap-3 border-t border-line bg-white">
                            <button type="button" onClick={() => handleOpenChange(false)}
                                className="rounded-md bg-primary px-4 py-2.5 text-[13px] font-semibold text-white">
                                Done
                            </button>
                        </DrawerFooter>
                    </>
                )}

                {view === 'form' && (
                    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
                        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-4">
                            <div className="flex flex-col gap-2">
                                <p className="text-sm font-medium">Role</p>
                                {ROLES.map((r) => {
                                    const isActive = role === r.key;
                                    return (
                                        <button
                                            type="button"
                                            key={r.key}
                                            aria-pressed={isActive}
                                            onClick={() => setRole(r.key)}
                                            className={`flex flex-col items-start gap-0.5 rounded-md border-2 px-4 py-3 text-left ${
                                                isActive ? 'border-primary bg-primary-tint' : 'border-gray-300 bg-white'
                                            }`}
                                        >
                                            <span className="text-sm font-semibold">{r.title}</span>
                                            <span className="text-xs text-gray-600">{r.desc}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex flex-col gap-1">
                                <label htmlFor="tester-code" className="text-sm font-medium">Tester ID</label>
                                <input id="tester-code" required placeholder="e.g. T-11" className={inputClass}
                                    value={code} onChange={(e) => setCode(e.target.value)} />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label htmlFor="tester-name" className="text-sm font-medium">Full name</label>
                                <input id="tester-name" required placeholder="e.g. Maria Santos" className={inputClass}
                                    value={name} onChange={(e) => setName(e.target.value)} />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label htmlFor="tester-lgu" className="text-sm font-medium">LGU or office</label>
                                <input id="tester-lgu" required placeholder="e.g. Legazpi City" className={inputClass}
                                    value={lgu} onChange={(e) => setLgu(e.target.value)} />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label htmlFor="tester-position" className="text-sm font-medium">
                                    Position <span className="font-normal text-subtle">(optional)</span>
                                </label>
                                <input id="tester-position" placeholder="e.g. MDRRMO officer" className={inputClass}
                                    value={position} onChange={(e) => setPosition(e.target.value)} />
                            </div>

                            <div className="flex flex-col gap-2.5 rounded-xl bg-page p-4">
                                <p className="text-sm font-semibold">Access code</p>

                                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5">
                                    <p
                                        className="font-mono text-lg tracking-[0.2em] text-subtle"
                                        aria-label="Access code hidden"
                                    >
                                        ••••••••
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setView('confirm')}
                                        className="rounded-md border border-primary bg-white px-4 py-2.5 text-[13px] font-semibold text-primary"
                                    >
                                        Reset code
                                    </button>
                                </div>

                                <p className="text-[13px] leading-relaxed text-gray-700">
                                    Resetting the code replaces it with a new one. Their saved results are kept.
                                </p>
                            </div>
                        </div>

                        <DrawerFooter className="flex-row justify-end gap-3 border-t border-line">
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => handleOpenChange(false)}
                                className="text-[13px] font-medium text-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`bg-primary text-white flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-[13px] font-semibold ${
                                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                Save tester
                            </button>
                        </DrawerFooter>
                    </form>
                )}
            </DrawerContent>
        </Drawer>
    );
}