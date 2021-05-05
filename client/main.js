const inquirer = require("inquirer");
const axios = require("axios");
const fs = require("fs");
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
            const text = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;
            //const text = "small text";
            const { password } = answerPassword;

            cryptography.generatePubPrivKeys(one_time_id);

            const encSessionToken = cryptography.encrypt(text, one_time_id);
            console.log("\n>>> Encrypted Token: \n\n" + encSessionToken + "\n");

            // Writes encrypted session token to a file
            try {
              fs.writeFileSync("./data/Session", encSessionToken);
            } catch (err) {
              console.log("Error writing Session file");
              console.log(err);
            }

            console.log("Session Token Stored");

            // Reads encypted session token from file
            let sessionFileData;
            try {
              sessionFileData = fs.readFileSync("./data/Session", {
                encoding: "utf8",
              });
            } catch (err) {
              console.log("Error reading Session file");
              console.log(err);
            }

            console.log("Session info successfully read");

            const decToken = cryptography.decrypt(
              password,
              sessionFileData,
              one_time_id
            );

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
