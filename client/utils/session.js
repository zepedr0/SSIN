const fs = require("fs");
const cryptography = require("./cryptography");

// Store new session
const saveSession = (username, one_time_id, decToken, password) => {
  cryptography.generatePubPrivKeys(one_time_id, password);
  const sessionInfo = { username, one_time_id, sessionToken: decToken };

  const encSessionInfo = cryptography.encrypt(
    JSON.stringify(sessionInfo),
    one_time_id
  );

  // Writes encrypted session info to a file
  fs.writeFileSync("./data/Session", encSessionInfo);

  console.log("Session Info Stored \n");
};

const login = (password, one_time_id) => {
  // Reads encypted session token from file
  let sessionFileData;

  sessionFileData = fs.readFileSync("./data/Session", {
    encoding: "utf8",
  });

  let decSessionInfo;
  try {
    decSessionInfo = cryptography.decrypt(
      password,
      sessionFileData,
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

  return { success: true, sessionInfo: decSessionInfo };
};

const logout = () => {};

module.exports = {
  saveSession,
  login,
  logout,
};
