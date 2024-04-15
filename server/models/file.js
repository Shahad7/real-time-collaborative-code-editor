const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const fileSchema = new Schema({
  filename: { type: String, required: true },
  fileID: { type: Schema.Types.UUID, required: true },
  roomID: { type: String, required: true },
  value: { type: String, required: true },
});

const File = mongoose.model("File", fileSchema);
module.exports = File;
