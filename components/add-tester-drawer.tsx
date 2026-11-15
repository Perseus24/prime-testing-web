"use client"

import { useState } from "react";
import { Check, Loader2, Plus } from "lucide-react";
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

const ROLES = [
    { key: 'tester', title: 'Tester', desc: 'Runs test cases and submits results.' },
    { key: 'admin', title: 'Admin', desc: 'Manages test cases and testers, and sees every result.' },
];

const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

type Created = { code: string; name: string; accessCode: string };

export default function AddTesterDrawer({ onCreated }: { onCreated?: () => void }) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [role, setRole] = useState('tester');
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [lgu, setLgu] = useState('');
    const [position, setPosition] = useState('');

    const [created, setCreated] = useState<Created | null>(null);

    function reset() {
        setRole('tester');
        setCode('');
        setName('');
        setLgu('');
        setPosition('');
        setCreated(null);
    }

    function handleOpenChange(next: boolean) {
        setOpen(next);
        if (!next) reset();
    }

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        const payload = { role, code, name, lgu, position };

        try {
            setIsSubmitting(true);
            const res = await api<{ access_code: string }>('/admin/testers', {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            setCreated({ code, name, accessCode: res.access_code });
            onCreated?.();
        } catch (err: any) {
            const firstValidationError = err?.errors
                ? (Object.values(err.errors) as string[][])[0]?.[0]
                : null;
            toast.error(firstValidationError ?? err?.message ?? 'Could not add the tester.');
        } finally {
            setIsSubmitting(false);
        }
    }

    async function copy(text: string, label: string) {
        try {
            await navigator.clipboard.writeText(text);
            toast.success(`${label} copied`);
        } catch {
            toast.error('Could not copy. Select the text and copy it by hand.');
        }
    }

    const loginMessage = created
        ? `Hi ${created.name}, here is your login for the PRIME pilot test portal.\nTester ID: ${created.code}\nAccess code: ${created.accessCode}\nSign in at: ${window.location.origin}`
        : '';

    return (
        <Drawer direction="right" open={open} onOpenChange={handleOpenChange}>
            <DrawerTrigger asChild>
                <button type="button" className="bg-primary text-white flex items-center justify-center gap-2 px-4 py-2.5 rounded-md">
                    <Plus className="h-4 w-4" />
                    <p className="text-[13px] font-medium">Add tester</p>
                </button>
            </DrawerTrigger>

            <DrawerContent className="bg-white border-none">
                <DrawerHeader>
                    <DrawerTitle>{created ? 'Tester added' : 'Add tester'}</DrawerTitle>
                    <DrawerDescription>
                        {created
                            ? 'Send them their login so they can start.'
                            : 'Add a new user that can sign in to the platform.'}
                    </DrawerDescription>
                </DrawerHeader>

                {created ? (
                    <>
                        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-pass-bg text-pass">
                                    <Check className="h-5 w-5" />
                                </div>
                                <p className="text-sm">
                                    {created.name} can now sign in with ID {created.code}.
                                </p>
                            </div>

                            <div className="flex flex-col gap-2">
                                <p className="text-sm font-medium">Access code</p>
                                <div className="flex items-center justify-between gap-3 rounded-md border border-gray-300 bg-page px-4 py-3">
                                    <p className="font-mono text-xl font-semibold tracking-[0.18em]">{created.accessCode}</p>
                                    <button
                                        type="button"
                                        onClick={() => copy(created.accessCode, 'Access code')}
                                        className="rounded-md border border-primary px-3 py-2 text-[13px] font-semibold text-primary"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>

                            <div role="status" className="rounded-md bg-blocked-bg px-4 py-3 text-[13px] leading-relaxed text-blocked">
                                <strong className="font-semibold">This is the only time you will see this code.</strong>{' '}
                                It is stored scrambled, so it can't be shown again. If it gets lost, reset it from the table.
                            </div>
                        </div>

                        <DrawerFooter className="flex-row justify-end gap-3 border-t border-line">
                            <button
                                type="button"
                                onClick={reset}
                                className="rounded-md border border-primary px-4 py-2.5 text-[13px] font-semibold text-primary"
                            >
                                Add another
                            </button>
                            <button
                                type="button"
                                onClick={() => handleOpenChange(false)}
                                className="rounded-md bg-primary px-4 py-2.5 text-[13px] font-semibold text-white"
                            >
                                Done
                            </button>
                        </DrawerFooter>
                    </>
                ) : (
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

                            <p className="rounded-md bg-page px-4 py-3 text-[13px] leading-relaxed text-subtle">
                                An access code is made when you save. You will see it once, so have somewhere ready to copy it.
                            </p>
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
                                Add tester
                            </button>
                        </DrawerFooter>
                    </form>
                )}
            </DrawerContent>
        </Drawer>
    );
}