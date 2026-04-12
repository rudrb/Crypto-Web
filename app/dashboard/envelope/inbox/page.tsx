"use client";

import { useEffect, useState } from "react";
import { loadPrivateKey } from "@/lib/storage/local-private-key";
import { decryptEnvelopeWithPrivateKeyPem } from "@/lib/client/envelope";

type InboxItem = {
  id: string;
  subject: string | null;
  status: string;
  createdAt: string;
  readAt: string | null;
  sender: {
    id: string;
    name: string | null;
    email: string | null;
  };
};

type InboxResponse = {
  ok: boolean;
  items?: InboxItem[];
  message?: string;
  error?: string;
};

type DecryptPackageResponse = {
  ok: boolean;
  envelope?: {
    id: string;
    subject: string | null;
    ciphertext: string;
    encryptedKey: string;
    signature: string | null;
    createdAt: string;
    sender: {
      id: string;
      name: string | null;
      email: string | null;
    };
  };
  message?: string;
  error?: string;
};

export default function EnvelopeInboxPage() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [selectedEnvelopeId, setSelectedEnvelopeId] = useState("");
  const [decryptedMessage, setDecryptedMessage] = useState("");
  const [resultMessage, setResultMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loadInbox = async () => {
    try {
      setIsLoading(true);
      setResultMessage("");

      const res = await fetch("/api/envelope/inbox", {
        method: "GET",
        cache: "no-store",
      });

      const data = (await res.json()) as InboxResponse;

      if (!res.ok || !data.ok || !data.items) {
        throw new Error(
          [data.message, data.error, `status=${res.status}`]
            .filter(Boolean)
            .join(" / ")
        );
      }

      setItems(data.items);
    } catch (error) {
      setResultMessage(
        error instanceof Error ? error.message : "받은 메시지 조회 실패"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadInbox();
  }, []);

  const handleDecrypt = async (envelopeId: string) => {
    try {
      setIsLoading(true);
      setResultMessage("");
      setSelectedEnvelopeId(envelopeId);
      setDecryptedMessage("");

      const privateKeyPem = loadPrivateKey();

      if (!privateKeyPem) {
        throw new Error("브라우저에 저장된 개인키가 없습니다.");
      }

      const res = await fetch("/api/envelope/decrypt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          envelopeId,
        }),
      });

      const data = (await res.json()) as DecryptPackageResponse;

      if (!res.ok || !data.ok || !data.envelope) {
        throw new Error(
          [data.message, data.error, `status=${res.status}`]
            .filter(Boolean)
            .join(" / ")
        );
      }

      const plaintext = await decryptEnvelopeWithPrivateKeyPem({
        privateKeyPem,
        encryptedKeyBase64: data.envelope.encryptedKey,
        ciphertextJson: data.envelope.ciphertext,
      });

      setDecryptedMessage(plaintext);
      setResultMessage(
        `복호화 성공 / 보낸 사람: ${data.envelope.sender.email ?? "-"}`
      );

      await loadInbox();
    } catch (error) {
      setResultMessage(
        error instanceof Error ? error.message : "복호화 실패"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">받은 메시지함</h1>
            <p className="mt-2 text-sm text-slate-600">
              self-send 또는 수신된 전자봉투를 조회하고 복호화합니다.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadInbox()}
            disabled={isLoading}
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
        <h2 className="text-lg font-semibold">수신 메시지 목록</h2>

        {items.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">받은 메시지가 없습니다.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-xl border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{item.subject || "(제목 없음)"}</p>
                    <p>보낸 사람: {item.sender.email ?? "-"}</p>
                    <p>상태: {item.status}</p>
                    <p>생성: {new Date(item.createdAt).toLocaleString()}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleDecrypt(item.id)}
                    disabled={isLoading}
                    className="rounded-xl border px-4 py-2 text-sm disabled:opacity-50"
                  >
                    복호화
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">복호화 결과</h2>

        {selectedEnvelopeId ? (
          <p className="mt-2 text-xs text-slate-500">
            선택된 envelopeId: {selectedEnvelopeId}
          </p>
        ) : null}

        <textarea
          value={decryptedMessage}
          readOnly
          className="mt-4 min-h-55 w-full rounded-xl border p-3 text-sm"
        />
      </section>
    </main>
  );
}