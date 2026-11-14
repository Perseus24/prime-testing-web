import { Plus, Upload } from "lucide-react";

export default function AdminTestCasesPage() {
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
                        <p className="text-[13px] font-medium">Add test case</p>
                    </button>
                </div>
            </div>
        </div>
    )
}