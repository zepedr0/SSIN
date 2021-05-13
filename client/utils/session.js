const Cryptography = require("./cryptography");
const Files = require("./files");

const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

// Store new session
const saveSession = (username, one_time_id, decToken, password) => {
  // Create user directory
  Files.createFolder(one_time_id);

  const salt = crypto.randomBytes(32);

  // Store Salt
  Files.createFile(one_time_id, "Salt", salt.toString("hex"));

  // Generate Key
  const key = Cryptography.generatePBKDF(password, salt);

  // Encrypt private info with key
  const encUserPrivateInfo = Cryptography.localEncrypt(
    JSON.stringify({ sessionToken: decToken }),
    key
  );

  const sessionInfo = {
    one_time_id,
    username,
    user_private_info: encUserPrivateInfo,
  };

  // Writes encrypted session info to a file
  Files.createFile(
    one_time_id,
    "SessionInfo.json",
    JSON.stringify(sessionInfo)
  );

  // Search for correspondences already stored
  const dir = path.join(__dirname, "..", "data");
  let matches = {};
  if (fs.existsSync(`${dir}/Map.json`)) {
    matches = fs.readFileSync(`${dir}/Map.json`);
  }

  // Appends the new one
  matches[username] = one_time_id;

  // Writes username: onde_time_id to json file
  fs.writeFileSync(`${dir}/Map.json`, JSON.stringify(matches));

  // Genereate pub and priv keys for communication
  const [privateKey, publicKey] = Cryptography.generatePubPrivKeys(password);

  // Store keys
  Files.createFile(one_time_id, "private.pem", privateKey);
  Files.createFile(one_time_id, "public.pem", publicKey);

  // Initialize msgs file
  Files.createFile(one_time_id, "msgs.json", JSON.stringify([]));

  console.log("Session Info Stored \n");
};

const login = (password) => {
  // Reads encypted session token from file
  const sessionFileData = fs.readFileSync("./data/Session.json", {
    encoding: "utf8",
  });

  let sessionFileDataJSON = JSON.parse(sessionFileData);
  const { one_time_id, salt } = sessionFileDataJSON;

  const key = Cryptography.generatePBKDF(password, Buffer.from(salt, "hex"));

  let userInfo;
  try {
    userInfo = Cryptography.localDecrypt(
      sessionFileDataJSON.user_private_info,
      key
    );
  } catch (err) {
    // console.log(err);
    if (err.code === "ERR_OSSL_EVP_BAD_DECRYPT") {
      console.log("Wrong Password");
      return { success: false, reason: "Wrong Password" };
    } else {
      return { success: false, reason: "Unknown" };
    }
  }

  sessionFileDataJSON.user_private_info = JSON.parse(userInfo);
  return { success: true, sessionInfo: sessionFileDataJSON };
};

const logout = () => {};

module.exports = {
  saveSession,
  login,
  logout,
};
