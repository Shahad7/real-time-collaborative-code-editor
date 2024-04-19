const { mongoose } = require("mongoose");
const Schema = mongoose.Schema;

const roomSchema = new Schema({
  roomID: { type: String, required: true },
  members: [String],
  date: { type: String, required: true },
  time: { type: String, required: true },
});

const Room = mongoose.model("Room", roomSchema);
module.exports = Room;
