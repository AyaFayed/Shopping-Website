const mongoose = require("mongoose");
const products = require("./products");
const product = require("../models/product");
const users = require("./users");
const user = require("../models/user");
const bcrypt = require("bcrypt");

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
    const pass = await bcrypt.hash(users[i].password, 12);
    const u = new user({
      username: `${users[i].username}`,
      password: `${pass}`,
      cart: [],
    });

    await u.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
