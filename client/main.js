const inquirer = require("inquirer");
const axios = require("axios");
const fs = require("fs");

const api = "http://localhost:3000/api/";

function paramRoot(value) {
  const root_question = [
    {
      type: "number",
      name: "root",
      message: "Enter the root:\n",
      validate: (value) => {
        if (Number.isNaN(value)) return "Invalid Input! Please enter a number!";
        else return true;
      },
    },
  ];
  inquirer.prompt(root_question).then((answer) => {
    axios
      .get(`${api}services/3/${value}/${answer.root}`)
      .then((answer) => {
        console.log("Result: " + answer.data);
      })
      .catch((error) => {
        console.log("ERRORRRR");
        console.log(error);
      });
  });
}

function squareCubicRoot(option, value) {
  axios
    .get(`${api}services/${option}/${value}`)
    .then((answer) => {
      console.log("Result: " + answer.data);
    })
    .catch((error) => {
      console.log("ERRORRRR");
      console.log(error);
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
        "Choose a service, Calculation of: \n 1) square root \n 2) cubic root \n 3) parameterized n root \n",
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
        //if (Number.isNaN(value)) return 'Invalid Input! Please enter a number!';
        return true;
      },
    },
  ];

  /*inquirer.prompt(register_questions).then((answers) => {
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
  inquirer.prompt(service_questions).then((answers) => {
    if (answers.option != 3) {
      squareCubicRoot(answers.option, answers.value);
    } else {
      paramRoot(answers.value);
    }
  });
}

module.exports = mainLoop;
