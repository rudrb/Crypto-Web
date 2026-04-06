const PRIVATE_KEY_STORAGE_KEY = "cert-auth.private-key";

export function savePrivateKey(privateKeyPem: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PRIVATE_KEY_STORAGE_KEY, privateKeyPem);
}

export function loadPrivateKey() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PRIVATE_KEY_STORAGE_KEY);
}

export function removePrivateKey() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PRIVATE_KEY_STORAGE_KEY);
}