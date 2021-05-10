const fs = require("fs");
const path = require("path");
const cryptography = require("./cryptography");

// Store new session
const saveSession = (username, one_time_id, decToken, password) => {
  cryptography.generatePubPrivKeys(one_time_id, password);

  const encUserPrivateInfo = cryptography.encrypt(
    JSON.stringify({ username, sessionToken: decToken }),
    one_time_id
  );

  const sessionInfo = {
    one_time_id,
    user_private_info: encUserPrivateInfo,
  };

  // Writes encrypted session info to a file
  fs.writeFileSync("./data/Session.json", JSON.stringify(sessionInfo));

  console.log("Session Info Stored \n");
};

const login = (password) => {
  // Reads encypted session token from file
  const sessionFileData = fs.readFileSync("./data/Session.json", {
    encoding: "utf8",
  });

  let sessionFileDataJSON = JSON.parse(sessionFileData);
  const { one_time_id } = sessionFileDataJSON;

  let userInfo;
  try {
    userInfo = cryptography.decrypt(
      password,
      sessionFileDataJSON.user_private_info,
      one_time_id
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

const exists = () => {
  const filePath = path.join(__dirname, "..", "data", "Session.json");
  return fs.existsSync(filePath);
};

const logout = () => {};

module.exports = {
  saveSession,
  login,
  logout,
  exists,
};
