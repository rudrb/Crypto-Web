import Link from "next/link";
import { ReactNode } from "react";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <aside className="min-h-screen w-64 border-r bg-white p-6">
          <h1 className="text-xl font-bold text-slate-900">PKI Dashboard</h1>
          <nav className="mt-8 space-y-3 text-sm">
            <Link href="/dashboard" className="block text-slate-700 hover:text-slate-900">
              대시보드
            </Link>
            <Link href="/dashboard/cert/issue" className="block text-slate-700 hover:text-slate-900">
              인증서 발급
            </Link>
            <Link href="/dashboard/cert/login" className="block text-slate-700 hover:text-slate-900">
              전자서명 로그인
            </Link>
            <Link href="/dashboard/cert/manage" className="block text-slate-700 hover:text-slate-900">
              인증서 관리
            </Link>
            <Link href="/dashboard/envelope" className="block text-slate-700 hover:text-slate-900">
              전자봉투 전송
            </Link>
            <Link href="/dashboard/envelope/inbox" className="block text-slate-700 hover:text-slate-900">
              받은 메시지함
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}