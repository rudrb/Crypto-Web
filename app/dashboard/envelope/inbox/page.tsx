export default function InboxPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">받은 메시지함</h1>
      <p className="mt-2 text-slate-600">
        수신된 전자봉투 목록과 복호화 결과가 표시됩니다.
      </p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
          받은 메시지 테이블 UI 예정
        </div>
      </div>
    </div>
  );
}