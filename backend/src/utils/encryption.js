// const crypto = require("crypto");

// const algorithm = "aes-256-cbc";
// const SECRET = process.env.AES_SECRET;

// exports.encrypt = (text) => {
//   const iv = crypto.randomBytes(16);

//   const cipher = crypto.createCipheriv(
//     algorithm,
//     Buffer.from(SECRET),
//     iv
//   );

//   let encrypted = cipher.update(text, "utf8");
//   encrypted = Buffer.concat([encrypted, cipher.final()]);

//   return iv.toString("hex") + ":" + encrypted.toString("hex");
// };

// exports.decrypt = (text) => {
//   const parts = text.split(":");

//   const iv = Buffer.from(parts[0], "hex");
//   const encryptedText = Buffer.from(parts[1], "hex");

//   const decipher = crypto.createDecipheriv(
//     algorithm,
//     Buffer.from(SECRET),
//     iv
//   );

//   let decrypted = decipher.update(encryptedText);
//   decrypted = Buffer.concat([decrypted, decipher.final()]);

//   return decrypted.toString();
// };







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
  if (!text || typeof text !== 'string' || !text.includes(':')) {
    console.warn('[decrypt] Invalid encrypted text provided:', text);
    return text || '';
  }

  const [ivHex, encryptedHex] = text.split(":");
  if (!ivHex || !encryptedHex) {
    return text || '';
  }

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
};