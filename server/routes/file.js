var express = require("express");
var router = express.Router();
const mognoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const File = require("../models/file");

router.post(
  "/upload",
  asyncHandler(async (req, res, next) => {
    try {
      const { filename, fileID, roomID } = req.body;
      const file = new File({ filename, fileID, roomID });
      await file.save();
    } catch (e) {
      console.log("couldn't upload file " + filename + "to db");
      console.error(e);
    }
  })
);

module.exports = router;
