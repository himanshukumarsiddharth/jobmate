"use client";

import { LayoutDashboard, Briefcase } from "lucide-react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur flex flex-col z-20 shrink-0 sticky top-0 h-screen">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <span className="font-outfit text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-neon-purple tracking-tight">
            JobMate
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard" className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${pathname === '/dashboard' ? 'border border-neon-blue/20 bg-neon-blue/10 text-neon-blue' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <LayoutDashboard className={`h-5 w-5 mr-3 ${pathname === '/dashboard' ? 'opacity-100' : 'opacity-70'}`} />
            Resume ATS Score
          </Link>
          <Link href="/dashboard/jobs" className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${pathname === '/dashboard/jobs' ? 'border border-neon-purple/20 bg-neon-purple/10 text-neon-purple' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <Briefcase className={`h-5 w-5 mr-3 ${pathname === '/dashboard/jobs' ? 'opacity-100' : 'opacity-70'}`} />
            Job Tracker
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="w-full flex items-center justify-center py-2 px-4 rounded border border-slate-700 text-sm text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer" onClick={(e) => { e.preventDefault(); localStorage.removeItem("access_token"); window.location.href = "/"; }}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative z-10 p-8 w-full">
        {children}
      </main>
    </div>
  );
}
