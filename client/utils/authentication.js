const axios = require("axios");
const inquirer = require("inquirer");

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

const requestLogout = (token) => {
  // Logout
  return axios
    .post(`${api}users/logout`, null, {
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
  askUserPassword,
  requestRegister,
  askUsername,
  requestLogout,
};
