const express = require("express");

const userRouter = require("./routes/users");
const servicesRouter = require("./routes/services");

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = 3000;

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

app.use("/api/users", userRouter);
app.use("/api/services", servicesRouter);

// TODO: meter https