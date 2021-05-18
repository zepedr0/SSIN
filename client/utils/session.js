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
const saveSession = async (username, one_time_id, decToken, password) => {
  const salt = crypto.randomBytes(32);
  const key = Cryptography.generatePBKDF(password, salt);

  const encUserPrivateInfo = Cryptography.localEncrypt(
    JSON.stringify({ username, sessionToken: decToken }),
    key
  );

  const sessionInfo = {
    one_time_id,
    salt: salt.toString("hex"),
    user_private_info: encUserPrivateInfo,
  };

  // Writes encrypted session info to a file
  fs.writeFileSync("./data/Session.json", JSON.stringify(sessionInfo));

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
