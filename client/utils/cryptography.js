const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

// Encrypt message
const encrypt = (toEncrypt, one_time_id) => {
  const dir = path.join(__dirname, "..", "data", one_time_id);
  const publicKey = fs.readFileSync(`${dir}/public.pem`, "utf8");
  const buffer = Buffer.from(toEncrypt, "utf8");
  const encrypted = crypto.publicEncrypt(publicKey.toString(), buffer);
  return encrypted.toString("base64");
};

// Decrypt message
const decrypt = (passphrase, toDecrypt, one_time_id) => {
  const dir = path.join(__dirname, "..", "data", one_time_id);
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
  signer.write(Buffer.from(msg));
  signer.end();

  const signature = signer.sign(privateKey, "base64");
  return signature;
};

// Verify signature
const checkSign = (publicKey, msg, signature) => {
  const verifier = crypto.createVerify("RSA-SHA256");
  verifier.update(Buffer.from(msg));
  const ver = verifier.verify(publicKey, signature, "base64");
  return ver;
};

// Generate PBKDF key
const generatePBKDF = (password, salt, cost = 100000, digest = "sha512") => {
  const derivedKey = crypto.pbkdf2Sync(password, salt, cost, 32, digest);
  return derivedKey;
};

const generatePubPrivKeys = (one_time_id, passphrase) => {
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

  const dir = path.join(__dirname, "..", "data", one_time_id);

  // If user does not have a directory yet
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  fs.writeFileSync(`${dir}/private.pem`, privateKey);
  fs.writeFileSync(`${dir}/public.pem`, publicKey);
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
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

module.exports = {
  encrypt,
  decrypt,
  sign,
  checkSign,
  generatePubPrivKeys,
  generatePBKDF,
  localEncrypt,
  localDecrypt,
};
