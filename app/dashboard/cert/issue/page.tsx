"use client";

import { useState } from "react";
import { generateRsaKeyPairPem } from "@/lib/client/keypair";
import { savePrivateKey } from "@/lib/storage/local-private-key";
import { saveCertificate } from "@/lib/storage/local-cert";

type IssueResponse = {
  ok: boolean;
  certificate?: {
    id: string;
    serialNumber: string;
    status: string;
    issuedAt: string;
    expiresAt: string | null;
    certificatePem: string;
  };
  message?: string;
  error?: string;
};

export default function CertIssuePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [publicKeyPem, setPublicKeyPem] = useState("");
  const [certificatePem, setCertificatePem] = useState("");
  const [resultMessage, setResultMessage] = useState("");

  const handleIssueCertificate = async () => {
    try {
      setIsLoading(true);
      setResultMessage("");
      setCertificatePem("");

      const { publicKeyPem, privateKeyPem } = await generateRsaKeyPairPem();
      setPublicKeyPem(publicKeyPem);

      const res = await fetch("/api/cert/issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicKeyPem,
        }),
      });

      const text = await res.text();
      let data: IssueResponse | null = null;

      try {
        data = text ? (JSON.parse(text) as IssueResponse) : null;
      } catch {
        throw new Error(
          `서버가 JSON이 아닌 응답을 반환했습니다. status=${res.status}`
        );
      }

      if (!res.ok || !data?.ok || !data.certificate) {
        throw new Error(
          data?.message || data?.error || `인증서 발급 실패 (status=${res.status})`
        );
      }

      savePrivateKey(privateKeyPem);
      saveCertificate(data.certificate.certificatePem);
      setCertificatePem(data.certificate.certificatePem);

      setResultMessage(
        `인증서 발급 완료 / Serial: ${data.certificate.serialNumber}`
      );
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
        <h1 className="text-2xl font-bold">인증서 발급</h1>
        <p className="mt-2 text-sm text-slate-600">
          브라우저에서 키쌍을 생성하고, 공개키만 서버로 보내 인증서를 발급합니다.
        </p>

        <div className="mt-6">
          <button
            type="button"
            onClick={handleIssueCertificate}
            disabled={isLoading}
            className="rounded-xl bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
          >
            {isLoading ? "발급 중..." : "키 생성 및 인증서 발급"}
          </button>
        </div>

        {resultMessage ? (
          <p className="mt-4 text-sm text-slate-700">{resultMessage}</p>
        ) : null}
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">생성된 공개키</h2>
        <textarea
          value={publicKeyPem}
          readOnly
          className="mt-4 min-h-45 w-full rounded-xl border p-3 text-xs"
        />
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">발급된 인증서</h2>
        <textarea
          value={certificatePem}
          readOnly
          className="mt-4 min-h-65 w-full rounded-xl border p-3 text-xs"
        />
      </section>
    </main>
  );
}