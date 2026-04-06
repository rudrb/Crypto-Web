import "server-only";
import forge from "node-forge";

export function encryptEnvelope(receiverPublicKeyPem: string, plaintext: string) {
  const aesKey = forge.random.getBytesSync(32);
  const iv = forge.random.getBytesSync(16);

  const cipher = forge.cipher.createCipher("AES-CBC", aesKey);
  cipher.start({ iv });
  cipher.update(forge.util.createBuffer(forge.util.encodeUtf8(plaintext)));
  const success = cipher.finish();

  if (!success) {
    throw new Error("AES encryption failed");
  }

  const receiverPublicKey = forge.pki.publicKeyFromPem(receiverPublicKeyPem);
  const encryptedKey = receiverPublicKey.encrypt(aesKey, "RSA-OAEP", {
    md: forge.md.sha256.create(),
    mgf1: { md: forge.md.sha1.create() },
  });

  return {
    ciphertext: JSON.stringify({
      iv: forge.util.encode64(iv),
      data: forge.util.encode64(cipher.output.getBytes()),
    }),
    encryptedKey: forge.util.encode64(encryptedKey),
  };
}