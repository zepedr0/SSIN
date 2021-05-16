const inquirer = require("inquirer");

const Authentication = require("./utils/authentication");
const Services = require("./utils/services");
const Session = require("./utils/session");
const Files = require("./utils/files");

const registerMenu = async () => {
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

    if (Session.inThisClient(one_time_id)) {
      console.log("You cannot register again. Please login instead");
      return;
    }

    const registerResult = await Authentication.requestRegister(
      username,
      one_time_id
    );

    // If register was successful, registerResult has the Session token
    if (!registerResult) {
      return;
    }

    const password = await Authentication.askUserPassword(
      "Enter a password for you account. Please note that this is irreplaceable"
    );

    // Starts Session
    Session.saveSession(username, one_time_id, registerResult, password);
  });
};

const loginMenu = async () => {
  console.log("Local login");

  let nFailedLogins = 0;
  let loginAnswer;
  do {
    const username = await Authentication.askUsername(
      "[Login] Please enter your username"
    );

    if (!username) {
      return;
    }

    const password = await Authentication.askUserPassword(
      "[Login] Please enter your password"
    );

    if (!password) {
      return;
    }

    // Retrieves session info from Session file
    loginAnswer = Session.login(username, password);
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

  return loginAnswer.sessionInfo;
};

const consoleMenu = async (sessionInfo) => {
  await inquirer
    .prompt([
      {
        type: "list",
        name: "option",
        message: "What do you want to do?\n",
        choices: [
          "1) Calculate a root",
          "2) See messages",
          "3) End this client's session on your account",
          "4) Quit",
        ],
      },
    ])
    .then(async (answer) => {
      const answerNumber = answer.option.split(" ")[0];
      switch (answerNumber) {
        case "1)": {
          const token = sessionInfo.user_private_info.sessionToken;
          await Services.rootCalc(token);

          break;
        }
        case "3)": {
          const token = sessionInfo.user_private_info.sessionToken;

          const res = await Session.requestEnd(token);
          console.log(`Logout:${res}`);

          // Server ended this client's session on that account
          if (res) {
            Files.deleteFile(sessionInfo.one_time_id, "SessionInfo.json");
          }

          break;
        }
        default: {
          process.exit();
        }
      }
    });
};

const mainLoop = async () => {
  await inquirer
    .prompt([
      {
        type: "list",
        name: "option",
        message: "What do you want to do?\n",
        choices: ["1) Register", "2) Login", "3) Quit"],
      },
    ])
    .then(async (answer) => {
      if (answer.option == "1) Register") {
        await registerMenu();
        const sessionInfo = await loginMenu();
        await consoleMenu(sessionInfo);
      } else if (answer.option == "2) Login") {
        const sessionInfo = await loginMenu();
        await consoleMenu(sessionInfo);
      } else process.exit();
    });
};

module.exports = mainLoop;
