import "server-only";
import forge from "node-forge";

export function publicKeyFromPem(publicKeyPem: string) {
  return forge.pki.publicKeyFromPem(publicKeyPem);
}

export function privateKeyFromPem(privateKeyPem: string) {
  return forge.pki.privateKeyFromPem(privateKeyPem);
}

export function certificateFromPem(certificatePem: string) {
  return forge.pki.certificateFromPem(certificatePem);
}

export function certificateToPem(cert: forge.pki.Certificate) {
  return forge.pki.certificateToPem(cert);
}