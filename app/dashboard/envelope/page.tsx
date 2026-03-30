export default function EnvelopePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">전자봉투 전송</h1>
      <p className="mt-2 text-slate-600">
        송신자가 서명하고 수신자 공개키로 암호화한 메시지를 전송합니다.
      </p>

      <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="font-semibold">전자봉투 작성</h2>
        <p className="mt-2 text-sm text-slate-600">
          수신자 선택, 메시지 입력, 서명 후 암호화 UI 예정
        </p>
      </div>
    </div>
  );
}