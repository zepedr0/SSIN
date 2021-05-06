const inquirer = require("inquirer");
const axios = require("axios");

const session = require("./utils/session");

const api = "http://localhost:3000/api/";

const requestRegister = (username, one_time_id) => {
  // Register
  return axios
    .post(`${api}users/register`, { username, one_time_id })
    .then((answer) => {
      return answer.data.token;
    })
    .catch((error) => {
      console.log("Register Request Failed");
      console.log(error);
      return null;
    });
};

const register = () => {
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
      validate: (value) => {
        if (value.length === 12) {
          return true;
        }

        return "Invalid id";
      },
    },
  ];

  inquirer.prompt(register_questions).then(async (answers) => {
    const { username, one_time_id } = answers;
    const registerResult = await requestRegister(username, one_time_id);

    // If register was successful, registerResult has the Session token
    if (!registerResult) {
      return;
    }

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
        session.saveSession(username, one_time_id, registerResult, password);
      })
      .catch((error) => {
        console.log("Register Failed");
        console.log(error);
      });
  });
};

const localLogin = () => {
  const password_question = [
    {
      type: "password",
      name: "password",
      message: "Session found enter the password to login",
      mask: "*",
    },
  ];

  return inquirer
    .prompt(password_question)
    .then((answerPassword) => {
      const { password } = answerPassword;

      let nFailedLogins = 0;
      let loginAnswer;
      do {
        // Retrieves session info from Session file
        loginAnswer = session.login(password);
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

      console.log("Session Info:");
      console.log(loginAnswer.sessionInfo);
    })
    .catch((error) => {
      console.log("Failed to retrieve password for local login");
      console.log(error);
      return;
    });
};

function mainLoop() {
  // register();
  if (session.exists()) {
    localLogin();
  }
}

module.exports = mainLoop;
