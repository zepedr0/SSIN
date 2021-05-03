const inquirer = require("inquirer");
const axios = require("axios");
const fs = require("fs");

const api = "http://localhost:3000/api/";

function paramRoot(value, token) {
  const root_question = [
    {
      type: "number",
      name: "root",
      message: "Enter the root:\n",
      validate: (value) => {
        if (isNaN(value)) {
          return "please enter a number";
        }
        return true;
      },
    },
  ];
  inquirer.prompt(root_question).then((answer) => {
    axios
      .get(`${api}services/3/${value}/${answer.root}`, {
        headers: {
          token: `${token}`,
        },
      })
      .then((answer) => {
        console.log("Result: " + answer.data);
      })
      .catch((error) => {
        console.log(error.response.data.error);
      });
  });
}

function squareCubicRoot(option, value, token) {
  axios
    .get(`${api}services/${option}/${value}`, {
      headers: {
        token: `${token}`,
      },
    })
    .then((answer) => {
      console.log("Result: " + answer.data);
    })
    .catch((error) => {
      console.log(error.response.data.error);
    });
}

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
      type: "password",
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

  const service_questions = [
    {
      type: "input",
      name: "option",
      message:
        "Choose a service, Calculation of: \n 1) square root (clearance level 1) \n 2) cubic root (clearance level 2) \n 3) parameterized n root (clearance level 3) \n",
      validate: (value) => {
        let pass = value.match(/^[1-3]/);
        if (pass) return true;
        else return "Please enter a valid option!";
      },
    },
    {
      type: "input",
      name: "value",
      message: "Enter the value: \n",
      validate: (value) => {
        if (isNaN(value)) {
          return "please enter a number";
        }
        return true;
      },
    },
  ];

  /*await inquirer.prompt(register_questions).then((answers) => {
    const { username, one_time_id } = answers;

    // Register
    axios
      .post(`${api}users/register`, { username, one_time_id })
      .then((answer) => {
        // Writes session token to a file
        fs.writeFile("./data/Session", answer.data.token, (err) => {
          // Error writing to file
          if (err) return console.log(err);
          console.log("Session data stored");
        });
      })
      .catch((error) => {
        console.log("ERRORRRR");
        console.log(error);
      });
  });*/
  await inquirer
    .prompt([
      {
        type: "input",
        name: "option",
        message: "What do you want to do?\n 1) Calculate a root \n 2) Quit \n",
        validate: (value) => {
          let pass = value.match(/^[1-2]/);
          if (pass) return true;
          else return "Please enter a valid option!";
        },
      },
    ])
    .then((answer) => {
      if (answer.option == 1) {
        let token;
        fs.readFile("./data/Session", (err, data) => {
          token = data;
        });
        inquirer.prompt(service_questions).then((answers) => {
          if (answers.option != 3) {
            squareCubicRoot(answers.option, answers.value, token);
          } else if (answers.option == 3) {
            paramRoot(answers.value, token);
          }
        });
      } else process.exit();
    });
}

module.exports = mainLoop;
