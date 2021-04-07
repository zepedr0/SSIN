const express = require("express");

const userRouter = require("./routes/users");

const app = express();
const port = 3000;
app.use("/api/users", userRouter);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
