export default function CertIssuePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">인증서 발급</h1>
      <p className="mt-2 text-slate-600">
        클라이언트에서 키쌍을 생성하고 공개키를 서버에 제출해 인증서를
        발급받습니다.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Step 1</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">
            키쌍 생성
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            브라우저에서 개인키/공개키를 생성합니다. 개인키는 로컬 저장소에
            보관하고, 공개키만 서버에 전송합니다.
          </p>

          <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
            키쌍 생성 버튼 UI 예정
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Step 2</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">
            인증서 발급 요청
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            공개키를 제출하면 서버가 CA 개인키로 사용자 인증서를 발급하고 DB에
            저장합니다.
          </p>

          <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
            인증서 발급 요청 폼 예정
          </div>
        </section>
      </div>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">인증서 결과</h2>
        <p className="mt-2 text-sm text-slate-600">
          발급 성공 시 PEM 형식 인증서와 상태 정보가 표시됩니다.
        </p>

        <div className="mt-4 rounded-xl bg-slate-950 p-4 text-sm text-slate-200">
          -----BEGIN CERTIFICATE-----
          <br />
          발급 후 인증서 내용 표시 예정
          <br />
          -----END CERTIFICATE-----
        </div>
      </section>
    </div>
  );
}