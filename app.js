//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

const dbName = "userDB"

mongoose.connect(process.env.URL, {dbName: dbName}).then(console.log("Server connected")).catch(error => handleError(error));

//-------- LEVEL 2 SECURITY ---------//

const userSchema = new mongoose.Schema ({
    email: String,
    password: String
});

userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

//-------- LEVEL 2 SECURITY ---------//

const User = new mongoose.model("User", userSchema);

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save().then(user => {
        console.log(`User "${user}" saved successfully`);
        res.render("secrets");
    }).catch(err => {
        console.log(`An error occurred: ${err}`);
    });
});

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username}).then(foundUser => {
        console.log(foundUser);        
        if(foundUser){
            console.log(`Username "${username}" found.`);
            if(foundUser.password === password){
                console.log("Password match");
                res.render("secrets");
            };
        }else {
            console.log(`User "${username}" not found`);
        }

    }).catch(err => {
        console.log(`An error ocurred: ${err}`);
    });
});

app.listen(3000);