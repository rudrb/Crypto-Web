export default function CertIssuePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">인증서 발급</h1>
      <p className="mt-2 text-slate-600">
        클라이언트 키쌍 생성 후 공개키를 서버에 제출하여 인증서를 발급받습니다.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="font-semibold">1. 키쌍 생성</h2>
          <p className="mt-2 text-sm text-slate-600">개인키/공개키 생성 UI 예정</p>
        </div>
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="font-semibold">2. 인증서 발급 요청</h2>
          <p className="mt-2 text-sm text-slate-600">공개키 제출 및 인증서 수신 UI 예정</p>
        </div>
      </div>
    </div>
  );
}