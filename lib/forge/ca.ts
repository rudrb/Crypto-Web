import * as forge from "node-forge";

export function verifyCertificate(certPem: string, caCertPem: string): boolean {
  try {
    const cert = forge.pki.certificateFromPem(certPem);
    const caCert = forge.pki.certificateFromPem(caCertPem);

    const now = new Date();

    if (now < cert.validity.notBefore || now > cert.validity.notAfter) {
      return false;
    }

    const caStore = forge.pki.createCaStore([caCert]);

    forge.pki.verifyCertificateChain(caStore, [cert]);

    return true;
  } catch {
    return false;
  }
}