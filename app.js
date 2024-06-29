const express = require("express");
const mongoose = require("mongoose");
const indexRouter = require("./routes/index");

const app = express();
const { PORT = 3001 } = process.env;

mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {
    console.log("Connected to database");
  })
  .catch(console.error);

app.use(express.json());

app.use((req, res, next) => {
  req.user = {
    _id: "667f5107fbb21080641526fa",
  };
  next();
});

app.use("/", indexRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
