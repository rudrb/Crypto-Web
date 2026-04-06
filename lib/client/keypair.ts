function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return window.btoa(binary);
}

function base64ToPem(base64: string, label: string): string {
  const lines = base64.match(/.{1,64}/g)?.join("\n") ?? base64;
  return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----`;
}

export async function generateRsaKeyPairPem() {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"]
  );

  const publicKeySpki = await window.crypto.subtle.exportKey(
    "spki",
    keyPair.publicKey
  );

  const privateKeyPkcs8 = await window.crypto.subtle.exportKey(
    "pkcs8",
    keyPair.privateKey
  );

  const publicKeyPem = base64ToPem(
    arrayBufferToBase64(publicKeySpki),
    "PUBLIC KEY"
  );

  const privateKeyPem = base64ToPem(
    arrayBufferToBase64(privateKeyPkcs8),
    "PRIVATE KEY"
  );

  return {
    publicKeyPem,
    privateKeyPem,
  };
}