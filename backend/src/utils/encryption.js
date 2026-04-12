const crypto = require("crypto");

const algorithm = "aes-256-cbc";
const SECRET = process.env.AES_SECRET;

exports.encrypt = (text) => {
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(
    algorithm,
    Buffer.from(SECRET),
    iv
  );

  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

exports.decrypt = (text) => {
  if (!text || typeof text !== 'string') {
    return text || '';
  }

  // Legacy plain-text OAuth tokens stored before encryption was added.
  // Detect them by known prefixes and return as-is (no warning needed).
  const PLAIN_TOKEN_PREFIXES = ['gho_', 'ghs_', 'ghu_', 'ghp_', 'github_pat_', 'ya29.'];
  if (PLAIN_TOKEN_PREFIXES.some(prefix => text.startsWith(prefix))) {
    return text;
  }

  // Encrypted format is always "ivHex:ciphertextHex"
  if (!text.includes(':')) {
    // Not encrypted and not a known token format – return as-is
    return text;
  }

  const [ivHex, encryptedHex] = text.split(":");
  if (!ivHex || !encryptedHex) {
    return text;
  }

  try {
    const iv = Buffer.from(ivHex, "hex");
    const encryptedText = Buffer.from(encryptedHex, "hex");

    const decipher = crypto.createDecipheriv(
      algorithm,
      Buffer.from(SECRET),
      iv
    );

    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  } catch (err) {
    console.warn('[decrypt] Decryption failed, returning raw value:', err.message);
    return text;
  }
};