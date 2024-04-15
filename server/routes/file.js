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
      const { filename, fileID, roomID, value } = req.body;
      const duplicate = await File.findOne({ fileID: fileID });

      if (duplicate) {
        throw new Error("duplicate file found : can't save");
      }
      const file = new File({ filename, fileID, roomID, value });
      await file.save();
    } catch (e) {
      console.log("couldn't upload file to db");
      console.error(e);
    }
  })
);

module.exports = router;
