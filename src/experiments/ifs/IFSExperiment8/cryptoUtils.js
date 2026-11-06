/**
 * cryptoUtils.js
 *
 * Browser-native cryptography helpers for the Digital Signature experiment.
 * Uses the Web Crypto API (window.crypto.subtle) with RSA-PSS (2048-bit)
 * signatures over SHA-256 digests.
 *
 * NOTE: These keys are generated client-side purely for educational
 * demonstration. They are not backed by any certificate authority or
 * key-management infrastructure and must never be used for real security.
 */

const RSA_ALGORITHM = "RSA-PSS";
const HASH_ALGORITHM = "SHA-256";
const MODULUS_LENGTH = 2048;
const PUBLIC_EXPONENT = new Uint8Array([0x01, 0x00, 0x01]); // 65537
const PSS_SALT_LENGTH = 32; // bytes, matches SHA-256 digest size

const PEM_HEADER = "-----BEGIN PUBLIC KEY-----";
const PEM_FOOTER = "-----END PUBLIC KEY-----";

/* ---------------------------------------------------------------------- */
/* Low-level helpers                                                       */
/* ---------------------------------------------------------------------- */

function getSubtle() {
  const subtle =
    (typeof window !== "undefined" && window.crypto && window.crypto.subtle) ||
    (typeof crypto !== "undefined" && crypto.subtle);
  if (!subtle) {
    throw new Error(
      "Web Crypto API (crypto.subtle) is unavailable in this browser context."
    );
  }
  return subtle;
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(
      null,
      bytes.subarray(i, i + chunkSize)
    );
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const cleaned = base64.replace(/\s+/g, "");
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function arrayBufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function isLikelyBase64(str) {
  if (!str || typeof str !== "string") return false;
  const trimmed = str.trim();
  if (trimmed.length === 0 || trimmed.length % 4 !== 0) return false;
  return /^[A-Za-z0-9+/]+={0,2}$/.test(trimmed);
}

function stripPem(pem) {
  return pem
    .replace(PEM_HEADER, "")
    .replace(PEM_FOOTER, "")
    .replace(/-----BEGIN [^-]+-----/, "")
    .replace(/-----END [^-]+-----/, "")
    .replace(/\s+/g, "");
}

function wrapPem(base64) {
  const lines = base64.match(/.{1,64}/g) || [base64];
  return [PEM_HEADER, ...lines, PEM_FOOTER].join("\n");
}

/* ---------------------------------------------------------------------- */
/* Public API                                                              */
/* ---------------------------------------------------------------------- */

/**
 * Generates a new RSA-PSS key pair (2048-bit modulus, SHA-256).
 * Returns { publicKey, privateKey } as CryptoKey objects.
 */
export async function generateKeyPair() {
  const subtle = getSubtle();
  const keyPair = await subtle.generateKey(
    {
      name: RSA_ALGORITHM,
      modulusLength: MODULUS_LENGTH,
      publicExponent: PUBLIC_EXPONENT,
      hash: HASH_ALGORITHM,
    },
    true, // extractable so the public key can be exported/displayed
    ["sign", "verify"]
  );
  return keyPair;
}

/**
 * Computes the SHA-256 digest of a UTF-8 message and returns it as a
 * lowercase hex string.
 */
export async function calculateHash(message) {
  const subtle = getSubtle();
  const encoded = new TextEncoder().encode(message);
  const digest = await subtle.digest(HASH_ALGORITHM, encoded);
  return arrayBufferToHex(digest);
}

/**
 * Signs a UTF-8 message with the supplied RSA-PSS private key.
 * Returns the signature as a Base64 string.
 */
export async function createSignature(privateKey, message) {
  if (!privateKey) {
    throw new Error("A private key is required to create a signature.");
  }
  const subtle = getSubtle();
  const encoded = new TextEncoder().encode(message);
  const signatureBuffer = await subtle.sign(
    { name: RSA_ALGORITHM, saltLength: PSS_SALT_LENGTH },
    privateKey,
    encoded
  );
  return arrayBufferToBase64(signatureBuffer);
}

/**
 * Verifies a Base64 signature against a message using a PEM-formatted
 * (or bare Base64) SPKI public key string.
 * Returns true/false. Throws on malformed key/signature input so callers
 * can surface a meaningful error message.
 */
export async function verifySignature(publicKeyString, signatureBase64, message) {
  const subtle = getSubtle();
  const publicKey = await importPublicKey(publicKeyString);

  let signatureBuffer;
  try {
    signatureBuffer = base64ToArrayBuffer(signatureBase64);
  } catch {
    throw new Error("Signature is not valid Base64 data.");
  }

  const encoded = new TextEncoder().encode(message);
  return subtle.verify(
    { name: RSA_ALGORITHM, saltLength: PSS_SALT_LENGTH },
    publicKey,
    signatureBuffer,
    encoded
  );
}

/**
 * Exports a CryptoKey public key to a PEM-formatted SPKI string, suitable
 * for display and for round-tripping back through importPublicKey.
 */
export async function exportPublicKey(publicKey) {
  if (!publicKey) {
    throw new Error("A public key is required to export.");
  }
  const subtle = getSubtle();
  const spki = await subtle.exportKey("spki", publicKey);
  const base64 = arrayBufferToBase64(spki);
  return wrapPem(base64);
}

/**
 * Imports a PEM-formatted (or bare Base64) SPKI public key string back
 * into a CryptoKey usable for verification.
 */
export async function importPublicKey(publicKeyString) {
  if (!publicKeyString || !publicKeyString.trim()) {
    throw new Error("A public key is required.");
  }
  const subtle = getSubtle();
  const base64 = stripPem(publicKeyString);

  if (!isLikelyBase64(base64)) {
    throw new Error("The supplied public key is not valid Base64/PEM data.");
  }

  let spkiBuffer;
  try {
    spkiBuffer = base64ToArrayBuffer(base64);
  } catch {
    throw new Error("The supplied public key could not be decoded.");
  }

  try {
    return await subtle.importKey(
      "spki",
      spkiBuffer,
      { name: RSA_ALGORITHM, hash: HASH_ALGORITHM },
      true,
      ["verify"]
    );
  } catch {
    throw new Error("The supplied public key is not a valid RSA-PSS SPKI key.");
  }
}

/**
 * Lightweight synchronous sanity check on the signature/public key fields
 * before attempting the (async) cryptographic verification. Lets the UI
 * show a fast, specific error instead of a generic failure.
 */
export function validateSignatureInput(signature, publicKey) {
  if (!signature || !signature.trim()) {
    return { valid: false, error: "Signature is empty." };
  }
  if (!publicKey || !publicKey.trim()) {
    return { valid: false, error: "Public key is empty." };
  }

  const cleanedSignature = signature.trim();
  if (!isLikelyBase64(cleanedSignature)) {
    return { valid: false, error: "Signature is not valid Base64 data." };
  }

  const cleanedKey = stripPem(publicKey);
  if (!isLikelyBase64(cleanedKey)) {
    return { valid: false, error: "Public key is not valid Base64/PEM data." };
  }

  return { valid: true, error: "" };
}

/** Digest length in bits for each supported display algorithm. */
export const DIGEST_BITS = {
  "SHA-256": 256,
};

export async function calculateDigest(message, algorithm) {
  return calculateHash(message);
}