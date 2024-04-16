const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const fileSchema = new Schema({
  filename: { type: String, required: true },
  fileID: { type: String, required: true },
  path: { type: String, required: true },
  roomID: { type: String, required: true },
  value: { type: String, required: true },
});

const File = mongoose.model("File", fileSchema);
module.exports = File;
