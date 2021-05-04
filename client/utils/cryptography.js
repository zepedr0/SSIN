const crypto = require("crypto");
const { promisify } = require('util');

// Encrypt message
const encrypt = (publicKey, msg) => {
  const encryptedData = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(msg)
  );

  return encryptedData;
};

// Decrypt message
const decrypt = (privateKey, msg) => {
  const decryptedData = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(msg)
  );

  return decryptedData.toString();
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
const generatePBKDF = async (password, salt, cost = 100000, digest = 'sha512') => {

  const derivedKey = await promisify(crypto.pbkdf2)(password, salt, cost, 128, digest);

  return derivedKey;
}

module.exports = {
  encrypt,
  decrypt,
  sign,
  checkSign,
  generatePBKDF,
};
