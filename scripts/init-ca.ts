import fs from "node:fs";
import forge from "node-forge";

const pki = forge.pki;

// 1) CA 키쌍 생성
const keys = pki.rsa.generateKeyPair(2048);

// 2) 자기서명 루트 인증서 생성
const cert = pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = Date.now().toString(16);

const now = new Date();
const notAfter = new Date();
notAfter.setFullYear(now.getFullYear() + 10);

cert.validity.notBefore = now;
cert.validity.notAfter = notAfter;

const attrs = [
  { name: "commonName", value: "Cert Auth Service Root CA" },
  { name: "countryName", value: "KR" },
  { shortName: "ST", value: "Seoul" },
  { name: "localityName", value: "Seoul" },
  { name: "organizationName", value: "Cert Auth Service" },
  { shortName: "OU", value: "Development CA" },
];

cert.setSubject(attrs);
cert.setIssuer(attrs);

cert.setExtensions([
  { name: "basicConstraints", cA: true },
  {
    name: "keyUsage",
    keyCertSign: true,
    digitalSignature: true,
    cRLSign: true,
  },
  { name: "subjectKeyIdentifier" },
]);

cert.sign(keys.privateKey, forge.md.sha256.create());

// 3) PEM 변환
const certPem = pki.certificateToPem(cert);
const privateKeyPem = pki.privateKeyToPem(keys.privateKey);

// 4) 파일 저장
fs.writeFileSync("ca-cert.pem", certPem, "utf8");
fs.writeFileSync("ca-private-key.pem", privateKeyPem, "utf8");

// 5) .env.local에 바로 붙여넣을 수 있게 escape
const escapedCertPem = certPem.replace(/\n/g, "\\n");
const escapedPrivateKeyPem = privateKeyPem.replace(/\n/g, "\\n");

console.log("\n[FILES]");
console.log("ca-cert.pem 생성 완료");
console.log("ca-private-key.pem 생성 완료");

console.log("\n[.env.local에 추가]");
console.log(`CA_CERT_PEM="${escapedCertPem}"`);
console.log(`CA_PRIVATE_KEY_PEM="${escapedPrivateKeyPem}"`);