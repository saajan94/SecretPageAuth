var express = require("express");
var mongoose = require("mongoose");
var passport = require("passport");
var bodyParser = require("body-parser");
var User = require("./models/user");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/auth_demo"
mongoose.connect(MONGODB_URI, {useNewUrlParser: true});

var app = express();
var PORT = process.env.PORT || 3002;
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(require("express-session")({
    secret: "This is a secret message for decoding",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Routes

app.get("/", function(req, res) {
    res.render("home");
});

app.get("/secret", isLoggedIn, function(req, res) {
    res.render("secret");
});

// Authentication routes

app.get("/register", function(req, res) {
    res.render("register");
});

app.post("/register", function(req, res) {
    User.register(new User({
        username: req.body.username
    }),
    req.body.password, function(err, user) {
        if(err) {
            console.log(err);
            res.render("register"); 
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/secret");
            });
        }
    });
});

app.get("/login", function(req, res) {
    res.render("login");
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/login"
}), function(req, res) {

});

app.get("/logout", function(req, res) {
    req.logOut();
    res.redirect("/")
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

app.listen(3002, function() {
    console.log("App is listening on port " + PORT + "!");
});