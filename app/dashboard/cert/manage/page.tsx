"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  loadCertificate,
  removeCertificate,
} from "@/lib/storage/local-cert";
import {
  loadPrivateKey,
  removePrivateKey,
} from "@/lib/storage/local-private-key";

type CertificateItem = {
  id: string;
  serialNumber: string;
  status: string;
  issuedAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  certificatePem: string;
};

type MeResponse = {
  ok: boolean;
  id: string | null;
  name: string | null;
  email: string | null;
  image: string | null;
  certificates: CertificateItem[];
  message?: string;
  error?: string;
};

type RevokeResponse = {
  ok: boolean;
  certificate?: {
    id: string;
    serialNumber: string;
    status: string;
    revokedAt: string | null;
  };
  message?: string;
  error?: string;
};

export default function CertManagePage() {
  const [userData, setUserData] = useState<MeResponse | null>(null);
  const [localCert, setLocalCert] = useState<string | null>(null);
  const [hasPrivateKey, setHasPrivateKey] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRevokingId, setIsRevokingId] = useState<string | null>(null);

  const syncLocalState = useCallback(() => {
    setLocalCert(loadCertificate());
    setHasPrivateKey(!!loadPrivateKey());
  }, []);

  const loadManageData = useCallback(async () => {
    try {
      setIsLoading(true);
      setResultMessage("");

      const res = await fetch("/api/user/me", {
        method: "GET",
        cache: "no-store",
      });

      const data = (await res.json()) as MeResponse;

      if (!res.ok || !data.ok) {
        throw new Error(
          [data.message, data.error, `status=${res.status}`]
            .filter(Boolean)
            .join(" / ")
        );
      }

      setUserData(data);
      syncLocalState();
    } catch (error) {
      setResultMessage(
        error instanceof Error ? error.message : "관리 정보 조회 실패"
      );
    } finally {
      setIsLoading(false);
    }
  }, [syncLocalState]);

  useEffect(() => {
    void loadManageData();
  }, [loadManageData]);

  useEffect(() => {
    const onFocus = () => {
      syncLocalState();
      void loadManageData();
    };

    const onVisibility = () => {
      if (!document.hidden) {
        syncLocalState();
        void loadManageData();
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [loadManageData, syncLocalState]);

  const activeCertificates = useMemo(
    () => userData?.certificates.filter((c) => c.status === "ACTIVE") ?? [],
    [userData]
  );

  const revokedCertificates = useMemo(
    () => userData?.certificates.filter((c) => c.status === "REVOKED") ?? [],
    [userData]
  );

  const handleRefresh = async () => {
    syncLocalState();
    await loadManageData();
  };

  const handleClearLocal = () => {
    removeCertificate();
    removePrivateKey();
    syncLocalState();
    setResultMessage("브라우저에 저장된 인증서와 개인키를 삭제했습니다.");
  };

  const handleRevoke = async (certificateId: string, certificatePem?: string) => {
    try {
      setIsRevokingId(certificateId);
      setResultMessage("");

      const res = await fetch("/api/cert/revoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          certificateId,
        }),
      });

      const data = (await res.json()) as RevokeResponse;

      if (!res.ok || !data.ok) {
        throw new Error(
          [data.message, data.error, `status=${res.status}`]
            .filter(Boolean)
            .join(" / ")
        );
      }

      if (localCert && certificatePem && localCert.trim() === certificatePem.trim()) {
        removeCertificate();
        removePrivateKey();
        syncLocalState();
      }

      setResultMessage(
        data.message
          ? `${data.message} / Serial: ${data.certificate?.serialNumber ?? "-"}`
          : `인증서 폐지 완료 / Serial: ${data.certificate?.serialNumber ?? "-"}`
      );

      await loadManageData();
    } catch (error) {
      setResultMessage(
        error instanceof Error ? error.message : "인증서 폐지 실패"
      );
    } finally {
      setIsRevokingId(null);
    }
  };

  return (
    <main className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">인증서 관리</h1>
            <p className="mt-2 text-sm text-slate-600">
              서버에 등록된 인증서와 브라우저에 저장된 인증서/개인키 상태를 확인합니다.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={isLoading || !!isRevokingId}
            className="rounded-xl border px-4 py-2 text-sm disabled:opacity-50"
          >
            새로고침
          </button>
        </div>

        {resultMessage ? (
          <p className="mt-4 text-sm text-slate-700">{resultMessage}</p>
        ) : null}
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">현재 로그인 사용자</h2>

        {isLoading && !userData ? (
          <p className="mt-4 text-sm text-slate-600">불러오는 중...</p>
        ) : (
          <div className="mt-4 space-y-2 text-sm">
            <p>이름: {userData?.name ?? "-"}</p>
            <p>이메일: {userData?.email ?? "-"}</p>
            <p>DB 사용자 ID: {userData?.id ?? "-"}</p>
          </div>
        )}
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">서버 등록 활성 인증서</h2>

        {activeCertificates.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">
            활성 인증서가 없습니다.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {activeCertificates.map((cert) => (
              <div key={cert.id} className="rounded-xl border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">Serial: {cert.serialNumber}</p>
                    <p>Status: {cert.status}</p>
                    <p>Issued: {new Date(cert.issuedAt).toLocaleString()}</p>
                    <p>
                      Expires:{" "}
                      {cert.expiresAt
                        ? new Date(cert.expiresAt).toLocaleString()
                        : "-"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleRevoke(cert.id, cert.certificatePem)}
                    disabled={isRevokingId === cert.id}
                    className="rounded-xl border px-4 py-2 text-sm disabled:opacity-50"
                  >
                    {isRevokingId === cert.id ? "폐지 중..." : "인증서 폐지"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">폐지된 인증서</h2>

        {revokedCertificates.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">
            폐지된 인증서가 없습니다.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {revokedCertificates.map((cert) => (
              <div key={cert.id} className="rounded-xl border p-4 bg-slate-50">
                <div className="space-y-1 text-sm">
                  <p className="font-medium">Serial: {cert.serialNumber}</p>
                  <p>Status: {cert.status}</p>
                  <p>Issued: {new Date(cert.issuedAt).toLocaleString()}</p>
                  <p>
                    Revoked:{" "}
                    {cert.revokedAt
                      ? new Date(cert.revokedAt).toLocaleString()
                      : "-"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">브라우저 로컬 저장 상태</h2>

        <div className="mt-4 space-y-2 text-sm">
          <p>
            개인키 저장 여부:{" "}
            <span className={hasPrivateKey ? "font-semibold" : "font-semibold text-red-600"}>
              {hasPrivateKey ? "있음" : "없음"}
            </span>
          </p>
          <p>
            인증서 저장 여부:{" "}
            <span className={localCert ? "font-semibold" : "font-semibold text-red-600"}>
              {localCert ? "있음" : "없음"}
            </span>
          </p>
        </div>

        {localCert ? (
          <textarea
            value={localCert}
            readOnly
            className="mt-4 min-h-60 w-full rounded-xl border p-3 text-xs"
          />
        ) : null}

        <div className="mt-4">
          <button
            type="button"
            onClick={handleClearLocal}
            className="rounded-xl border px-4 py-2 text-sm"
          >
            로컬 인증서/개인키 삭제
          </button>
        </div>
      </section>
    </main>
  );
}