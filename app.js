const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//to load images
app.use(express.static("public"));
// parse application/json
app.use(bodyParser.json());
//for post requests
//search
app.use(bodyParser.urlencoded({ extended: true }));

// parse the raw data
app.use(bodyParser.raw());
// parse text
app.use(bodyParser.text());

app.listen(3000, () => {
  console.log("Serving on port 3000");
});

//ROUTES:

//home route
app.get("/", (req, res) => {
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
app.post("/search", (req, res) => {
  const { Search } = req.body;
  const s2 = Search.toLowerCase();
  const itemSearchedFor = s2.replace(/\s+/g, "");
  if (
    itemSearchedFor === "books" ||
    itemSearchedFor === "boxing" ||
    itemSearchedFor === "galaxy" ||
    itemSearchedFor === "iphone" ||
    itemSearchedFor === "leaves" ||
    itemSearchedFor === "phones" ||
    itemSearchedFor === "sports" ||
    itemSearchedFor === "sun" ||
    itemSearchedFor === "tennis"
  ) {
    res.render(`${itemSearchedFor}`);
  } else {
    res.render("searchresults");
  }
});
