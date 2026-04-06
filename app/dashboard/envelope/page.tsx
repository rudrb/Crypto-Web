"use client";

import { useState } from "react";
import { loadPrivateKey } from "@/lib/storage/local-private-key";
import { signMessageWithPrivateKeyPem } from "@/lib/client/sign";

type SendResponse = {
  ok: boolean;
  envelope?: {
    id: string;
    subject: string | null;
    status: string;
    createdAt: string;
  };
  message?: string;
  error?: string;
};

export default function EnvelopePage() {
  const [receiverEmail, setReceiverEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [plaintext, setPlaintext] = useState("");
  const [resultMessage, setResultMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    try {
      setIsLoading(true);
      setResultMessage("");

      const privateKeyPem = loadPrivateKey();

      if (!privateKeyPem) {
        throw new Error("브라우저에 저장된 개인키가 없습니다. 먼저 인증서를 발급하세요.");
      }

      if (!receiverEmail.trim()) {
        throw new Error("수신자 이메일을 입력하세요.");
      }

      if (!plaintext.trim()) {
        throw new Error("메시지 내용을 입력하세요.");
      }

      const signatureBase64 = await signMessageWithPrivateKeyPem(
        privateKeyPem,
        plaintext
      );

      const res = await fetch("/api/envelope/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverEmail: receiverEmail.trim(),
          subject: subject.trim() || undefined,
          plaintext,
          signatureBase64,
        }),
      });

      const data = (await res.json()) as SendResponse;

      if (!res.ok || !data.ok || !data.envelope) {
        throw new Error(
          [data.message, data.error, `status=${res.status}`]
            .filter(Boolean)
            .join(" / ")
        );
      }

      setResultMessage(
        `전자봉투 전송 성공 / id=${data.envelope.id} / status=${data.envelope.status}`
      );
      setSubject("");
      setPlaintext("");
    } catch (error) {
      setResultMessage(
        error instanceof Error ? error.message : "알 수 없는 오류"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">전자봉투 전송</h1>
        <p className="mt-2 text-sm text-slate-600">
          평문에 전자서명을 붙이고, 수신자 공개키로 암호화하여 서버에 저장합니다.
        </p>

        <div className="mt-6 grid gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium">수신자 이메일</label>
            <input
              value={receiverEmail}
              onChange={(e) => setReceiverEmail(e.target.value)}
              placeholder="receiver@example.com"
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">제목</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="메시지 제목"
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">평문</label>
            <textarea
              value={plaintext}
              onChange={(e) => setPlaintext(e.target.value)}
              placeholder="보낼 메시지 내용"
              className="min-h-45 w-full rounded-xl border p-3 text-sm"
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={handleSend}
            disabled={isLoading}
            className="rounded-xl bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
          >
            {isLoading ? "전송 중..." : "전자봉투 전송"}
          </button>
        </div>

        {resultMessage ? (
          <p className="mt-4 text-sm text-slate-700">{resultMessage}</p>
        ) : null}
      </section>
    </main>
  );
}