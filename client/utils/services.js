const axios = require("axios");
const inquirer = require("inquirer");

const askUserValue = async () => {
  const value_question = [
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

  return await inquirer
    .prompt(value_question)
    .then((answerValue) => {
      return answerValue.value;
    })
    .catch((error) => {
      console.log("Failed to retrieve value from user");
      console.log(error);
      return;
    });
};

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
        "4) Back",
      ],
    },
  ];

  await inquirer.prompt(service_questions).then(async (answers) => {
    const answerNumber = answers.option.split(" ")[0];

    switch (answerNumber) {
      case "1)": {
        const value = await askUserValue();
        await squareCubicRoot(1, value, token);
        break;
      }
      case "2)": {
        const value = await askUserValue();
        await squareCubicRoot(2, value, token);
        break;
      }
      case "3)": {
        const value = await askUserValue();
        await paramRoot(value, token);
        break;
      }
      default: {
        break
      }
    }
  });
};

// Calculate Square or Cubic Root
async function squareCubicRoot(option, value, token) {
  await axios
    .get(`/services/${option}/${value}`, {
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
async function paramRoot(value, token) {
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
  await inquirer.prompt(root_question).then(async (answer) => {
    await axios
      .get(`/services/3/${value}/${answer.root}`, {
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
