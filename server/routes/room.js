var express = require("express");
var router = express.Router();
const mognoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const File = require("../models/file");
const Room = require("../models/room");

//sends files and data to data-store component
router.get(
  "/:roomID",
  asyncHandler(async (req, res, next) => {
    try {
      const roomID = req.params.roomID;
      const room = await Room.findOne({ roomID: roomID });

      if (!room) {
        res.status(400).json("No such room");
      } else {
        const files = await File.find({ roomID: roomID });
        if (files.length == 0) {
          res.json("no files found for requested session");
        }
        res.json({ files });
      }
    } catch (e) {
      console.log("couldn't fetch room details or content");
      console.error(e);
    }
  })
);

module.exports = router;
