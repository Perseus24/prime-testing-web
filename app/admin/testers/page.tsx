"use client"

import AddTesterDrawer from "@/components/add-tester-drawer";
import EditTesterDrawer from "@/components/edit-tester-drawer";
import ResetCodeDialog from "@/components/reset-code-dialog";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Tester = {
    id: number;
    code: string;
    name: string;
    lgu: string;
    role: string;
    position: string;
    total_submitted_results: number;
}

type Meta = {
    total_test_cases: number;
}

type TesterResponse = {
    data: Tester[];
    meta: Meta
}


export default function AdminTestersPage() {
    const [testers, setTesters] = useState<Tester[]>([]);
    const [meta, setMeta] = useState<Meta>({ total_test_cases: 0 });
    const [activeRole, setActiveRole] = useState('all');
    const [search, setSearch] = useState('');

    const roleCounts = useMemo(() => {
        return [
            { key: 'all', title: 'All', count: testers.length },
            { key: 'tester', title: 'Tester', count: testers.filter(t => t.role === 'tester').length },
            { key: 'admin', title: 'Admin', count: testers.filter(t => t.role === 'admin').length },
        ]
    }, [testers]);
    

    const fetchTesters = useCallback(async () => {
        try {
            const res = await api<TesterResponse>('/admin/testers', { method: 'GET' });
            setTesters(res.data);
            setMeta(res.meta);
        } catch (err: any) {
            toast.error(err?.message ?? 'Could not fetch testers.');
        }
    }, []);

    useEffect(() => { fetchTesters(); }, [fetchTesters]);

    const visibleTesters = useMemo(() => {
        const q = search.trim().toLowerCase();
        return testers.filter((t) =>
            (activeRole === 'all' || t.role === activeRole) &&
            (!q || [t.name, t.code, t.lgu].some((v) => v.toLowerCase().includes(q)))
        );
    }, [testers, activeRole, search]);
    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold">Testers</h1>
                    <p className="text-sm text-gray-600">This page lists all the users that can access the testing portal.</p>
                </div>
                <AddTesterDrawer onCreated={fetchTesters} />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, ID, or LGU"
                    className="w-full rounded-md border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:max-w-xs"
                />

                <div className="flex w-fit items-center gap-1 rounded-md bg-line p-1">
                    {roleCounts.map((r) => {
                        const isActive = activeRole === r.key;
                        return (
                            <button
                                type="button"
                                key={r.key}
                                onClick={() => setActiveRole(r.key)}
                                className={`cursor-pointer rounded-md px-3 py-2 text-[13px] font-medium ${
                                    isActive ? 'bg-white text-ink shadow-sm' : 'text-gray-600'
                                }`}
                            >
                                {r.title} <span className="text-subtle">{r.count}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="overflow-hidden rounded-md border border-line bg-white">
                <Table className="min-w-[720px]">
                    <TableHeader className="bg-page/60">
                        <TableRow className="border-line hover:bg-transparent">
                            {['Tester', 'LGU', 'Role', 'Progress', 'Actions'].map((h) => (
                                <TableHead key={h} className="h-11 px-4 text-xs font-semibold uppercase tracking-wide text-subtle">
                                    {h}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {visibleTesters.length === 0 && (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={5} className="px-4 py-10 text-center text-sm text-subtle">
                                    No testers match your search.
                                </TableCell>
                            </TableRow>
                        )}

                        {visibleTesters.map((t) => {
                            const initials = t.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
                            const pct = meta.total_test_cases
                                ? Math.min(100, (t.total_submitted_results / meta.total_test_cases) * 100)
                                : 0;
                            const isAdmin = t.role === 'admin';

                            return (
                                <TableRow key={t.id} className="border-line hover:bg-primary-tint/40">
                                    <TableCell className="px-4 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-tint text-xs font-semibold text-primary">
                                                {initials}
                                            </div>
                                            <div className="flex min-w-0 flex-col">
                                                <p className="truncate text-[13px] font-medium">{t.name}</p>
                                                <p className="text-xs text-subtle">{t.code}</p>
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell className="px-4 py-3.5 text-[13px]">{t.lgu}</TableCell>

                                    <TableCell className="px-4 py-3.5">
                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                                            isAdmin ? 'bg-primary-tint text-primary' : 'bg-line text-gray-700'
                                        }`}>
                                            {t.role}
                                        </span>
                                    </TableCell>

                                    <TableCell className="px-4 py-3.5">
                                        {isAdmin ? (
                                            <p className="text-xs text-subtle">Not applicable</p>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <div className="h-2 w-24 overflow-hidden rounded-full bg-line">
                                                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                                                </div>
                                                <p className="whitespace-nowrap text-xs text-gray-700">
                                                    {t.total_submitted_results} of {meta.total_test_cases}
                                                </p>
                                            </div>
                                        )}
                                    </TableCell>

                                    <TableCell className="px-4 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <EditTesterDrawer tester={t} />
                                            <ResetCodeDialog tester={t} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}