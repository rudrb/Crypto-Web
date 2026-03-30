export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold text-slate-900">
          Certificate Auth Service
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          소셜 로그인, 인증서 발급, 전자서명 로그인, 전자봉투 전송 기능을 제공하는 보안 웹 서비스
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">소셜 로그인</h2>
            <p className="mt-2 text-sm text-slate-600">OAuth 기반 사용자 인증</p>
          </div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">인증서 발급</h2>
            <p className="mt-2 text-sm text-slate-600">클라이언트 공개키 기반 인증서 생성</p>
          </div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">전자서명 로그인</h2>
            <p className="mt-2 text-sm text-slate-600">개인키 서명 검증 기반 로그인</p>
          </div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">전자봉투</h2>
            <p className="mt-2 text-sm text-slate-600">서명 후 암호화된 메시지 전송</p>
          </div>
        </div>
      </div>
    </main>
  );
}