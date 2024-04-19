var express = require("express");
var router = express.Router();
const mognoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const File = require("../models/file");
const Room = require("../models/room");

router.post(
  "/upload",
  asyncHandler(async (req, res, next) => {
    try {
      const { filename, fileID, roomID, value, path } = req.body;
      const duplicate = await File.findOne({ fileID: fileID });

      if (duplicate) {
        throw new Error("duplicate file found : can't save");
      }
      const file = new File({ filename, fileID, roomID, value, path });
      await file.save();
    } catch (e) {
      console.log("couldn't upload file to db");
      console.error(e);
    } finally {
      res.end();
    }
  })
);

router.post(
  "/:fileID",
  asyncHandler(async (req, res, next) => {
    try {
      const roomID = req.body.roomID;
      const fileID = req.params.fileID;

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
        const file = await File.findOne({ fileID: fileID });

        if (!file) {
          res.status(404).json("no such file");
        } else {
          res.json({ value: file.value });
        }
      }
    } catch (e) {
      console.log("couldn't fetch file content");
      console.error(e);
    }
  })
);
module.exports = router;
