const mongoose = require("mongoose");
const product = require("./product");
const cartSchema = new mongoose.Schema({
  image: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ["Books", "Sports", "Phones"],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  qty: {
    type: Number,
  },
});
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minLength: 3,
    maxLength: 50,
  },
  password: {
    type: String,
    required: true,
  },
  cart: {
    type: [cartSchema],
  },
});

module.exports = mongoose.model("user", userSchema);
