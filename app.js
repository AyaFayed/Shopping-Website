const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const product = require("./models/product");
const user = require("./models/user");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const Joi = require("joi");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(flash());
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.raw());
app.use(bodyParser.text());

//========================
// SESSION & MONGO CONFIG
//========================

app.use(
  require("express-session")({
    secret: "Secter whatev",
    resave: true,
    saveUninitialized: true,
  })
);

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user;
  res.locals.lang = req.session.lang;
  next();
});

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

//===============
// FLASH
//===============
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

//=================
// Error validation
//=================
/*
const validateRegistration = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    var msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};*/

app.listen(3000, () => {
  console.log("Serving on port 3000");
});

//===============
// PUBLIC ROUTES
//===============
// another public routes
//login
app.get("/", (req, res) => {
  res.render("login");
});

app.post(
  "/",
  catchAsync(async (req, res) => {
    const { username, password } = req.body;
    const currUser = await user.findOne({ username: `${username}` });
    if (currUser && password === currUser.password) {
      console.log("yaay!");
      res.render("home");
    } else {
      console.log("No!");
    }
  })
);

//registration
app.get("/registration", (req, res) => {
  res.render("registration");
});

//registration of a new user
app.post(
  "/register",
  catchAsync(async (req, res) => {
    const userSchema = Joi.object({
      user: Joi.object({
        username: Joi.string().min(3).max(50).required(),
        password: Joi.string().min(6).max(50).required(),
        cart: Joi.any().optional(),
      }).required(),
    });
    const { error } = userSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((el) => el.message).join(",");
      req.flash("error", msg);
    } else {
      const { username, password } = req.body;
      const otherUser = await user.findOne({ username: `${username}` });
      if (otherUser) {
        const msg = "This username already exists!";
        req.flash("error", msg);
      } else {
        const newUser = new user({
          username: `${username}`,
          password: `${password}`,
        });

        await newUser.save();
        var msgs = [];
        msgs.push("You registered successfully !");
        req.flash("success", msgs);
        res.redirect("home");
      }
    }
  })
);

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
app.post(
  "/search",
  catchAsync(async (req, res) => {
    const { Search } = req.body;
    const results = await product.find({ $text: { $search: `${Search}` } });
    res.render("searchresults", { results });
  })
);
