function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");

  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
}

export async function decryptEnvelopeWithPrivateKeyPem(params: {
  privateKeyPem: string;
  encryptedKeyBase64: string;
  ciphertextJson: string;
}) {
  const { privateKeyPem, encryptedKeyBase64, ciphertextJson } = params;

  const privateKey = await window.crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(privateKeyPem),
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    false,
    ["decrypt"]
  );

  const aesKeyRaw = await window.crypto.subtle.decrypt(
    {
      name: "RSA-OAEP",
    },
    privateKey,
    base64ToArrayBuffer(encryptedKeyBase64)
  );

  const aesKey = await window.crypto.subtle.importKey(
    "raw",
    aesKeyRaw,
    {
      name: "AES-CBC",
    },
    false,
    ["decrypt"]
  );

  const parsedCipher = JSON.parse(ciphertextJson) as {
    iv: string;
    data: string;
  };

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: "AES-CBC",
      iv: new Uint8Array(base64ToArrayBuffer(parsedCipher.iv)),
    },
    aesKey,
    base64ToArrayBuffer(parsedCipher.data)
  );

  return new TextDecoder().decode(decrypted);
}