import Link from "next/link";
import { ReactNode } from "react";

const menuItems = [
  { label: "대시보드", href: "/dashboard" },
  { label: "인증서 발급", href: "/dashboard/cert/issue" },
  { label: "전자서명 로그인", href: "/dashboard/cert/login" },
  { label: "인증서 관리", href: "/dashboard/cert/manage" },
  { label: "전자봉투 전송", href: "/dashboard/envelope" },
  { label: "받은 메시지함", href: "/dashboard/envelope/inbox" },
];

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 border-r border-slate-200 bg-white p-6 lg:block">
          <Link href="/" className="block">
            <p className="text-sm font-semibold text-slate-500">PKI Service</p>
            <h1 className="mt-1 text-xl font-bold text-slate-900">
              Dashboard
            </h1>
          </Link>

          <nav className="mt-8 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="flex-1">
          <header className="border-b border-slate-200 bg-white px-6 py-4">
            <div className="mx-auto flex max-w-6xl items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Certificate Auth Service</p>
                <p className="text-lg font-semibold text-slate-900">
                  공개키 기반 인증 대시보드
                </p>
              </div>

              <Link
                href="/login"
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
              >
                로그인
              </Link>
            </div>
          </header>

          <main className="mx-auto max-w-6xl p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}