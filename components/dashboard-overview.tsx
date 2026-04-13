import Link from "next/link";

type DashboardOverviewProps = {
  isLoggedIn: boolean;
  hasCertificate: boolean;
  receivedCount: number;
};

function StatusCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-3 text-base text-slate-600">{description}</p>
    </div>
  );
}

function QuickAction({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border border-slate-200 px-5 py-4 transition hover:border-slate-300 hover:bg-slate-50"
    >
      <p className="text-lg font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </Link>
  );
}

export default function DashboardOverview({
  isLoggedIn,
  hasCertificate,
  receivedCount,
}: DashboardOverviewProps) {
  const loginLabel = isLoggedIn ? "연결됨" : "미연결";
  const certLabel = hasCertificate ? "발급 완료" : "미발급";
  const messageLabel = `${receivedCount}건`;

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-950">
            대시보드
          </h1>
          <p className="mt-3 text-xl text-slate-600">
            내 인증 상태와 전자봉투 수신 현황을 한눈에 확인하세요.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/cert/issue"
            className="inline-flex items-center rounded-2xl bg-slate-950 px-6 py-3 text-base font-semibold text-white transition hover:opacity-90"
          >
            인증서 발급
          </Link>
          <Link
            href="/envelope/send"
            className="inline-flex items-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            전자봉투 전송
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatusCard
          title="로그인 상태"
          value={loginLabel}
          description="Google 계정 연동 상태입니다."
        />
        <StatusCard
          title="인증서 상태"
          value={certLabel}
          description="현재 인증서 발급 여부입니다."
        />
        <StatusCard
          title="받은 메시지"
          value={messageLabel}
          description="수신한 전자봉투 개수입니다."
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950">
            빠른 작업
          </h2>

          <div className="mt-6 space-y-4">
            <QuickAction
              href="/cert/issue"
              title="인증서 발급하기"
              description="브라우저에서 키를 생성하고 인증서를 발급합니다."
            />
            <QuickAction
              href="/cert/login"
              title="전자서명 로그인"
              description="Challenge 서명으로 본인 인증을 진행합니다."
            />
            <QuickAction
              href="/envelope/send"
              title="전자봉투 보내기"
              description="수신자 공개키로 암호화하여 메시지를 전송합니다."
            />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950">
            이용 안내
          </h2>

          <div className="mt-6 space-y-4 text-base leading-7 text-slate-700">
            <p>인증서 발급 후 전자서명 로그인 기능을 사용할 수 있습니다.</p>
            <p>전자봉투는 수신자 공개키로 암호화되어 전송됩니다.</p>
            <p>받은 메시지는 메시지함에서 확인할 수 있습니다.</p>
          </div>
        </div>
      </div>
    </section>
  );
}