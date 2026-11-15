"use client"

import AddTesterDrawer from "@/components/add-tester-drawer";
import EditTesterDrawer from "@/components/edit-tester-drawer";
import ResetCodeDialog from "@/components/reset-code-dialog";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
    const roleCounts = useMemo(() => {
        return [
            { key: 'all', title: 'All', count: testers.length },
            { key: 'tester', title: 'Tester', count: testers.filter(t => t.role === 'tester').length },
            { key: 'admin', title: 'Admin', count: testers.filter(t => t.role === 'admin').length },
        ]
    }, [testers]);

    useEffect(() => {
        const fetchTesters = async () => {
            try {
                const res = await api('/admin/testers', {
                    method: 'GET',
                });

                setTesters((res as TesterResponse).data);
                setMeta((res as TesterResponse).meta);
            } catch (err: any) {
                toast.error(err?.message ?? 'Could not fetch test cases.');
            }
        }

        fetchTesters();
    }, [])
    return (
        <div className="gap-7 flex flex-col max-w-7xl mx-auto py-5">
            <div className="flex justify-between items-center">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold">Testers</h1>
                    <p className="text-sm text-gray-600">This page lists all the users that can access the testing portal.</p>
                </div>

                <AddTesterDrawer />
            </div>

            <div className="flex items-center justify-between">
                <input 
                    type="text" 
                    placeholder="Search by name, ID, or LGU" 
                    className="w-1/4 bg-white border border-[0.5px] border-line rounded-md px-4 py-2.5 text-sm"
                />

                <div className="bg-line rounded-md flex items-center gap-2 p-1">
                    {
                        roleCounts.map(r => {
                            const isActive = activeRole === r.key
                            return (
                                <button
                                    key={r.key}
                                    onClick={() => setActiveRole(r.key)}
                                    className={
                                        `px-3 py-2 rounded-md ${isActive ? 'bg-white text-black' : 'text-gray-600'} font-medium cursor-pointer text-[13px]`
                                    }
                                >
                                    {r.title} {r.count}
                                </button>
                            )
                        })
                    }
                </div>
            </div>

            {/* body */}
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-primary-tint/40 data-[state=selected]:bg-primary-tint">
                        <TableHead className="p-3 uppercase text-[13px] text-gray-600 font-medium">
                            Tester
                        </TableHead>
                        <TableHead className="p-3 uppercase text-[13px] text-gray-600 font-medium">
                            LGU
                        </TableHead>
                        <TableHead className="p-3 uppercase text-[13px] text-gray-600 font-medium">
                            Role
                        </TableHead>
                        <TableHead className="p-3 uppercase text-[13px] text-gray-600 font-medium">
                            Progress
                        </TableHead>
                        <TableHead className="p-3 uppercase text-[13px] text-gray-600 font-medium">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        testers.map(t => {
                            const initials = t.name.split(' ').map(n => n[0]).join('');
                            return (
                                <TableRow
                                    className="hover:bg-primary-tint/40 data-[state=selected]:bg-primary-tint"
                                    key={t.id}
                                >
                                    <TableCell className="p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center text-xs font-semibold justify-center w-8 h-8 bg-primary-tint text-primary rounded-full">
                                                {initials}
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-[13px] font-medium">{t.name}</p>
                                                <p className="text-gray-600 text-xs">{t.code}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-3">
                                        <p className="text-[13px] font-medium">{t.lgu}</p>
                                    </TableCell>
                                    <TableCell className="p-3">
                                        <p className="px-2 py-1 bg-line rounded-md text-xs font-semibold text-gray-600 flex-start w-fit">
                                            {t.role.charAt(0).toUpperCase() + t.role.slice(1)}
                                        </p>
                                    </TableCell>
                                    <TableCell className="p-3">
                                        {
                                            t.role === 'admin' ? (
                                                <p className="text-subtle text-xs">Not applicable</p>
                                            ) : (
                                                <></>
                                            )
                                        }
                                    </TableCell>
                                    <TableCell className="p-3">
                                        <div className="flex items-center gap-3">
                                            <EditTesterDrawer tester={t} />
                                            <ResetCodeDialog tester={t} />
                                            
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })
                    }
                </TableBody>
            </Table>
        </div>
    )
}