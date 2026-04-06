const CERT_STORAGE_KEY = "cert-auth.certificate";

export function saveCertificate(certificatePem: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CERT_STORAGE_KEY, certificatePem);
}

export function loadCertificate() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CERT_STORAGE_KEY);
}

export function removeCertificate() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CERT_STORAGE_KEY);
}