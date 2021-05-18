const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

// Encrypt message
const encrypt = (toEncrypt, username) => {
  const dir = path.join(__dirname, "..", "data", username);
  const publicKey = fs.readFileSync(`${dir}/public.pem`, "utf8");
  const buffer = Buffer.from(toEncrypt, "utf8");
  const encrypted = crypto.publicEncrypt(publicKey.toString(), buffer);
  return encrypted.toString("base64");
};

// Decrypt message
const decrypt = (passphrase, toDecrypt, username) => {
  const dir = path.join(__dirname, "..", "data", username);
  const privateKey = fs.readFileSync(`${dir}/private.pem`, "utf8");
  const buffer = Buffer.from(toDecrypt, "base64");
  const decrypted = crypto.privateDecrypt(
    {
      key: privateKey.toString(),
      passphrase,
    },
    buffer
  );
  return decrypted.toString("utf8");
};

// Generate signature
const sign = (privateKey, msg) => {
  const signer = crypto.createSign("RSA-SHA256");
  signer.write(Buffer.from(msg, 'hex'));
  signer.end();

  const signature = signer.sign(privateKey, "hex");
  return signature;
};

// Verify signature
const checkSign = (publicKey, msg, signature) => {
  const verifier = crypto.createVerify("RSA-SHA256");
  verifier.update(Buffer.from(msg, 'hex'));
  const ver = verifier.verify(publicKey, signature, "hex");
  return ver;
};

// Generate PBKDF key
const generatePBKDF = (password, salt, cost = 100000, digest = "sha512") => {
  const derivedKey = crypto.pbkdf2Sync(password, salt, cost, 32, digest);
  return derivedKey;
};

const generatePubPrivKeys = (passphrase) => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
      cipher: "aes-256-cbc",
      passphrase,
    },
  });

  return [privateKey, publicKey];
};

const localEncrypt = (toEncrypt, key) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(key, "hex"),
    iv
  );
  let encrypted = cipher.update(toEncrypt);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
};

const localDecrypt = (toDecrypt, key) => {
  const [iv, encryptedText] = toDecrypt
    .split(":")
    .map((part) => Buffer.from(part, "hex"));
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(key, "hex"),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  try {
    decrypted = Buffer.concat([decrypted, decipher.final()]);
  } catch {
    decrypted = "## INVALID DECRYPT ##";
  }
  return decrypted.toString();
};

const getUserSalt = (username) => {
  const dir = path.join(__dirname, "..", "data", username);
  const salt = fs.readFileSync(`${dir}/salt`, "utf8");
  return salt;
}

const privKeyEncPemtoPem = (privKeyEncPem, passphrase) => {
  return crypto.createPrivateKey({
    key: privKeyEncPem,
    format: 'pem',
    passphrase: Buffer.from(passphrase)
  }).export({ format: 'pem', type: 'pkcs8' })
}

module.exports = {
  encrypt,
  decrypt,
  sign,
  checkSign,
  generatePubPrivKeys,
  generatePBKDF,
  localEncrypt,
  localDecrypt,
  getUserSalt,
  privKeyEncPemtoPem
};
