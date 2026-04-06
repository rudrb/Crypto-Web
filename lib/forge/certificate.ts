import "server-only";
import forge from "node-forge";
import crypto from "node:crypto";

function randomSerialNumber() {
  return crypto.randomBytes(12).toString("hex");
}

export function issueCertificate(params: {
  userEmail: string;
  userName?: string | null;
  publicKeyPem: string;
  caCertPem: string;
  caPrivateKeyPem: string;
  days?: number;
}) {
  const {
    userEmail,
    userName,
    publicKeyPem,
    caCertPem,
    caPrivateKeyPem,
    days = 365,
  } = params;

  const cert = forge.pki.createCertificate();
  cert.publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  cert.serialNumber = randomSerialNumber();

  const now = new Date();
  const expiresAt = new Date();
  expiresAt.setDate(now.getDate() + days);

  cert.validity.notBefore = now;
  cert.validity.notAfter = expiresAt;

  const caCert = forge.pki.certificateFromPem(caCertPem);
  const caPrivateKey = forge.pki.privateKeyFromPem(caPrivateKeyPem);

  cert.setSubject([
    { name: "commonName", value: userEmail },
    { name: "organizationName", value: "Cert Auth Service" },
    { name: "organizationalUnitName", value: userName || "User" },
  ]);

  cert.setIssuer(caCert.subject.attributes);

  cert.setExtensions([
    { name: "basicConstraints", cA: false },
    { name: "keyUsage", digitalSignature: true, keyEncipherment: true },
    { name: "extKeyUsage", clientAuth: true, emailProtection: true },
    { name: "subjectKeyIdentifier" },
  ]);

  cert.sign(caPrivateKey, forge.md.sha256.create());

  return {
    serialNumber: cert.serialNumber,
    certificatePem: forge.pki.certificateToPem(cert),
    issuedAt: cert.validity.notBefore,
    expiresAt: cert.validity.notAfter,
  };
}