const inquirer = require("inquirer");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const cryptography = require("./utils/cryptography");

const api = "http://localhost:3000/api/";

async function mainLoop() {
  console.log("[WIP] Register user");

  // User input for username and id to register
  const register_questions = [
    {
      type: "input",
      name: "username",
      message: "What's your username",
      validate: (value) => {
        if (value.length <= 8) {
          return true;
        }

        return "Invalid username";
      },
    },
    {
      type: "input",
      name: "one_time_id",
      message: "Enter your one-time id",
      mask: "*",
      validate: (value) => {
        if (value.length === 12) {
          return true;
        }

        return "Invalid id";
      },
    },
  ];

  inquirer.prompt(register_questions).then((answers) => {
    const { username, one_time_id } = answers;

    // Register
    axios
      .post(`${api}users/register`, { username, one_time_id })
      .then((answer) => {
        const password_question = [
          {
            type: "password",
            name: "password",
            message:
              "Enter a password for you account. Please note that this is irreplaceable",
            mask: "*",
          },
        ];

        inquirer
          .prompt(password_question)
          .then(async (answerPassword) => {
            const { password } = answerPassword;

            const dir = path.join(__dirname, "data", one_time_id);

            // If user does not have a directory yet
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir);
            }

            const {
              publicKey,
              privateKey,
            } = cryptography.generatePubPrivKeys();

            // console.log(publicKey);
            // console.log(privateKey);
            console.log(answer.data);

            const encSessionToken = cryptography.encrypt(
              publicKey,
              answer.data.token
            );
            console.log("\n>>> Encrypted Token: \n\n" + encSessionToken);

            // Writes encrypted session token to a file
            fs.writeFileSync("./data/Session", encSessionToken, (err) => {
              // Error writing to file
              if (err) return console.log(err);
              console.log("Session data stored");
            });

            // Reads encypted session token from file
            const sessionFileData = fs.readFileSync("./data/Session", "hex");

            const decToken = cryptography.decrypt(privateKey, password, sessionFileData);
            console.log(decToken);

            // // Store publicKey
            // fs.writeFileSync(path + "publicKey.pem", keys.publicKey, (err) => {
            //   // Error writing to file
            //   if (err) return console.log(err);
            //   console.log("publicKey data stored");
            // });

            // // Salt
            // const salt = crypto.randomBytes(32);
            // fs.writeFileSync(path + "salt", salt, (err) => {
            //   // Error writing to file
            //   if (err) return console.log(err);
            //   console.log("Salt data stored");
            // });

            // const encKey = await cryptography.generatePBKDF(password, salt);

            // // IV
            // const iv = crypto.randomBytes(16);
            // const cipher = crypto.createCipheriv("aes-256", encKey, iv);

            // let ciphered = cipher.update(keys.privateKey, "utf8", "hex");
            // ciphered += cipher.final("hex");
            // const ciphertext = iv.toString("hex") + ":" + ciphered;

            // // Store privateKey
            // fs.writeFileSync(path + "privateKey", ciphertext, (err) => {
            //   // Error writing to file
            //   if (err) return console.log(err);
            //   console.log("privateKey data stored");
            // });
          })
          .catch((error) => {
            console.log("ERRORRRR 2");
            console.log(error);
          });
      })
      .catch((error) => {
        console.log("ERRORRRR");
        console.log(error);
      });
  });
}

module.exports = mainLoop;
