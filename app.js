//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
//const encrypt = require("mongoose-encryption");
//const md5 = require("md5");
// const bcrypt = require("bcrypt");
// const saltRounds = 10;
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

const dbName = "userDB"

app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.URL, {dbName: dbName}).then(console.log("Server connected")).catch(error => handleError(error));

//-------- LEVEL 2 SECURITY ---------//

const userSchema = new mongoose.Schema ({
    email: String,
    password: String
});

//-------- LEVEL 2 SECURITY ---------//

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/secrets", (req, res) => {
    if (req.isAuthenticated()){
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});

app.get("/logout", function(req, res){
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect("/");
    });
});

app.post("/register", (req, res) => {

    // bcrypt.hash(req.body.password, saltRounds, function(err, hash){
    //     const newUser = new User({
    //         email: req.body.username,
    //         password: hash
    //     });
    
    //     newUser.save().then(user => {
    //         console.log(`User "${user}" saved successfully`);
    //         res.render("secrets");
    //     }).catch(err => {
    //         console.log(`An error occurred: ${err}`);
    //     });
    // });

    User.register({username: req.body.username}, req.body.password, function(err, user){
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            })
        }
    });

});

app.post("/login", (req, res) => {
    // const username = req.body.username;
    // const password = req.body.password;

    // User.findOne({email: username}).then(foundUser => {
    //     console.log(foundUser);        
    //     if(foundUser){
    //         console.log(`Username "${username}" found.`);
    //         bcrypt.compare(password, foundUser.password, function(err, result){
    //             if(result === true){
    //                 console.log("Password match");
    //                 res.render("secrets");
    //             };
    //         });
    //     }else {
    //         console.log(`User "${username}" not found`);
    //     }

    // }).catch(err => {
    //     console.log(`An error ocurred: ${err}`);
    // });

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err){
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    });
});

app.listen(3000);