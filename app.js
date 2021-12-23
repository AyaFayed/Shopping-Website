const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const product = require("./models/product");
const user = require("./models/user");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const session = require("express-session");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(flash());
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.raw());
app.use(bodyParser.text());
app.use(methodOverride("_method"));

//========================
// SESSION & MONGO CONFIG
//========================

app.use(
  session({
    secret: "Secter whatev",
    resave: true,
    saveUninitialized: true,
  })
);

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

//===============
// Logged in user
//===============
const requireLogin = (req, res, next) => {
  if (!req.session.user_id) {
    return res.redirect("/");
  }
  next();
};

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

app.post(
  "/",
  catchAsync(async (req, res) => {
    const { username, password } = req.body;
    const currUser = await user.findOne({ username });
    if (currUser) {
      const valid = await bcrypt.compare(password, currUser.password);
      if (valid) {
        req.session.user_id = currUser._id;
        req.flash("success", "sucessfully logged in!");
        res.redirect("/home");
      } else {
        req.flash("error", "wrong username or password!");
        res.redirect("/");
      }
    } else {
      req.flash("error", "wrong username or password!");
      res.redirect("/");
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
      username: Joi.string().min(3).max(50).required(),
      password: Joi.string().min(6).max(50).required(),
      cart: Joi.any().optional(),
    });
    const { error } = userSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((el) => el.message).join(",");
      req.flash("error", msg);
      res.redirect("/registration");
    } else {
      const { username, password } = req.body;
      const otherUser = await user.findOne({ username });
      if (otherUser) {
        const msg = "This username already exists!";
        req.flash("error", msg);
        res.redirect("/registration");
      } else {
        const pass = await bcrypt.hash(password, 12);
        const newUser = new user({
          username: `${username}`,
          password: `${pass}`,
        });
        await newUser.save();
        req.session.user_id = newUser._id;
        req.flash("success", "Registeration completed successfully!");
        res.redirect("/home");
      }
    }
  })
);

//home route
app.get("/home", requireLogin, (req, res) => {
  res.render("home");
});

//books route
app.get("/books", requireLogin, (req, res) => {
  res.render("books");
});

//phones route
app.get("/phones", requireLogin, (req, res) => {
  res.render("phones");
});

//sports route
app.get("/sports", requireLogin, (req, res) => {
  res.render("sports");
});

//cart route
app.get("/cart", requireLogin, (req, res) => {
  const currUser = product.findOne({ _id: req.session.user_id });
  const userCart = currUser.cart;
  res.render("cart", { userCart });
});

//boxing sport route
app.get("/boxing", requireLogin, (req, res) => {
  res.render("boxing");
});

//tennis sport route
app.get("/tennis", requireLogin, (req, res) => {
  res.render("tennis");
});

//leaves book route
app.get("/leaves", requireLogin, (req, res) => {
  res.render("leaves");
});

//sun book route
app.get("/sun", requireLogin, (req, res) => {
  res.render("sun");
});

//galaxy phone route
app.get("/galaxy", requireLogin, (req, res) => {
  res.render("galaxy");
});

//iphone phone route
app.get("/iphone", requireLogin, (req, res) => {
  res.render("iphone");
});

//search
app.post(
  "/search",
  catchAsync(async (req, res) => {
    const { Search } = req.body;
    const all = await product.find({});
    var results = [];
    if (Search.length != 0) {
      for (let one of all) {
        if (one.name.toLowerCase().includes(Search.toLowerCase())) {
          results.push(one);
        }
      }
    }
    res.render("searchresults", { results });
  })
);
