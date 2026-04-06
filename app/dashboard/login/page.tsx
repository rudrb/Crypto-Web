"use client";

import { useMemo, useState } from "react";
import { loadPrivateKey } from "@/lib/storage/local-private-key";
import { signMessageWithPrivateKeyPem } from "@/lib/client/sign";

type ChallengeResponse = {
  challengeId: string;
  challenge: string;
  expiresAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  certificate: {
    id: string;
    serialNumber: string;
  };
  message?: string;
};

type VerifyResponse = {
  ok: boolean;
  verified?: boolean;
  user?: {
    id: string;
    name: string | null;
    email: string | null;
  };
  certificate?: {
    id: string;
    serialNumber: string;
  };
  message?: string;
};

export default function CertLoginPage() {
  const [email, setEmail] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [challenge, setChallenge] = useState("");
  const [challengeExpiresAt, setChallengeExpiresAt] = useState("");
  const [signatureBase64, setSignatureBase64] = useState("");
  const [resultMessage, setResultMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const hasPrivateKey = useMemo(() => {
    return !!loadPrivateKey();
  }, []);

  const requestChallenge = async () => {
    setIsLoading(true);
    setResultMessage("");
    setChallenge("");
    setSignatureBase64("");

    try {
      if (!email.trim() && !serialNumber.trim()) {
        throw new Error("이메일 또는 인증서 Serial Number 중 하나는 입력해야 합니다.");
      }

      const res = await fetch("/api/sign-login/challenge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim() || undefined,
          serialNumber: serialNumber.trim() || undefined,
        }),
      });

      const data = (await res.json()) as ChallengeResponse & { message?: string };

      if (!res.ok || !data.challenge) {
        throw new Error(data.message || "challenge 발급 실패");
      }

      setChallenge(data.challenge);
      setChallengeExpiresAt(data.expiresAt);
      setSerialNumber(data.certificate.serialNumber);
      setResultMessage("challenge 발급 완료");
    } catch (error) {
      setResultMessage(
        error instanceof Error ? error.message : "알 수 없는 오류"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const signChallenge = async () => {
    setIsLoading(true);
    setResultMessage("");

    try {
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
      setResultMessage("challenge 서명 완료");
    } catch (error) {
      setResultMessage(
        error instanceof Error ? error.message : "알 수 없는 오류"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const verifySignedChallenge = async () => {
    setIsLoading(true);
    setResultMessage("");

    try {
      if (!challenge) {
        throw new Error("challenge가 없습니다.");
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
          challenge,
          signatureBase64,
          serialNumber: serialNumber.trim() || undefined,
        }),
      });

      const data = (await res.json()) as VerifyResponse;

      if (!res.ok || !data.ok || !data.verified) {
        throw new Error(data.message || "전자서명 로그인 검증 실패");
      }

      setResultMessage(
        `서명 검증 성공 / 사용자: ${data.user?.email ?? "-"} / 인증서: ${
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
          challenge를 발급받고, 브라우저에 저장된 개인키로 서명한 뒤 서버에서
          검증합니다.
        </p>

        <div className="mt-4 rounded-xl border p-4 text-sm">
          <p>
            개인키 저장 상태:{" "}
            <span className={hasPrivateKey ? "font-semibold" : "font-semibold text-red-600"}>
              {hasPrivateKey ? "있음" : "없음"}
            </span>
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              이메일
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              인증서 Serial Number
            </label>
            <input
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="발급 후 자동으로 채워질 수 있음"
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>
        </div>

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
            onClick={verifySignedChallenge}
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
        <h2 className="text-lg font-semibold">발급된 Challenge</h2>
        {challengeExpiresAt ? (
          <p className="mt-2 text-xs text-slate-500">
            만료 시각: {new Date(challengeExpiresAt).toLocaleString()}
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