const inquirer = require("inquirer");
const axios = require("axios");

const cryptography = require("./utils/cryptography");
const session = require("./utils/session");

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
          .then((answerPassword) => {
            const { password } = answerPassword;

            // Starts Session
            session.saveSession(username, one_time_id, answer.data.token);

            let nFailedLogins = 0;
            let loginAnswer;
            do {
              // Retrieves session info from Session file
              loginAnswer = session.login(password, one_time_id);

              if (loginAnswer.success === false) {
                if (loginAnswer.reason === "Wrong Password") {
                  nFailedLogins++;
                  continue;
                }

                // Any other error decrypting
                return;
              }
            } while (!loginAnswer.success && nFailedLogins < 3);

            if (nFailedLogins === 3) {
              return;
            }

            console.log(JSON.parse(loginAnswer.sessionInfo));
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
