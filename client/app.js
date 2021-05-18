const { default: axios } = require("axios");
const express = require("express");
const mainLoop = require("./main");
const https = require('https')

require('dotenv').config()

// Global axios defaults
axios.defaults.baseURL = process.env.API_URL
axios.defaults.httpsAgent = new https.Agent({ rejectUnauthorized: false })

// const app = express();
// const port = 3001;

// app.get("/", (req, res) => {
//   res.send("Hello world");
// });

// app.listen(port, () => {
//   console.log(`Example app listening at http://localhost:${port}`);
// });

mainLoop();
