const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
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
  ref: String,
});

productSchema.index({ title: "text", description: "text", category: "text" });
const product = mongoose.model("product", productSchema);
product.createIndexes();

module.exports = product;
