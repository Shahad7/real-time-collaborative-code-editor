var express = require("express");
var router = express.Router();
const mognoose = require("mongoose");
const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.get("/", function (req, res, next) {
  res.json("yes, you have reached at thy location sire");
});

//sign-up
router.post("/signup", [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("name can't be empty")
    .isLength({ min: 3, max: 30 })
    .withMessage("name should be of atleast length 3"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("email can't be empty")
    .custom((value, { req }) => {
      return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(
        req.body.email
      );
    })
    .withMessage("invalid email")
    .custom(async (value, { req }) => {
      const user = await User.findOne({ email: req.body.email });
      if (user) throw new Error("email already in use");
    }),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("passsword can't be empty")
    .isLength({ min: 4 })
    .withMessage("password should be atleast 4 characters long"),
  body("confirm_password")
    .trim()
    .notEmpty()
    .withMessage("please confirm password")
    .custom((value, { req }) => {
      return req.body.password === req.body.confirm_password;
    })
    .withMessage("password and confirm password fields should match"),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        if (err) {
          console.error(err);
        } else {
          try {
            const user = new User({
              name: req.body.name,
              email: req.body.email,
              password: hashedPassword,
            });
            await user.save();
          } catch (e) {
            console.error(e);
          }
          res.json({ success: true });
        }
      });
    } else {
      res.json({ error: errors.array()[0].msg, success: false });
    }
  }),
]);

router.post("/login", [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("email can't be empty")
    .custom((value, { req }) => {
      return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(
        req.body.email
      );
    })
    .withMessage("please provide a valid email"),
  body("password").notEmpty().withMessage("password can't be empty"),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      const user = await User.findOne({ email: req.body.email });
      if (typeof user !== "undefined") {
        const match = await bcrypt.compare(req.body.password, user.password);
        if (match) {
          jwt.sign({ user: user }, "hweFnkAeedenQgwdjk63b$", (err, token) => {
            if (err) console.error(err);
            else res.json({ success: true, token: token });
          });
        } else res.json({ success: false, error: "invalid credentials" });
      } else res.json({ success: false, error: "invalid credentials" });
    } else {
      res.json({ success: false, error: errors.array()[0].msg });
    }
  }),
]);

//function to extract jwt token from headers
function extractToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ")[1];
    req.token = bearer;
    next();
  } else {
    //handle authentication failure here
    res.json({ success: false });
  }
}

//function to verify the jwt token
function verifyToken(req, res, next) {
  jwt.verify(req.token, "hweFnkAeedenQgwdjk63b$", (err, authData) => {
    if (err) {
      console.log(err);
      res.json({ success: false });
    } else {
      res.json({ success: true });
    }
  });
}

module.exports = router;
