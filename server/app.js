const express = require("express");
const https = require('https')
const fs = require('fs')
const path = require('path')

const userRouter = require("./routes/users");
const servicesRouter = require("./routes/services");

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT

app.use("/api/users", userRouter);
app.use("/api/services", servicesRouter);

const options = {
    key: fs.readFileSync(path.join(__dirname, 'data', 'keys', 'server-key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'data', 'keys', 'server-crt.pem'))
}

const server = https.createServer(options, app).listen(port, () => {
  // TODO: tirar esta mensagem
  console.log(`Listening on https://localhost:${server.address().port}`)
})