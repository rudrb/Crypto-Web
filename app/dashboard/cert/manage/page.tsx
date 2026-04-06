export default function CertificateManagePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">인증서 관리</h1>
      <p className="mt-2 text-slate-600">
        현재 로그인한 계정의 인증서 발급 상태와 상세 정보를 확인합니다.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">인증서 상태</p>
          <h2 className="mt-3 text-2xl font-bold text-slate-900">미발급</h2>
          <p className="mt-2 text-sm text-slate-600">
            아직 발급된 인증서가 없습니다.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">시리얼 번호</p>
          <h2 className="mt-3 text-lg font-bold text-slate-900">-</h2>
          <p className="mt-2 text-sm text-slate-600">
            인증서 발급 후 표시됩니다.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">유효기간</p>
          <h2 className="mt-3 text-lg font-bold text-slate-900">-</h2>
          <p className="mt-2 text-sm text-slate-600">
            발급일과 만료일이 표시됩니다.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">인증서 상세정보</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="rounded-xl bg-slate-50 p-4">주체(CN): -</div>
            <div className="rounded-xl bg-slate-50 p-4">발급자(Issuer): -</div>
            <div className="rounded-xl bg-slate-50 p-4">상태(Status): 미발급</div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">PEM 출력</h2>
          <p className="mt-2 text-sm text-slate-600">
            발급 성공 후 인증서 PEM 형식이 여기에 표시됩니다.
          </p>

          <div className="mt-4 rounded-xl bg-slate-950 p-4 text-sm text-slate-200">
            -----BEGIN CERTIFICATE-----
            <br />
            아직 발급된 인증서가 없습니다.
            <br />
            -----END CERTIFICATE-----
          </div>
        </section>
      </div>
    </div>
  );
} 