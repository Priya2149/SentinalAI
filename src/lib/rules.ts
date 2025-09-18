export const TOXIC_WORDS = [
  "kill","hate","stupid","idiot","racist","sexist","slur"
];

export const PII_REGEX = [
  /\b\d{3}-\d{2}-\d{4}\b/i,                // US SSN
  /\b\d{16}\b/,                             // 16-digit card (very naive)
  /\b(?:\+?\d{1,3})?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/, // phone
  /\b[0-9]{5}(?:-[0-9]{4})?\b/,            // US ZIP
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, // email
];

export const SECRET_REGEX = [
  /api[_-]?key\s*[:=]\s*[\w-]{16,}/i,
  /(sk|rk|pk|token)_[A-Za-z0-9]{16,}/,     // generic tokens
  /-----BEGIN (?:RSA|EC) PRIVATE KEY-----/,
];

export const INJECTION_PATTERNS = [
  /ignore (?:all|previous) instructions/i,
  /disregard (?:the )?system/i,
  /reveal (?:the )?system prompt/i,
  /exfiltrate|leak|upload|bypass|disable guardrails/i,
  /base64|hex dump|curl http/i,
];
