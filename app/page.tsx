import Link from "next/link";

const features = [
  {
    title: "소셜 로그인",
    description: "OAuth 기반 사용자 인증 기능",
    href: "/login",
    buttonText: "로그인 페이지",
  },
  {
    title: "인증서 발급",
    description: "클라이언트 공개키를 기반으로 인증서를 발급",
    href: "/dashboard/cert/issue",
    buttonText: "인증서 발급",
  },
  {
    title: "전자서명 로그인",
    description: "개인키 서명 검증으로 로그인 허용",
    href: "/dashboard/cert/login",
    buttonText: "전자서명 로그인",
  },
  {
    title: "전자봉투 전송",
    description: "서명 후 수신자 공개키로 암호화된 메시지 전송",
    href: "/dashboard/envelope",
    buttonText: "전자봉투 이동",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Security Protocol Project
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
            Certificate Auth Service
          </h1>

          <p className="mt-4 max-w-3xl text-lg text-slate-600">
            소셜 로그인, 인증서 발급, 전자서명 로그인, 전자봉투 전송 기능을
            제공하는 공개키 기반 보안 웹 서비스입니다.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              로그인 시작
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-900 hover:bg-slate-100"
            >
              대시보드 보기
            </Link>
          </div>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-slate-900">
                {feature.title}
              </h2>
              <p className="mt-2 min-h-12 text-sm text-slate-600">
                {feature.description}
              </p>
              <Link
                href={feature.href}
                className="mt-6 inline-block rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
              >
                {feature.buttonText}
              </Link>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}