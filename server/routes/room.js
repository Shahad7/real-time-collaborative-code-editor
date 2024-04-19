var express = require("express");
var router = express.Router();
const mognoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const File = require("../models/file");
const Room = require("../models/room");
const User = require("../models/user");

//send all room details
router.post(
  "/all-rooms",
  asyncHandler(async (req, res, next) => {
    try {
      const username = req.body.username;
      const user = await User.findOne({ username });

      const rooms = await Room.find({
        members: { username: user.username, email: user.email },
      });

      res.json({ rooms });
    } catch (e) {
      console.log("couldn't fetch all rooms' details");
      console.error(e);
    }
  })
);

//sends files and data to data-store component
router.post(
  "/:roomID",
  asyncHandler(async (req, res, next) => {
    try {
      const roomID = req.params.roomID;
      const room = await Room.findOne({ roomID: roomID });
      const username = req.body.username;

      if (!room) {
        res.status(400).json("No such room");
      }
      let includes = false;
      room.members.forEach((elt) => {
        if (elt.username == username) includes = true;
      });
      if (room && !includes)
        res.status(403).json("You are not authorized to access this data");
      else {
        const files = await File.find({ roomID: roomID });
        if (files.length == 0) {
          res.status(404).json("no files found for requested session");
        } else res.json({ files, room });
      }
    } catch (e) {
      console.log("couldn't fetch room details or content");
      console.error(e);
    }
  })
);

module.exports = router;
