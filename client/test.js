var fs = require("fs");
const Cryptography = require("./utils/cryptography");
const Messages = require("./utils/messages");

const one_time_id = "45a78b4f3456";
const message =
  "An organization intends to design and implement a system with a trusted server supplying services to client applications, used by their collaborators.";
const private_key = fs.readFileSync(
  "./data/45a78b4f3456/keys/privateKey.pem",
  "utf-8"
);
const public_key = fs.readFileSync(
  "./data/45a78b4f3456/keys/publicKey.pem",
  "utf-8"
);

const crypto = require("crypto");

const salt = crypto.randomBytes(32);

console.log(salt);

(async () => {
  try {
    const res = await Cryptography.generatePBKDF("pass", salt);
    console.log(res);
  } catch (e) {
    console.error(e.message);
  }
})();

return;

// Encrypt
const encryptedMsg = Cryptography.encrypt(public_key, message);

// Sign
const signature = Cryptography.sign(private_key, encryptedMsg);

// Store Msg
Messages.storeMessage(one_time_id, encryptedMsg, signature);

// Get Messages
const msgs = Messages.getMessages(one_time_id);

// Decrypt Messages and check signature
msgs.forEach((msg) => {
  console.log("\n\n######################");
  console.log("Encrypted Message:", msg.msg);
  console.log("Signature:", msg.signature);

  console.log();

  const decryptedMsg = Cryptography.decrypt(private_key, msg.msg);
  const signatureCheck = Cryptography.checkSign(
    public_key,
    msg.msg,
    msg.signature
  );
  console.log("Decrypted Message: ", decryptedMsg);
  console.log("Signature Check: ", signatureCheck);
});
