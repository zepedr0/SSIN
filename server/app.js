const express = require("express");
const fs = require("fs");

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  const users = JSON.parse(fs.readFileSync("./data/users.json"));
  console.log(JSON.stringify(users));
  res.send(users);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
