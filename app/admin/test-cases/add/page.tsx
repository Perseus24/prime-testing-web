"use client"

import { api } from "@/lib/api";
import { Eye, Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const PLATFORMS = [
    { key: 'web', title: 'Web'},
    { key: 'mobile', title: 'Mobile'}
];

const PRIORITIES = [
    { key: 'low', title: 'Low'},
    { key: 'medium', title: 'Medium'},
    { key: 'high', title: 'High'}
]

export default function AddTestCasePage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [testCaseId, setTestCaseId] = useState('');
    const [module, setModule] = useState('');
    const [title, setTitle] = useState('');

    const [selectedPlatform, setSelectedPlatform] = useState('web');
    const [selectedPriority, setSelectedPriority] = useState('medium');

    const [preconditions, setPreconditions] = useState<string[]>([]);
    const addPrecondition = () => setPreconditions((prev) => [...prev, '']);
    const deletePrecondition = (index: number) =>
        setPreconditions((prev) => prev.filter((_, i) => i !== index));
    const editPrecondition = (index: number, value: string) =>
        setPreconditions((prev) => prev.map((p, i) => (i === index ? value : p)))

    const [stepsToReproduce, setStepsToReproduce] = useState<string[]>([]);
    const addSteps = () => setStepsToReproduce((prev) => [...prev, '']);
    const deleteSteps = (index: number) =>
        setStepsToReproduce((prev) => prev.filter((_, i) => i !== index));
    const editSteps = (index: number, value: string) =>
        setStepsToReproduce((prev) => prev.map((p, i) => (i === index ? value : p)))

    const [expectedResults, setExpectedResults] = useState<string[]>([]);
    const addResult = () => setExpectedResults((prev) => [...prev, '']);
    const deleteResult = (index: number) =>
        setExpectedResults((prev) => prev.filter((_, i) => i !== index));
    const editResult = (index: number, value: string) =>
        setExpectedResults((prev) => prev.map((p, i) => (i === index ? value : p)))

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        const payload = {
            code: testCaseId,
            module,
            title,
            platform: selectedPlatform,
            priority: selectedPriority,
            preconditions,
            steps: stepsToReproduce,
            expected: expectedResults,
        };

        try {
            setIsSubmitting(true);
            await api('/admin/test-cases', {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            toast.success('Test case saved');
            router.push('/admin/test-cases');
        } catch (err: any) {
            const firstValidationError = err?.errors
                ? (Object.values(err.errors) as string[][])[0]?.[0]
                : null;
            toast.error(firstValidationError ?? err?.message ?? 'Could not save the test case.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="gap-7 flex flex-col max-w-6xl mx-auto py-5">
            <div className="flex justify-between items-end">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl sm:text-3xl font-bold">Add test case</h1>
                    <p className="text-sm text-gray-600">Write each test case clearly in order for the testers to follow the steps correctly.</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                <form onSubmit={submit} className="w-full lg:w-2/3 flex flex-col gap-6">
                    <div className="flex flex-col bg-white gap-6 p-4 sm:p-7 rounded-md">
                        <p className="text-base font-semibold">Basics</p>
                        <div className="flex flex-col sm:flex-row items-start gap-5">
                            <div className="flex w-full sm:flex-1 flex-col gap-1">
                                <label htmlFor="test-case-id" className="text-sm font-medium">Test case ID</label>
                                <input
                                    placeholder="TC-13"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    id="test-case-id" value={testCaseId} onChange={(e) => setTestCaseId(e.target.value)} />
                            </div>
                            <div className="flex w-full sm:flex-1 flex-col gap-1">
                                <label htmlFor="title" className="text-sm font-medium">Title</label>
                                <input
                                    placeholder="User is able to log in"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                            </div>
                        </div>
                        <div className="flex flex-1 flex-col gap-1">
                            <label htmlFor="module" className="text-sm font-medium">Module</label>
                            <input
                                placeholder="Directory"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                id="module" value={module} onChange={(e) => setModule(e.target.value)} />
                        </div>

                        <div className="flex flex-col sm:flex-row items-start gap-5">
                            <div className="flex w-full sm:flex-1 flex-col gap-1">
                                <label htmlFor="platform" className="text-sm font-medium">Platform</label>
                                <div className="flex gap-3">
                                    {
                                        PLATFORMS.map((platform) => {
                                            const isActive = platform.key === selectedPlatform
                                            return (
                                                <div
                                                    onClick={() => setSelectedPlatform(platform.key)}
                                                    key={platform.key}
                                                    className={`${isActive ? 'bg-primary text-white' : 'bg-white text-primary border border-[0.1px] border-line'} 
                                                    px-3 py-2 text-[13px] flex flex-1 rounded-md items-center justify-center cursor-pointer font-medium` }
                                                >
                                                    <p>{platform.title}</p>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>

                            <div className="flex w-full sm:flex-1 flex-col gap-1">
                                <label htmlFor="platform" className="text-sm font-medium">Priority</label>
                                <div className="flex gap-3">
                                    {
                                        PRIORITIES.map((priority) => {
                                            const isActive = priority.key === selectedPriority
                                            return (
                                                <div
                                                    onClick={() => setSelectedPriority(priority.key)}
                                                    key={priority.key}
                                                    className={`${isActive ? 'bg-primary text-white' : 'bg-white text-primary border border-[0.1px] border-line'} 
                                                    px-3 py-2 text-[13px] flex flex-1 rounded-md items-center justify-center cursor-pointer font-medium` }
                                                >
                                                    <p>{priority.title}</p>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col bg-white gap-6 p-4 sm:p-7 rounded-md">
                        <div className="flex flex-col">
                            <p className="text-base font-semibold">Before you start</p>
                            <p className="text-[13px] text-gray-500">Define what testers need before testing, such as an account, a device, or connection. This is optional.</p>
                        </div>

                        {
                            preconditions.map((p, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <textarea
                                        value={p}
                                        onChange={(e) => editPrecondition(idx, e.target.value)}
                                        className="flex-1 min-w-0 border border-line border-[0.1px] rounded-md text-sm p-3"
                                    />
                                    <button
                                        type="button"
                                        aria-label={`Remove precondition ${idx + 1}`}
                                        onClick={() => deletePrecondition(idx)}
                                        className="flex items-center justify-center w-10 h-10 shrink-0 rounded-md border border-line border-[0.1px] cursor-pointer"
                                    >
                                        <Trash2 className="w-4 h-4 text-gray-500" />
                                    </button>
                                </div>
                            ))
                        }

                        <button
                            type="button"
                            onClick={addPrecondition}
                            className="flex gap-2 items-center px-3 py-2 border border-primary border-dashed rounded-md cursor-pointer w-fit self-start"
                        >
                            <Plus className="h-4 w-4 text-primary" />
                            <p className="text-xs font-medium text-primary">Add precondition</p>
                        </button>
                    </div>

                    <div className="flex flex-col bg-white gap-6 p-4 sm:p-7 rounded-md">
                        <div className="flex flex-col">
                            <p className="text-base font-semibold">Steps to reproduce</p>
                            <p className="text-[13px] text-gray-500">List the actions the tester should do, in order.</p>
                        </div>

                        {
                            stepsToReproduce.map((p, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <p className="text-xs font-medium text-gray-600 shrink-0 pt-3">{idx+1}</p>
                                    <textarea
                                        value={p}
                                        onChange={(e) => editSteps(idx, e.target.value)}
                                        className="flex-1 min-w-0 border border-line border-[0.1px] rounded-md text-sm p-3"
                                    />
                                    <button
                                        type="button"
                                        aria-label={`Remove step ${idx + 1}`}
                                        onClick={() => deleteSteps(idx)}
                                        className="flex items-center justify-center w-10 h-10 shrink-0 rounded-md border border-line border-[0.1px] cursor-pointer"
                                    >
                                        <Trash2 className="w-4 h-4 text-gray-500" />
                                    </button>
                                </div>
                            ))
                        }

                        <button
                            type="button"
                            onClick={addSteps}
                            className="flex gap-2 items-center px-3 py-2 border border-primary border-dashed rounded-md cursor-pointer w-fit self-start"
                        >
                            <Plus className="h-4 w-4 text-primary" />
                            <p className="text-xs font-medium text-primary">Add step</p>
                        </button>
                    </div>

                    <div className="flex flex-col bg-white gap-6 p-4 sm:p-7 rounded-md">
                        <div className="flex flex-col">
                            <p className="text-base font-semibold">Expected results</p>
                            <p className="text-[13px] text-gray-500">
                                What the tester should see if everything works. Testers compare against this to choose Pass or Fail.
                            </p>
                        </div>

                        {
                            expectedResults.map((p, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <p className="text-xs font-medium text-gray-600 shrink-0 pt-3">{idx+1}</p>
                                    <textarea
                                        value={p}
                                        onChange={(e) => editResult(idx, e.target.value)}
                                        className="flex-1 min-w-0 border border-line border-[0.1px] rounded-md text-sm p-3"
                                    />
                                    <button
                                        type="button"
                                        aria-label={`Remove expected result ${idx + 1}`}
                                        onClick={() => deleteResult(idx)}
                                        className="flex items-center justify-center w-10 h-10 shrink-0 rounded-md border border-line border-[0.1px] cursor-pointer"
                                    >
                                        <Trash2 className="w-4 h-4 text-gray-500" />
                                    </button>
                                </div>
                            ))
                        }

                        <button
                            type="button"
                            onClick={addResult}
                            className="flex gap-2 items-center px-3 py-2 border border-primary border-dashed rounded-md cursor-pointer w-fit self-start"
                        >
                            <Plus className="h-4 w-4 text-primary" />
                            <p className="text-xs font-medium text-primary">Add expected result</p>
                        </button>
                    </div>

                    {/* buttons */}
                    <div className="p-4 sm:p-7 flex items-center justify-end bg-white rounded-md gap-4">
                        <button onClick={() => router.back()} disabled={isSubmitting} type="button" className="text-[13px] font-medium text-gray-600">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={
                                `bg-primary text-white flex items-center justify-center text-[13px] gap-2 px-4 py-2.5 rounded-md ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`
                            }
                        >
                            {
                                isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />
                            }
                            Save test case
                        </button>
                    </div>
                </form>

                <aside className="w-full lg:w-1/3 flex flex-col gap-2 lg:sticky lg:top-6 lg:self-start">
                    <div className="flex items-center gap-3">
                        <Eye className="h-3 w-3" />
                        <p className="text-gray-600 font-medium text-[13px] uppercase">How it will display</p>
                    </div>

                    <div className="bg-white rounded-md flex flex-col gap-3 p-4 sm:p-6 w-full">
                        <div className="flex flex-wrap items-center gap-2">
                            {
                                testCaseId != '' && (
                                    <div className="rounded-full font-medium text-xs text-white bg-primary px-2 py-1">
                                        {testCaseId}
                                    </div>
                                )
                            }
                            {
                                module != '' && (
                                    <div className="rounded-full text-xs border border-[0.1px] border-line px-2 py-1">
                                        {module}
                                    </div>
                                )
                            }
                            {
                                selectedPlatform != '' && (
                                    <div className="rounded-full text-xs border border-[0.1px] border-line px-2 py-1">
                                        {PLATFORMS.find(p => p.key === selectedPlatform)?.title}
                                    </div>
                                )
                            }
                            <div className="rounded-full text-xs bg-primary-tint font-medium text-primary px-2 py-1">
                                {PRIORITIES.find(p => p.key === selectedPriority)?.title} priority
                            </div>
                        </div>

                        {
                            title != '' && (
                                <p className="text-xl font-bold break-words">
                                    {title}
                                </p>
                            )
                        }

                        {
                            preconditions.length > 0 && (
                                <div className="flex flex-col gap-1 mt-3">
                                    <p className="text-[13px] font-semibold">Before you start</p>
                                    <ul className="flex flex-col ml-2">
                                        {
                                            preconditions.filter((p) => p != '').map((p, idx) => (
                                                <li className="text-xs break-words" key={idx}>
                                                    {p}
                                                </li>
                                            ))
                                        }
                                    </ul>
                                </div>
                            )
                        }

                        {
                            stepsToReproduce.length > 0 && (
                                <div className="flex flex-col gap-1 mt-3">
                                    <p className="text-[13px] font-semibold">Steps to reproduce</p>
                                    <ol className="flex flex-col ml-2">
                                        {
                                            stepsToReproduce.filter((p) => p != '').map((p, idx) => (
                                                <li className="text-xs break-words" key={idx}>
                                                    {p}
                                                </li>
                                            ))
                                        }
                                    </ol>
                                </div>
                            )
                        }

                        <div className="rounded-md flex flex-col gap-2 bg-primary-tint border border-[0.1px] border-primary-tint p-4">
                            <p className="text-xs font-semibold text-primary">Expected Result</p>
                            <ul className="flex flex-col ml-2">
                                {
                                    expectedResults.filter((p) => p != '').map((p, idx) => (
                                        <li className="text-xs break-words" key={idx}>
                                            {p}
                                        </li>
                                    ))
                                }
                            </ul>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    )
}