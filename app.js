const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const user = require("./models/user");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const session = require("express-session");
const products = require("./products.json");


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
  .connect("mongodb+srv://AyaFayed:aya123456@cluster0.i9jqm.mongodb.net/ShoppingWebsite?retryWrites=true&w=majority", {
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

//===============
// Add to Cart
//===============
const clicker = catchAsync(async function (name, userID) {
  const currUser = await user.findOne({ _id: userID });
  var prod = [];
  for(let i=0; i<products.length ; i++){
    if(products[i]["name"].toLowerCase() === name.toLowerCase()){
        prod= products[i];
    }
}
  const cart = currUser.cart;
  var exists = false;
  for (let one of cart) {
    if (one.name == name) {
      exists = true;
    }
  }
  if (!exists) {
    currUser.cart.push({
      image: prod.image,
      name: prod.name,
      category: prod.category,
      description: prod.description,
      price: prod.price,
      qty: 1,
      ref: prod.ref,
    });
   await currUser.save();
  }
});

const inCart = function (name , cart){
  var exists = false;
  for (let one of cart) {
    if (one.name === name) {
      exists = true;
    }
  }
  return exists;
}


if (process.env.PORT){
  app.listen(process.env.PORT);
}else {
app.listen(3000);
}

//===============
// PUBLIC ROUTES
//===============

//login
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.render("home",{name: 'Products'});
  }
  else{
  res.render("login",{name : 'Welcome'});}
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
        var day = 86400000;
        req.session.cookie.expires = new Date(Date.now() + day);
        req.session.cookie.maxAge = day;

        req.flash("success", "sucessfully logged in!");
        res.redirect("/home");
      } else {
        req.flash("error", "wrong password!");
        res.redirect("/");
      }
    } else {
      req.flash("error", "You need to register!");
      res.redirect("/");
    }
  })
);



//registration
app.get("/registration", (req, res) => {
  res.render("registration",{name :' Registration' });
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
        var day = 86400000;
        req.session.cookie.expires = new Date(Date.now() + day);
        req.session.cookie.maxAge = day;

        req.flash("success", "Registeration completed successfully!");
        res.redirect("/home");
      }
    }
  })
);


//home route
app.get("/home", requireLogin, (req, res) => {
  res.render("home",{name: 'Products'});
});

//books route
app.get("/books", requireLogin, (req, res) => {
  res.render("books", {name : 'Books'});
});

//phones route
app.get("/phones", requireLogin, (req, res) => {
  res.render("phones", {name : 'Phones'});
});

//sports route
app.get("/sports", requireLogin, (req, res) => {
  res.render("sports", {name :'Sports'});
});

//cart route
app.get(
  "/cart",
  requireLogin,
  catchAsync(async (req, res) => {
    const currUser = await user.findOne({ _id: req.session.user_id });
    const userCart = currUser.cart;
    res.render("cart", { userCart , name :'Cart' });
  })
);

// Delete Cart

app.post(
  "/cart",
  requireLogin,
  catchAsync(async (req, res) => {
    const currUser = await user.findOne({ _id: req.session.user_id });
    currUser.cart = [];
    await currUser.save();
    res.redirect("/cart");
  })
);

app.get("/boxing", requireLogin, catchAsync(async (req, res) => {
  const currU = await user.findOne({ _id: req.session.user_id });
  const userCart = currU.cart;
  const currUser = req.session.user_id;
  res.render("boxing", { userCart , y: inCart ,currUser, x: clicker , name : 'Boxing Bag' });
}));

//tennis sport route
app.get("/tennis", requireLogin, catchAsync(async (req, res) => {
  const currU = await user.findOne({ _id: req.session.user_id });
  const userCart = currU.cart;
  const currUser = req.session.user_id;
  res.render("tennis", { userCart , y: inCart ,currUser, x: clicker ,name : 'Tennis Racket'  });
}));

//leaves book route
app.get("/leaves", requireLogin, catchAsync(async (req, res) => {
  const currU = await user.findOne({ _id: req.session.user_id });
  const userCart = currU.cart;
  const currUser = req.session.user_id;
  res.render("leaves", { userCart , y: inCart ,currUser ,x: clicker  ,name : 'Leaves of Grass' });
}));

//sun book route
app.get("/sun", requireLogin, catchAsync(async (req, res) => {
  const currU = await user.findOne({ _id: req.session.user_id });
  const userCart = currU.cart;
  const currUser = req.session.user_id;
  res.render("sun", { userCart , y: inCart ,currUser, x: clicker  ,name : 'The Sun and Her Flowers' });
});

//galaxy phone route
app.get("/galaxy", requireLogin,catchAsync(async (req, res) => {
  const currU = await user.findOne({ _id: req.session.user_id });
  const userCart = currU.cart;
  const currUser = req.session.user_id;
  res.render("galaxy", {userCart , y: inCart , currUser, x: clicker  ,name : 'Galaxy S21 Ultra' });
}));

//iphone phone route
app.get("/iphone", requireLogin, catchAsync(async (req, res) => {
  const currU = await user.findOne({ _id: req.session.user_id });
  const userCart = currU.cart;
  const currUser = req.session.user_id;
  res.render("iphone", { userCart , y: inCart ,currUser, x: clicker  ,name : 'iPhone 13 Pro' });
}));

//search
app.post(
  "/search",
   (req, res) => {
    const { Search } = req.body;
    var results = [];
    if (Search.length != 0) {
      for(let i=0; i<products.length ; i++){
        if(products[i]["name"].toLowerCase().includes(Search.toLowerCase())){
              results.push(products[i]);
        }
    }
    }
    res.render("searchresults", { results, name : 'Search Results' });
  }
);

//logout
app.post("/logout",(req,res)=>{
    req.session.user_id=null;
    res.redirect("/");
});

//any other route
app.get("/*", (req, res) => {
  if (req.session.user_id) {
    res.render("home",{name: 'Products'});
  }
  else{
  res.render("login",{name : 'Welcome'});}
});
