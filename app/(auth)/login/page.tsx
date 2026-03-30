import Link from "next/link";
import GoogleSignInButtons from "@/components/auth/GoogleSigninButtons";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Authentication</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">로그인</h1>
          <p className="mt-3 text-slate-600">
            먼저 Google 계정으로 로그인한 뒤, 인증서 발급과 전자서명 기능을 사용합니다.
          </p>

          <div className="mt-8 space-y-3">
            <GoogleSignInButtons />
          </div>

          <p className="mt-4 text-xs text-slate-500">
            현재는 Google 로그인만 먼저 연결합니다.
          </p>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">로그인 흐름</h2>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">1. 소셜 로그인</p>
              <p className="mt-1 text-sm text-slate-600">
                Google OAuth로 사용자 식별
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">2. 인증서 발급</p>
              <p className="mt-1 text-sm text-slate-600">
                공개키를 제출하고 계정과 인증서를 연결
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">3. 전자서명 로그인</p>
              <p className="mt-1 text-sm text-slate-600">
                개인키 기반 추가 인증 수행
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="mt-8 inline-block rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
          >
            홈으로 이동
          </Link>
        </section>
      </div>
    </main>
  );
}