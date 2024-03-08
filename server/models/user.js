const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, length: { min: 3, max: 30 }, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true, length: { min: 4, max: 20 } },
});
const User = mongoose.model("User", userSchema);
module.exports = User;
