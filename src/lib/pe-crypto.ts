/**
 * PE Digital Signing — Web Crypto API utilities
 * RSA-PSS 2048-bit, SHA-256 per FAC 61G15-23
 */

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function derToPem(der: ArrayBuffer, label: string): string {
  const base64 = bufferToBase64(der);
  const lines = base64.match(/.{1,64}/g) || [];
  return `-----BEGIN ${label}-----\n${lines.join('\n')}\n-----END ${label}-----`;
}

export async function generateSigningKeypair(): Promise<{
  publicKeyPem: string;
  privateKeyJwk: JsonWebKey;
  fingerprint: string;
}> {
  const keypair = await window.crypto.subtle.generateKey(
    {
      name: 'RSA-PSS',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['sign', 'verify']
  );

  const publicKeyDer = await window.crypto.subtle.exportKey('spki', keypair.publicKey);
  const publicKeyPem = derToPem(publicKeyDer, 'PUBLIC KEY');
  const privateKeyJwk = await window.crypto.subtle.exportKey('jwk', keypair.privateKey);
  const fingerprintBuffer = await window.crypto.subtle.digest('SHA-256', publicKeyDer);
  const fingerprint = bufferToHex(fingerprintBuffer);

  return { publicKeyPem, privateKeyJwk, fingerprint };
}

export async function signDocument(
  documentBytes: Uint8Array,
  privateKeyJwk: JsonWebKey
): Promise<Uint8Array> {
  const privateKey = await window.crypto.subtle.importKey(
    'jwk',
    privateKeyJwk,
    { name: 'RSA-PSS', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await window.crypto.subtle.sign(
    { name: 'RSA-PSS', saltLength: 32 },
    privateKey,
    documentBytes as unknown as BufferSource
  );

  return new Uint8Array(signatureBuffer);
}

export async function encryptPrivateKey(
  privateKeyJwk: JsonWebKey,
  password: string
): Promise<{ encryptedBlob: string; salt: string; iv: string }> {
  const salt = new Uint8Array(32);
  window.crypto.getRandomValues(salt);
  const iv = new Uint8Array(12);
  window.crypto.getRandomValues(iv);

  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const aesKey = await window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt.buffer as ArrayBuffer, iterations: 310000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const plaintext = new TextEncoder().encode(JSON.stringify(privateKeyJwk));
  const ciphertext = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv.buffer as ArrayBuffer }, aesKey, plaintext);

  return {
    encryptedBlob: bufferToBase64(ciphertext),
    salt: bufferToBase64(salt.buffer as ArrayBuffer),
    iv: bufferToBase64(iv.buffer as ArrayBuffer),
  };
}

export async function decryptPrivateKey(
  encryptedBlob: string,
  salt: string,
  iv: string,
  password: string
): Promise<JsonWebKey> {
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const aesKey = await window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: base64ToBuffer(salt), iterations: 310000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  const ciphertext = base64ToBuffer(encryptedBlob);
  const plaintext = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToBuffer(iv) },
    aesKey,
    ciphertext
  );

  return JSON.parse(new TextDecoder().decode(plaintext));
}

export async function computeDocumentHash(pdfBytes: Uint8Array): Promise<string> {
  const hash = await window.crypto.subtle.digest('SHA-256', pdfBytes as unknown as BufferSource);
  return bufferToHex(hash);
}

export { bufferToHex, bufferToBase64, base64ToBuffer };
