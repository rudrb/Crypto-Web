import Link from "next/link";

const menus = [
  { href: "/dashboard", label: "대시보드 홈" },
  { href: "/dashboard/cert/issue", label: "인증서 발급" },
  { href: "/dashboard/cert/login", label: "전자서명 로그인" },
  { href: "/dashboard/cert/manage", label: "인증서 관리" },
  { href: "/dashboard/envelope", label: "전자봉투 전송" },
  { href: "/dashboard/envelope/inbox", label: "받은 메시지함" },
  { href: "/dashboard/profile", label: "프로필" },
];

export default function AppSidebar() {
  return (
    <aside className="w-64 shrink-0 rounded-2xl border bg-white p-4 shadow-sm">
      <nav className="flex flex-col gap-2">
        {menus.map((menu) => (
          <Link
            key={menu.href}
            href={menu.href}
            className="rounded-xl px-3 py-2 text-sm hover:bg-slate-100"
          >
            {menu.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}