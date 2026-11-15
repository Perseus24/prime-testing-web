"use client"

import { clearSession } from "@/lib/session";
import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useState } from "react";
import { Toaster } from "sonner";

export default function AdminLayout({ children }: { children: ReactNode}) {
    const router = useRouter();
    const currPath = usePathname();

    async function signout() {
        clearSession();
        router.push('/');
    }
    return (
        <div className="flex flex-col">
            <header className="flex justify-between items-center bg-white px-6 py-4">
                <div className="flex items-center gap-5">
                    <div className="flex flex-col">
                        <p className="text-sm font-bold">PRIME</p>
                        <p className="text-xs">Pilot testing portal · Admin view</p>
                    </div>
                    <Link href="/admin" className={
                        `flex items-center justify-center p-2 text-[13px] rounded-md ${currPath === '/admin' ? 'bg-primary-tint text-primary font-medium' : 'text-gray-600'}`
                    }>
                        <p>Results</p>
                    </Link>
                    <Link href="/admin/test-cases" className={
                        `flex items-center justify-center p-2 text-[13px] rounded-md ${currPath.startsWith('/admin/test-cases') ? 'bg-primary-tint text-primary font-medium' : 'text-gray-600'}`
                    }>
                        <p>Test Cases</p>
                    </Link>
                    <Link href="/admin/testers" className={
                        `flex items-center justify-center p-2 text-[13px] rounded-md ${currPath.startsWith('/admin/testers') ? 'bg-primary-tint text-primary font-medium' : 'text-gray-600'}`
                    }>
                        <p>Testers</p>
                    </Link>
                </div>

                <div className="flex items-center gap-10">
                    <button onClick={signout} className="cursor-pointer hover:text-blue-800 text-sm font-semibold text-primary" >Logout</button>
                </div>
            </header>
            <main className="p-6">
                {children}
            </main>
            <Toaster richColors position="top-right" />
        </div>
        
    )
}