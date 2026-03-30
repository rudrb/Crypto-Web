import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Authentication</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">로그인</h1>
          <p className="mt-3 text-slate-600">
            우선 소셜 로그인으로 사용자 계정을 식별하고, 이후 인증서 발급 및
            전자서명 로그인을 수행합니다.
          </p>

          <div className="mt-8 space-y-3">
            <button className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800">
              Google 로그인
            </button>
            <button className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 hover:bg-slate-100">
              GitHub 로그인
            </button>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            현재는 UI 뼈대 단계입니다. 다음 단계에서 Auth.js를 연결합니다.
          </p>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">로그인 흐름</h2>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">1. 소셜 로그인</p>
              <p className="mt-1 text-sm text-slate-600">
                Google 또는 GitHub로 기본 사용자 인증
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">2. 인증서 발급</p>
              <p className="mt-1 text-sm text-slate-600">
                공개키 제출 후 서버에서 인증서 발급
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">3. 전자서명 로그인</p>
              <p className="mt-1 text-sm text-slate-600">
                개인키 서명 검증으로 추가 인증
              </p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="mt-8 inline-block rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
          >
            대시보드로 이동
          </Link>
        </section>
      </div>
    </main>
  );
}