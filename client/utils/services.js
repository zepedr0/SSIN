const axios = require("axios");
const inquirer = require("inquirer");

const api = "http://localhost:3000/api/";

// Root Calculation Menu
const rootCalc = async (token) => {
  const service_questions = [
    {
      type: "list",
      name: "option",
      message: "Choose a service, Calculation of: \n ",
      choices: [
        "1) square root (clearance level 1)",
        "2) cubic root (clearance level 2)",
        "3) parameterized n root (clearance level 3)",
        "4) Quit",
      ],
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

  inquirer.prompt(service_questions).then((answers) => {
    const answerNumber = answers.option.split(" ")[0];

    switch (answerNumber) {
      case "1)": {
        squareCubicRoot(1, answers.value, token);
        break;
      }
      case "2)": {
        squareCubicRoot(2, answers.value, token);
        break;
      }
      case "3)": {
        paramRoot(answers.value, token);
        break;
      }
      default: {
        process.exit();
      }
    }
  });
};

// Calculate Square or Cubic Root
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

// Calculate Parameterized N Root
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

module.exports = {
  rootCalc,
  paramRoot,
  squareCubicRoot,
};
