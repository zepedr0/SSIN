const Cryptography = require("./cryptography");
const Files = require("./files");

const fs = require("fs");
const crypto = require("crypto");
const { pki } = require('node-forge')
const axios = require('axios')

// Request certificate from server
const postCertificateRequest = async (token, csrPem) => {
  return axios
        .post(`${process.env.API_URL}/users/certificate-requests`, {
            csr: csrPem
        },
        {
            headers: {
                token: `${token}`,
            }
        })
        .then((response) => {
            return response.data.cert
        })
        .catch((error) => {
            console.log(error)
            return null
        })
}

const createCSR = (username, publicKeyPem, privateKeyPem) => {
  const csr = pki.createCertificationRequest()
  csr.publicKey = pki.publicKeyFromPem(publicKeyPem)
  csr.setSubject([
    {
      name: 'commonName',
      value: username
    }
  ])
  csr.sign(pki.privateKeyFromPem(privateKeyPem))
  return pki.certificationRequestToPem(csr)
}

// Store new session
const saveSession = async (username, decToken, password) => {
  // Create user directory
  const usernameFolder = [username]
  if (!Files.existsDir(usernameFolder)) {
    Files.createFolder(usernameFolder);
  }
  
  const salt = crypto.randomBytes(32);

  // Store Salt
  Files.createFile(usernameFolder, "Salt", salt.toString("hex"));

  // Generate Key
  const key = Cryptography.generatePBKDF(password, salt);

  // Encrypt private info with key
  const encUserPrivateInfo = Cryptography.localEncrypt(
    JSON.stringify({ sessionToken: decToken }),
    key
  );

  const sessionInfo = {
    username,
    user_private_info: encUserPrivateInfo,
  };

  // Writes encrypted session info to a file
  Files.createFile(usernameFolder, "SessionInfo.json", JSON.stringify(sessionInfo));

  // Create user directory
  const keysFolder = [username, 'keys']
  Files.createFolder(keysFolder);
  // Genereate pub and priv keys for communication
  const [privateKeyEncPem, publicKeyPem] = Cryptography.generatePubPrivKeys(password);
  const privateKeyPem = crypto.createPrivateKey({
    key: privateKeyEncPem,
    format: 'pem',
    // TODO: passphrase está hardcoded
    passphrase: 'amogus'
  }).export({ format: 'pem', type: 'pkcs8' })

  const csrPem = createCSR(username, publicKeyPem, privateKeyPem)
  const certPem = await postCertificateRequest(decToken, csrPem)
  
  // Store keys
  // TODO: guardar private key encriptada em vez de plaintext
  Files.createFile(keysFolder, 'key.pem', privateKeyPem);
  Files.createFile(keysFolder, 'cert.pem', certPem)

  console.log("Session Info Stored \n");
};

const login = (username, password) => {
  if (!Files.existsDir([username])) {
    return { success: false, reason: "Invalid username" };
  }

  if (!inThisClient(username)) {
    return {
      success: false,
      reason: "User doesn't have a session in this client",
    };
  }

  // Reads session info from file (plain text + encrypted data)
  const sessionFileData = fs.readFileSync(
    `./data/${username}/SessionInfo.json`,
    {
      encoding: "utf8",
    }
  );
  // Parse to JSON
  let sessionFileDataJSON = JSON.parse(sessionFileData);

  // Reads salt from file
  const salt = fs.readFileSync(`./data/${username}/Salt`, {
    encoding: "utf8",
  });

  // Generates key with entered password and salt
  const key = Cryptography.generatePBKDF(password, Buffer.from(salt, "hex"));

  // Decrypt session token
  const userInfo = Cryptography.localDecrypt(
    sessionFileDataJSON.user_private_info,
    key
  );

  if (userInfo === "## INVALID DECRYPT ##") {
    console.log("Wrong Password");
    return { success: false, reason: "Wrong Password" };
  }

  // Return the session object, but the encrypted section is now decrypted
  sessionFileDataJSON.user_private_info = JSON.parse(userInfo);
  return { success: true, sessionInfo: sessionFileDataJSON };
};

const inThisClient = (username) => {
  return Files.existsFile([username], "SessionInfo.json");
};

const requestEnd = (token) => {
  // Logout
  return axios
    .post(`${process.env.API_URL}/users/logout`, null, {
      headers: { token },
    })
    .then((answer) => {
      return answer.data.success;
    })
    .catch((error) => {
      console.log("Logout Request Failed");
      console.log(error);
      return false;
    });
};

module.exports = {
  saveSession,
  login,
  inThisClient,
  requestEnd,
};
