const inquirer = require("inquirer");
const fs = require('fs')
const path = require('path')

const Authentication = require("./utils/authentication");
const Cryptography = require("./utils/cryptography");
const Messages = require("./utils/messages");
const Services = require("./utils/services");
const Session = require("./utils/session");
const MessagesServer = require('./utils/messagesServer')
const Chat = require('./utils/chat');
const CommunicationInfo = require("./utils/communication_info");
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

  return await inquirer.prompt(register_questions).then(async (answers) => {
    const { username, one_time_id } = answers;

    if (Session.inThisClient(username)) {
      console.log("You cannot register again. Please login instead");
      return { success: false };
    }

    const registerResult = await Authentication.requestRegister(
      username,
      one_time_id
    );

    // If register was successful, registerResult has the Session token
    if (!registerResult) {
      return { success: false };
    }

    const password = await Authentication.askUserPassword(
      "Enter a password for you account. Please note that this is irreplaceable"
    );

    // Starts Session
    await Session.saveSession(username, registerResult, password);

    return { success: true };
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
    if (loginAnswer && !loginAnswer.success) {
      console.log(`Login failed. Reason: ${loginAnswer.reason}`);
    }
    
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

const chatMenu = async (username, token) => {
  const usersInfo = await CommunicationInfo.getUsersCommunicationInfo(token)
  const inquirerChoices = usersInfo.map((user, index) => {
    let last_seen = 'Never'
    if (user.last_seen !== undefined) {
      options = {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
      
      last_seen = Intl.DateTimeFormat('pt-PT', options).format(new Date(user.last_seen))
    }
    return { name: `${index+1}) ${user.full_name} (Last Seen: ${last_seen})`, value: index }
  })
  inquirerChoices.push({ name: `${usersInfo.length+1}) Back`, value: usersInfo.length })
  
  await inquirer
    .prompt([
      {
        type: "list",
        name: "option",
        message: "Who do you want to message?\n",
        choices: inquirerChoices,
      },
    ])
    .then(async (answer) => {
      if (answer.option >= 0 && answer.option < usersInfo.length) {
        await Chat.chat(username, usersInfo[answer.option].port)
        await chatMenu(username, token)
      }
    });
}

const seeMessagesMenu = async (sessionInfo) => {
  const usernames = fs.readdirSync(path.join(__dirname, 'data', sessionInfo.username, 'messages')).map(filename => path.basename(filename, '.json'))
  const inquirerChoices = usernames.map((username, index) => {
    return { name: `${index+1}) ${username}`, value: index }
  })
  inquirerChoices.push({ name: `${usernames.length+1}) Back`, value: usernames.length })

  await inquirer
    .prompt([
      {
        type: "list",
        name: "option",
        message: "Select username?\n",
        choices: inquirerChoices,
      },
    ])
    .then(async (answer) => {
      if (answer.option >= 0 && answer.option < usernames.length) {
        Messages.seeMessages(sessionInfo, usernames[answer.option])
        await seeMessagesMenu(sessionInfo)
      }
    });
}

const consoleMenu = async (sessionInfo) => {
  await inquirer
    .prompt([
      {
        type: "list",
        name: "option",
        message: "What do you want to do?\n",
        choices: [
          "1) Calculate a root",
          "2) Store message",
          "3) See messages",
          "4) Send Message",
          "8) Quit",
          "9) End this client's session on your account",
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
        case "2)": {
          const sender_id = "111";
          const msg = "111 msg";
          const sig = "111 sig";
          const pass = await Authentication.askUserPassword(
            "Type your password to encrypt your message"
          );
          const salt = Cryptography.getUserSalt(sessionInfo.username);
          const k = Cryptography.generatePBKDF(pass, salt);
          const encMsg = Cryptography.localEncrypt(msg, k);
          const encSig = Cryptography.localEncrypt(sig, k);
          Messages.storeMessage(
            sessionInfo.username,
            sender_id,
            encMsg,
            encSig
          );

          break;
        }
        case "3)": {
          await seeMessagesMenu(sessionInfo)

          break;
        }
        case "4)": {
            const username = sessionInfo.username
            const token = sessionInfo.user_private_info.sessionToken
            await chatMenu(username, token)

            break
        }
        case "9)": {
          const token = sessionInfo.user_private_info.sessionToken;

          const res = await Session.requestEnd(token);
          console.log(`Logout:${res}`);

          // Server ended this client's session on that account
          if (res) {
            Files.deleteFile([sessionInfo.username], "SessionInfo.json");
          }

          break;
        }
        default: {
          process.exit();
        }
      }
    });

    await consoleMenu(sessionInfo)
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
        const register_result = await registerMenu();

        if (!register_result.success) {
          process.exit();
        }

        const sessionInfo = await loginMenu();

        if (!sessionInfo) {
          process.exit();
        }

        await consoleMenu(sessionInfo);
      } else if (answer.option == "2) Login") {
        const sessionInfo = await loginMenu();

        if (!sessionInfo) {
          process.exit();
        }

        // TODO: quando o user der logout fechar o server, createMessageServer retorna a instancia do server, fazer server.close()
        MessagesServer.createMessageServer(sessionInfo)
          .then(server => {
            CommunicationInfo.postPort(server.address().port, sessionInfo.user_private_info.sessionToken)
          })

        await consoleMenu(sessionInfo);
      } else process.exit();
    });
};

module.exports = mainLoop;
