const axios = require("axios");
const inquirer = require("inquirer");

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
    .post('/users/register', { username, one_time_id })
    .then((answer) => {
      return answer.data.token;
    })
    .catch(() => {
      console.log("Register Request Failed");
      return null;
    });
};

const askUsername = async (message) => {
  const username_question = [
    {
      type: "input",
      name: "username",
      message,
      validate: (value) => {
        if (value.length <= 8) {
          return true;
        }

        return "Please enter a valid username";
      },
    },
  ];

  return await inquirer
    .prompt(username_question)
    .then((answerUsername) => {
      return answerUsername.username;
    })
    .catch((error) => {
      console.log("Failed to retrieve username from user");
      console.log(error);
      return;
    });
};

module.exports = {
  askUserPassword,
  requestRegister,
  askUsername,
};
