"use client";

import { useState } from "react";
import { loadPrivateKey } from "@/lib/storage/local-private-key";
import { signMessageWithPrivateKeyPem } from "@/lib/client/sign";

type ChallengeResponse = {
  ok: boolean;
  challengeId?: string;
  challenge?: string;
  expiresAt?: string;
  certificate?: {
    id: string;
    serialNumber: string;
  };
  message?: string;
  error?: string;
};

type VerifyResponse = {
  ok: boolean;
  verified?: boolean;
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
  certificate?: {
    id: string;
    serialNumber: string;
  };
  message?: string;
  error?: string;
};

export default function CertLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [challengeId, setChallengeId] = useState("");
  const [challenge, setChallenge] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [signatureBase64, setSignatureBase64] = useState("");
  const [resultMessage, setResultMessage] = useState("");

  const requestChallenge = async () => {
    try {
      setIsLoading(true);
      setResultMessage("");
      setChallenge("");
      setChallengeId("");
      setSignatureBase64("");

      const res = await fetch("/api/sign-login/challenge", {
        method: "POST",
      });

      const data = (await res.json()) as ChallengeResponse;

      if (!res.ok || !data.ok || !data.challenge || !data.challengeId) {
        throw new Error(
          [data.message, data.error, `status=${res.status}`]
            .filter(Boolean)
            .join(" / ")
        );
      }

      setChallengeId(data.challengeId);
      setChallenge(data.challenge);
      setExpiresAt(data.expiresAt ?? "");
      setResultMessage(
        `Challenge 발급 완료 / Serial: ${data.certificate?.serialNumber ?? "-"}`
      );
    } catch (error) {
      setResultMessage(
        error instanceof Error ? error.message : "알 수 없는 오류"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const signChallenge = async () => {
    try {
      setIsLoading(true);
      setResultMessage("");

      const privateKeyPem = loadPrivateKey();

      if (!privateKeyPem) {
        throw new Error("브라우저에 저장된 개인키가 없습니다. 먼저 인증서를 발급하세요.");
      }

      if (!challenge) {
        throw new Error("먼저 challenge를 발급받아야 합니다.");
      }

      const signature = await signMessageWithPrivateKeyPem(
        privateKeyPem,
        challenge
      );

      setSignatureBase64(signature);
      setResultMessage("Challenge 서명 완료");
    } catch (error) {
      setResultMessage(
        error instanceof Error ? error.message : "알 수 없는 오류"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const verifySignature = async () => {
    try {
      setIsLoading(true);
      setResultMessage("");

      if (!challengeId) {
        throw new Error("challengeId가 없습니다.");
      }

      if (!signatureBase64) {
        throw new Error("서명값이 없습니다. 먼저 서명하세요.");
      }

      const res = await fetch("/api/sign-login/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          challengeId,
          signatureBase64,
        }),
      });

      const data = (await res.json()) as VerifyResponse;

      if (!res.ok || !data.ok || !data.verified) {
        throw new Error(
          [data.message, data.error, `status=${res.status}`]
            .filter(Boolean)
            .join(" / ")
        );
      }

      setResultMessage(
        `전자서명 검증 성공 / 사용자: ${data.user?.email ?? "-"} / Serial: ${
          data.certificate?.serialNumber ?? "-"
        }`
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
        <h1 className="text-2xl font-bold">전자서명 로그인</h1>
        <p className="mt-2 text-sm text-slate-600">
          서버가 challenge를 발급하고, 브라우저의 개인키로 서명한 뒤 서버가 공개키로 검증합니다.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={requestChallenge}
            disabled={isLoading}
            className="rounded-xl bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
          >
            1. Challenge 발급
          </button>

          <button
            type="button"
            onClick={signChallenge}
            disabled={isLoading}
            className="rounded-xl border px-4 py-2 text-sm disabled:opacity-50"
          >
            2. Challenge 서명
          </button>

          <button
            type="button"
            onClick={verifySignature}
            disabled={isLoading}
            className="rounded-xl border px-4 py-2 text-sm disabled:opacity-50"
          >
            3. 서명 검증
          </button>
        </div>

        {resultMessage ? (
          <p className="mt-4 text-sm text-slate-700">{resultMessage}</p>
        ) : null}
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Challenge</h2>
        {expiresAt ? (
          <p className="mt-2 text-xs text-slate-500">
            만료 시각: {new Date(expiresAt).toLocaleString()}
          </p>
        ) : null}
        <textarea
          value={challenge}
          readOnly
          className="mt-4 min-h-35 w-full rounded-xl border p-3 text-xs"
        />
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">서명 결과(Base64)</h2>
        <textarea
          value={signatureBase64}
          readOnly
          className="mt-4 min-h-45 w-full rounded-xl border p-3 text-xs"
        />
      </section>
    </main>
  );
}