import "server-only";
import forge from "node-forge";

/**
 * Generate an RSA keypair for use with client certificates.  This helper
 * produces PEM-encoded keys suitable for storage and subsequent use in
 * cryptographic operations like signing and encryption.  By default a
 * 2048-bit key is created, which offers a good balance between security
 * and performance.  Increase the key size if your threat model demands
 * greater security.
 *
 * @param bits The key length in bits.  Defaults to 2048.
 * @returns An object containing the public and private keys in PEM format.
 */
export function generateKeypair(bits: number = 2048): {
  publicKeyPem: string;
  privateKeyPem: string;
} {
  // node-forge will synchronously generate a new RSA keypair.  The
  // exponent 0x10001 (65537) is the de-facto standard for RSA.  For
  // browser environments a web worker should be used to avoid blocking
  // the main thread, but server code executes synchronously.
  const { publicKey, privateKey } = forge.pki.rsa.generateKeyPair({
    bits,
    e: 0x10001,
  });
  const publicKeyPem = forge.pki.publicKeyToPem(publicKey);
  const privateKeyPem = forge.pki.privateKeyToPem(privateKey);
  return { publicKeyPem, privateKeyPem };
}
