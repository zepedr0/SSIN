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

module.exports = {
  askUserPassword,
  requestRegister,
};
