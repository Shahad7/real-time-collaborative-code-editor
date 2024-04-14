var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const MONGOURI =
  "mongodb+srv://shahad7:qahe7LhbAc84JQfs@cluster0.ytovchg.mongodb.net/major-project?retryWrites=true&w=majority&appName=Cluster0";

try {
  (async () => {
    await mongoose.connect(MONGOURI);
    console.log("Database connection successful :)");
  })();
} catch (e) {
  console.error(e);
}

var indexRouter = require("./routes/index");
var fileRouter = require("./routes/file");
var app = express();

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/file", fileRouter);

module.exports = app;
