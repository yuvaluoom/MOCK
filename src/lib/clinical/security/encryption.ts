/**
 * MatchMind Clinical Documentation - Encryption Layer
 *
 * Medical-grade encryption for clinical data.
 * Uses AES-256-GCM for symmetric encryption with unique IVs.
 *
 * Key hierarchy:
 * 1. Master Key (HSM-stored in production)
 * 2. Data Encryption Keys (DEKs) - per-entity keys
 * 3. Key Encryption Keys (KEKs) - protect DEKs
 *
 * SECURITY CLASSIFICATION: CRITICAL
 */

import crypto from 'crypto';

// =============================================================================
// TYPES
// =============================================================================

export interface EncryptedData {
  ciphertext: Buffer;
  iv: Buffer;
  authTag: Buffer;
  keyId: string;
  version: string;
}

export interface EncryptedField {
  encryptedData: Buffer;
  iv: Buffer;
}

export interface KeyInfo {
  keyId: string;
  createdAt: Date;
  expiresAt?: Date;
  algorithm: string;
  purpose: string;
}

export interface EncryptionContext {
  entityType: string;
  entityId: string;
  therapistId: string;
  patientId: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits
const CURRENT_VERSION = 'v1';

// In production, this would be loaded from a secure key management service (HSM, AWS KMS, etc.)
// For development, we derive from environment variable
const getMasterKey = (): Buffer => {
  const masterKeyHex = process.env.CLINICAL_ENCRYPTION_MASTER_KEY;

  if (!masterKeyHex) {
    // In development, generate a deterministic key for testing
    // NEVER do this in production!
    if (process.env.NODE_ENV === 'development') {
      console.warn('[SECURITY WARNING] Using development encryption key. Never use in production!');
      return crypto.scryptSync('development-only-key', 'salt', KEY_LENGTH);
    }
    throw new Error('CLINICAL_ENCRYPTION_MASTER_KEY is required');
  }

  return Buffer.from(masterKeyHex, 'hex');
};

// =============================================================================
// KEY DERIVATION
// =============================================================================

/**
 * Derive a unique data encryption key for a specific entity
 * Uses HKDF (HMAC-based Key Derivation Function) for secure key derivation
 */
export function deriveDataEncryptionKey(context: EncryptionContext): Buffer {
  const masterKey = getMasterKey();

  // Create a unique context string for key derivation
  const contextString = [
    context.entityType,
    context.entityId,
    context.therapistId,
    context.patientId,
  ].join(':');

  // Use HKDF to derive a unique key
  const info = Buffer.from(contextString, 'utf-8');
  const salt = crypto.createHash('sha256').update('matchmind-clinical-v1').digest();

  const derivedKey = crypto.hkdfSync('sha256', masterKey, salt, info, KEY_LENGTH);
  return Buffer.from(derivedKey);
}

/**
 * Generate a new random data encryption key
 */
export function generateDataEncryptionKey(): Buffer {
  return crypto.randomBytes(KEY_LENGTH);
}

/**
 * Generate a unique key ID
 */
export function generateKeyId(): string {
  return `key_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
}

// =============================================================================
// ENCRYPTION / DECRYPTION
// =============================================================================

/**
 * Encrypt plaintext using AES-256-GCM
 */
export function encrypt(
  plaintext: string,
  key: Buffer,
  keyId: string
): EncryptedData {
  // Generate random IV for each encryption
  const iv = crypto.randomBytes(IV_LENGTH);

  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  // Encrypt
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf-8'),
    cipher.final(),
  ]);

  // Get authentication tag
  const authTag = cipher.getAuthTag();

  return {
    ciphertext: encrypted,
    iv,
    authTag,
    keyId,
    version: CURRENT_VERSION,
  };
}

/**
 * Decrypt ciphertext using AES-256-GCM
 */
export function decrypt(
  encryptedData: EncryptedData,
  key: Buffer
): string {
  // Create decipher
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    encryptedData.iv
  );

  // Set auth tag
  decipher.setAuthTag(encryptedData.authTag);

  // Decrypt
  const decrypted = Buffer.concat([
    decipher.update(encryptedData.ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString('utf-8');
}

/**
 * Encrypt a field for database storage
 * Returns encrypted data and IV as separate buffers (for Prisma Bytes fields)
 */
export function encryptField(
  plaintext: string,
  context: EncryptionContext
): EncryptedField {
  const key = deriveDataEncryptionKey(context);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf-8'),
    cipher.final(),
  ]);

  // Append auth tag to ciphertext for storage
  const authTag = cipher.getAuthTag();
  const encryptedWithTag = Buffer.concat([encrypted, authTag]);

  return {
    encryptedData: encryptedWithTag,
    iv,
  };
}

/**
 * Decrypt a field from database storage
 */
export function decryptField(
  encryptedData: Buffer,
  iv: Buffer,
  context: EncryptionContext
): string {
  const key = deriveDataEncryptionKey(context);

  // Extract auth tag from end of ciphertext
  const authTag = encryptedData.subarray(encryptedData.length - AUTH_TAG_LENGTH);
  const ciphertext = encryptedData.subarray(0, encryptedData.length - AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString('utf-8');
}

// =============================================================================
// CLINICAL NOTES ENCRYPTION
// =============================================================================

export interface ClinicalNotesEncrypted {
  presentingIssueEncrypted?: Buffer;
  presentingIssueIV?: Buffer;
  clinicalSummaryEncrypted?: Buffer;
  clinicalSummaryIV?: Buffer;
  assessmentEncrypted?: Buffer;
  assessmentIV?: Buffer;
  interventionsEncrypted?: Buffer;
  interventionsIV?: Buffer;
  patientResponseEncrypted?: Buffer;
  patientResponseIV?: Buffer;
  followUpEncrypted?: Buffer;
  followUpIV?: Buffer;
}

export interface ClinicalNotesPlaintext {
  presentingIssue?: string;
  clinicalSummary?: string;
  assessment?: string; // JSON string
  interventions?: string;
  patientResponse?: string;
  followUp?: string; // JSON string
}

/**
 * Encrypt all text fields of clinical notes
 */
export function encryptClinicalNotes(
  notes: ClinicalNotesPlaintext,
  context: EncryptionContext
): ClinicalNotesEncrypted {
  const result: ClinicalNotesEncrypted = {};

  if (notes.presentingIssue) {
    const encrypted = encryptField(notes.presentingIssue, context);
    result.presentingIssueEncrypted = encrypted.encryptedData;
    result.presentingIssueIV = encrypted.iv;
  }

  if (notes.clinicalSummary) {
    const encrypted = encryptField(notes.clinicalSummary, context);
    result.clinicalSummaryEncrypted = encrypted.encryptedData;
    result.clinicalSummaryIV = encrypted.iv;
  }

  if (notes.assessment) {
    const encrypted = encryptField(notes.assessment, context);
    result.assessmentEncrypted = encrypted.encryptedData;
    result.assessmentIV = encrypted.iv;
  }

  if (notes.interventions) {
    const encrypted = encryptField(notes.interventions, context);
    result.interventionsEncrypted = encrypted.encryptedData;
    result.interventionsIV = encrypted.iv;
  }

  if (notes.patientResponse) {
    const encrypted = encryptField(notes.patientResponse, context);
    result.patientResponseEncrypted = encrypted.encryptedData;
    result.patientResponseIV = encrypted.iv;
  }

  if (notes.followUp) {
    const encrypted = encryptField(notes.followUp, context);
    result.followUpEncrypted = encrypted.encryptedData;
    result.followUpIV = encrypted.iv;
  }

  return result;
}

/**
 * Decrypt all text fields of clinical notes
 */
export function decryptClinicalNotes(
  encrypted: ClinicalNotesEncrypted,
  context: EncryptionContext
): ClinicalNotesPlaintext {
  const result: ClinicalNotesPlaintext = {};

  if (encrypted.presentingIssueEncrypted && encrypted.presentingIssueIV) {
    result.presentingIssue = decryptField(
      encrypted.presentingIssueEncrypted,
      encrypted.presentingIssueIV,
      context
    );
  }

  if (encrypted.clinicalSummaryEncrypted && encrypted.clinicalSummaryIV) {
    result.clinicalSummary = decryptField(
      encrypted.clinicalSummaryEncrypted,
      encrypted.clinicalSummaryIV,
      context
    );
  }

  if (encrypted.assessmentEncrypted && encrypted.assessmentIV) {
    result.assessment = decryptField(
      encrypted.assessmentEncrypted,
      encrypted.assessmentIV,
      context
    );
  }

  if (encrypted.interventionsEncrypted && encrypted.interventionsIV) {
    result.interventions = decryptField(
      encrypted.interventionsEncrypted,
      encrypted.interventionsIV,
      context
    );
  }

  if (encrypted.patientResponseEncrypted && encrypted.patientResponseIV) {
    result.patientResponse = decryptField(
      encrypted.patientResponseEncrypted,
      encrypted.patientResponseIV,
      context
    );
  }

  if (encrypted.followUpEncrypted && encrypted.followUpIV) {
    result.followUp = decryptField(
      encrypted.followUpEncrypted,
      encrypted.followUpIV,
      context
    );
  }

  return result;
}

// =============================================================================
// VERSION SNAPSHOT ENCRYPTION
// =============================================================================

/**
 * Encrypt a complete session record snapshot for versioning
 */
export function encryptSnapshot(
  snapshot: Record<string, unknown>,
  context: EncryptionContext
): EncryptedField {
  const jsonString = JSON.stringify(snapshot);
  return encryptField(jsonString, context);
}

/**
 * Decrypt a session record snapshot
 */
export function decryptSnapshot(
  encryptedData: Buffer,
  iv: Buffer,
  context: EncryptionContext
): Record<string, unknown> {
  const jsonString = decryptField(encryptedData, iv, context);
  return JSON.parse(jsonString);
}

// =============================================================================
// INTEGRITY VERIFICATION
// =============================================================================

/**
 * Create a signature hash for version chain integrity
 */
export function createVersionSignature(
  content: string,
  previousHash?: string
): string {
  const dataToSign = previousHash
    ? `${previousHash}:${content}`
    : content;

  return crypto
    .createHash('sha256')
    .update(dataToSign)
    .digest('hex');
}

/**
 * Verify the integrity of a version chain
 */
export function verifyVersionChain(
  versions: Array<{ content: string; signatureHash: string; previousVersionHash?: string }>
): boolean {
  for (let i = 0; i < versions.length; i++) {
    const version = versions[i];
    const previousHash = i > 0 ? versions[i - 1].signatureHash : undefined;

    const expectedSignature = createVersionSignature(version.content, previousHash);

    if (version.signatureHash !== expectedSignature) {
      return false;
    }

    if (previousHash && version.previousVersionHash !== previousHash) {
      return false;
    }
  }

  return true;
}

// =============================================================================
// FILE HASH FOR EXPORTS
// =============================================================================

/**
 * Create SHA-256 hash of exported content for integrity verification
 */
export function createFileHash(content: string | Buffer): string {
  return crypto
    .createHash('sha256')
    .update(content)
    .digest('hex');
}

/**
 * Verify file hash
 */
export function verifyFileHash(content: string | Buffer, expectedHash: string): boolean {
  const actualHash = createFileHash(content);
  return crypto.timingSafeEqual(
    Buffer.from(actualHash, 'hex'),
    Buffer.from(expectedHash, 'hex')
  );
}

// =============================================================================
// KEY ROTATION SUPPORT
// =============================================================================

/**
 * Re-encrypt data with a new key (for key rotation)
 */
export function reEncrypt(
  encryptedData: Buffer,
  iv: Buffer,
  oldContext: EncryptionContext,
  newContext: EncryptionContext
): EncryptedField {
  // Decrypt with old key
  const plaintext = decryptField(encryptedData, iv, oldContext);

  // Encrypt with new key
  return encryptField(plaintext, newContext);
}

// =============================================================================
// SECURE RANDOM
// =============================================================================

/**
 * Generate a cryptographically secure random string
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate a secure session ID for audit logging
 */
export function generateAuditSessionId(): string {
  return `audit_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;
}
