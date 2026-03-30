export default function SignatureLoginPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">전자서명 로그인</h1>
      <p className="mt-2 text-slate-600">
        서버 challenge에 대해 개인키로 서명하고, 서버는 인증서의 공개키로
        서명을 검증합니다.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Challenge 수신</h2>
          <p className="mt-2 text-sm text-slate-600">
            서버에서 nonce 또는 challenge 값을 발급합니다.
          </p>

          <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            challenge-value-example
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">서명 및 검증</h2>
          <p className="mt-2 text-sm text-slate-600">
            개인키로 서명을 생성하고 서버가 검증합니다.
          </p>

          <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
            전자서명 생성 버튼 / 검증 결과 UI 예정
          </div>
        </section>
      </div>
    </div>
  );
}