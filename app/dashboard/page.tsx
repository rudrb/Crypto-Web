import Link from "next/link";

export default function DashboardPage() {
  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">대시보드</h1>
          <p className="mt-2 text-slate-600">
            로그인 상태, 인증서 상태, 메시지 현황을 확인합니다.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/dashboard/cert/issue"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            인증서 발급
          </Link>
          <Link
            href="/dashboard/envelope"
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
          >
            전자봉투 전송
          </Link>
        </div>
      </div>

      <section className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">로그인 상태</p>
          <h2 className="mt-3 text-2xl font-bold text-slate-900">미연결</h2>
          <p className="mt-2 text-sm text-slate-600">
            소셜 로그인 연결 전 상태입니다.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">인증서 상태</p>
          <h2 className="mt-3 text-2xl font-bold text-slate-900">미발급</h2>
          <p className="mt-2 text-sm text-slate-600">
            공개키 제출 후 인증서가 발급됩니다.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">받은 메시지</p>
          <h2 className="mt-3 text-2xl font-bold text-slate-900">0건</h2>
          <p className="mt-2 text-sm text-slate-600">
            전자봉투 수신 내역이 여기에 표시됩니다.
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">빠른 작업</h2>
          <div className="mt-4 grid gap-3">
            <Link
              href="/dashboard/cert/issue"
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-900 hover:bg-slate-100"
            >
              클라이언트 키쌍 생성 및 인증서 발급
            </Link>
            <Link
              href="/dashboard/cert/login"
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-900 hover:bg-slate-100"
            >
              전자서명 로그인 테스트
            </Link>
            <Link
              href="/dashboard/envelope"
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-900 hover:bg-slate-100"
            >
              전자봉투 메시지 전송
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">현재 구현 단계</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>• UI 뼈대 구성</li>
            <li>• 라우팅 확인</li>
            <li>• 이후 Auth.js, Prisma, node-forge 연결 예정</li>
          </ul>
        </div>
      </section>
    </div>
  );
}