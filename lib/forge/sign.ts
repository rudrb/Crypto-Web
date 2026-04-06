import "server-only";
import forge from "node-forge";

export function verifySignatureWithPublicKey(
  publicKeyPem: string,
  message: string,
  signatureBase64: string
) {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  const md = forge.md.sha256.create();
  md.update(message, "utf8");

  return publicKey.verify(
    md.digest().bytes(),
    forge.util.decode64(signatureBase64)
  );
}