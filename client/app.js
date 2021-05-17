const express = require("express");
const mainLoop = require("./main");

require('dotenv').config()

// const app = express();
// const port = 3001;

// app.get("/", (req, res) => {
//   res.send("Hello world");
// });

// app.listen(port, () => {
//   console.log(`Example app listening at http://localhost:${port}`);
// });

mainLoop();
