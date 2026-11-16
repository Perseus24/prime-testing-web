"use client";

import { api } from "@/lib/api";
import { priorityClass } from "@/lib/priority";
import { Monitor, Plus, Smartphone, Upload } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type TestCase = {
    code: string;
    module: string;
    title: string;
    platform: string;
    priority: string;
    result_count: number;
    number_of_steps: number;
}

type Meta = {
    number_of_testers: number;
}

type TestCasesResponse = {
    data: TestCase[];
    meta: Meta
}



export default function AdminTestCasesPage() {
    const [search, setSearch] = useState('');
    const [testCases, setTestCases] = useState<TestCase[]>([]);
    const [meta, setMeta] = useState<Meta>({ number_of_testers: 0 });
    const [activeCategory, setActiveCategory] = useState('all');
    const categoryCounts = useMemo(() => {
        return [
            { key: 'all', title: 'All', count: testCases.length },
            { key: 'web', title: 'Web', count: testCases.filter(t => t.platform === 'web').length },
            { key: 'mobile', title: 'Mobile', count: testCases.filter(t => t.platform === 'mobile').length },
        ]
    }, [testCases]);

    useEffect(() => {
        const fetchTestCases = async () => {
            try {
                const res = await api('/admin/test-cases', {
                    method: 'GET',
                });

                setTestCases((res as TestCasesResponse).data);
                setMeta((res as TestCasesResponse).meta);
            } catch (err: any) {
                toast.error(err?.message ?? 'Could not fetch test cases.');
            }
        }

        fetchTestCases();
    }, [])

    const filteredTestCases = useMemo(() => {
        if (activeCategory === 'all') return testCases;
        return testCases.filter(t => t.platform === activeCategory);
    }, [testCases, activeCategory]);
    return (
        <div className="gap-7 flex flex-col max-w-7xl mx-auto py-5">
            <div className="flex justify-between items-center">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold">Test cases</h1>
                    <p className="text-sm text-gray-600">The following are the test cases.</p>
                </div>

                <div className="flex items-center gap-4">
                    <button className="bg-white text-primary flex items-center justify-center gap-2 px-4 py-2.5 border-primary border-[0.5px] rounded-md">
                        <Upload className="h-4 w-4" />
                        <p className="text-[13px] font-medium">Import CSV</p>
                    </button>

                    <button className="bg-primary text-white flex items-center justify-center gap-2 px-4 py-2.5 rounded-md">
                        <Plus className="h-4 w-4" />
                        <Link href="/admin/test-cases/add" className="text-[13px] font-medium">Add test case</Link>
                    </button>
                </div>
            </div>

            <div className="flex flex-col border border-[0.1px] border-line bg-white rounded-md">
                <div className="px-4 py-3 flex items-center justify-between border-b border-[0.1px] border-line">
                    <input 
                        type="text" 
                        placeholder="Search by ID or title" 
                        className="w-1/4 bg-white border border-[0.1px] border-line rounded-md px-4 py-2.5 text-sm"
                    />
                    <div className="flex items-center gap-2">
                        {
                            categoryCounts.map(c => {
                                const isActive = activeCategory === c.key;
                                return (
                                    <button 
                                        onClick={() => setActiveCategory(c.key)} key={c.key} className={
                                        `${isActive ? 'bg-primary text-white' : 'text-primary bg-white'} cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 border-line border-[0.5px] rounded-md`
                                    }>
                                        <p className="text-[13px] font-medium">{c.title}</p>
                                        <p className="text-[13px] font-medium">{c.count}</p>
                                    </button>
                                )
                            })
                        }
                    </div>
                </div>
                {/* body */}
                <div className="flex flex-col">
                    {
                        filteredTestCases.map(t => (
                            <div
                                key={t.code}
                                className="flex items-center justify-between px-6 py-4 border-b border-[0.1px] border-line"
                            >
                                <div className="flex items-center gap-8">
                                    <p className="font-semibold text-[13px] text-gray-600">{t.code}</p>
                                    <div className="flex flex-col">
                                        <p className="text-sm font-medium">{t.title}</p>
                                        <span className="text-xs text-gray-600">
                                            {
                                                t.module && (
                                                    <p>{t.module} · </p>
                                                )
                                            }
                                            <p>{t.number_of_steps} steps</p>
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-10">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-full text-gray-600 font-medium text-xs">
                                            { t.platform === 'web' ? <Monitor className="h-3 w-3" /> : <Smartphone className="h-3 w-3" /> }
                                            <p>{t.platform.charAt(0).toUpperCase() + t.platform.slice(1)}</p>
                                        </div>

                                        <p
                                            className={
                                                `${priorityClass(t.priority)} px-2 py-1 font-medium rounded-full text-xs`
                                            }
                                        >
                                            {t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
                                        </p>

                                        <p className="text-xs text-gray-600">
                                            {t.result_count} of {meta.number_of_testers} testers
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <Link
                                            href={`/admin/test-cases/${t.code}/edit`}
                                            className="text-[13px] text-primary hover:underline font-semibold"
                                        >
                                                Edit
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    }

                    {
                        filteredTestCases.length === 0 && (
                            <p className="text-sm text-gray-600 px-6 py-4 flex justify-center">No test cases recorded.</p>
                        )
                    }
                </div>
            </div>
        </div>
    )
}