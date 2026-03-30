export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">대시보드</h1>
      <p className="mt-2 text-slate-600">
        로그인 상태, 인증서 상태, 메시지 현황을 한눈에 확인합니다.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="font-semibold">로그인 상태</h2>
          <p className="mt-2 text-sm text-slate-600">미구현</p>
        </div>
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="font-semibold">인증서 상태</h2>
          <p className="mt-2 text-sm text-slate-600">미발급</p>
        </div>
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="font-semibold">전자봉투</h2>
          <p className="mt-2 text-sm text-slate-600">받은 메시지 0건</p>
        </div>
      </div>
    </div>
  );
}