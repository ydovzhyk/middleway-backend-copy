const express = require("express");
const logger = require("morgan");
const cors = require("cors");
require("dotenv").config();

const authRouter = require("./routes/api/auth");
const technicalRouter = require("./routes/api/technical");
const smsRouter = require("./routes/api/sms");

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors({ credentials: false, origin: "*" }));
app.use(express.json());
app.use("/static", express.static("public"));
app.use("/auth", authRouter);
app.use("/technical", technicalRouter);
app.use("/sms", smsRouter);
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  console.log(err);
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({
    message,
  });
});

module.exports = app;
