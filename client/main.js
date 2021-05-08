const inquirer = require("inquirer");
const axios = require("axios");

const session = require("./utils/session");

const api = "http://localhost:3000/api/";

const askUserPassword = async (message) => {
  const password_question = [
    {
      type: "password",
      name: "password",
      message,
      mask: "*",
      validate: (value) => {
        if (value.length > 2) {
          return true;
        }

        return "Invalid password. It must have 3 or more characters";
      },
    },
  ];

  return await inquirer
    .prompt(password_question)
    .then((answerPassword) => {
      return answerPassword.password;
    })
    .catch((error) => {
      console.log("Failed to retrieve password from user");
      console.log(error);
      return;
    });
};

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

const register = async () => {
  console.log("Register user");

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

  await inquirer.prompt(register_questions).then(async (answers) => {
    const { username, one_time_id } = answers;
    const registerResult = await requestRegister(username, one_time_id);

    // If register was successful, registerResult has the Session token
    if (!registerResult) {
      return;
    }

    const password = await askUserPassword(
      "Enter a password for you account. Please note that this is irreplaceable"
    );

    // Starts Session
    session.saveSession(username, one_time_id, registerResult, password);
  });
};

const localLogin = async () => {
  console.log("Local login");

  let nFailedLogins = 0;
  let loginAnswer;
  do {
    const password = await askUserPassword(
      "Session found enter the password to login"
    );
    if (!password) {
      return;
    }

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
    console.log("Password wrong 3 times. Client closing");
    return;
  }

  console.log("Session Info:");
  console.log(loginAnswer.sessionInfo);
};

async function mainLoop() {
  await register();
  await localLogin();
}

module.exports = mainLoop;
