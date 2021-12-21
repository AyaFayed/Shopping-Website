const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");

const product = require("./models/product");
const user = require("./models/user");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//mongodb
mongoose
  .connect("mongodb://localhost:27017/shoppingWebsiteDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MONGO CONNECTION ESTABLISHED!");
  })
  .catch((error) => handleError(error));
mongoose.connection.on("error", (err) => {
  console.log("MONGO CONNECTION ERROR!");
  logError(err);
});

//to load images
app.use(express.static("public"));
// parse application/json
app.use(bodyParser.json());

//for post requests
app.use(bodyParser.urlencoded({ extended: true }));

// parse the raw data
app.use(bodyParser.raw());
// parse text
app.use(bodyParser.text());

app.listen(3000, () => {
  console.log("Serving on port 3000");
});

//===============
// PUBLIC ROUTES
//===============

//login
app.get("/", (req, res) => {
  res.render("login");
});

//registration
app.get("/registration", (req, res) => {
  res.render("registration");
});

//home route
app.get("/home", (req, res) => {
  res.render("home");
});

//books route
app.get("/books", (req, res) => {
  res.render("books");
});

//phones route
app.get("/phones", (req, res) => {
  res.render("phones");
});

//sports route
app.get("/sports", (req, res) => {
  res.render("sports");
});

//cart route
app.get("/cart", (req, res) => {
  res.render("cart");
});

//boxing sport route
app.get("/boxing", (req, res) => {
  res.render("boxing");
});

//tennis sport route
app.get("/tennis", (req, res) => {
  res.render("tennis");
});

//leaves book route
app.get("/leaves", (req, res) => {
  res.render("leaves");
});

//sun book route
app.get("/sun", (req, res) => {
  res.render("sun");
});

//galaxy phone route
app.get("/galaxy", (req, res) => {
  res.render("galaxy");
});

//iphone phone route
app.get("/iphone", (req, res) => {
  res.render("iphone");
});

//search
app.post("/search", async (req, res) => {
  const { Search } = req.body;
  const results = await product.find({ $text: { $search: `${Search}` } });
  res.render("searchresults", { results });
});
