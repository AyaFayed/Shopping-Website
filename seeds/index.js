const mongoose = require("mongoose");
const products = require("./products");
const product = require("../models/product");
const users = require("./users");
const user = require("../models/user");

mongoose.connect("mongodb://localhost:27017/shoppingWebsiteDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const seedDB = async () => {
  await product.deleteMany({});
  for (let i = 0; i < products.length; i++) {
    const p = new product({
      name: `${products[i].name}`,
      image: `${products[i].image}`,
      category: `${products[i].category}`,
      description: `${products[i].description}`,
      price: `${products[i].price}`,
    });

    await p.save();
  }
  await user.deleteMany({});
  for (let i = 0; i < users.length; i++) {
    const u = new user({
      username: `${users[i].username}`,
      password: `${users[i].password}`,
    });

    await u.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
