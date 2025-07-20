const express = require('express');
const responseTime = require('response-time');
const connectDB = require("./config/database");
const app = express();
const PORT = process.env.PORT || 8000;
const User = require("./models/user");
const {doSomeHeavyTask} = require('./util');
const client = require("prom-client");
const {validateSignUpData} = require("./utils/validations"); //  Metric Collection
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const {userAuth} = require("./middlewares/auth");


app.use(express.json());
app.use(cookieParser())

app.post("/signup", async (req, res) => {
    // const user = new User(req.body);
    try {
        validateSignUpData(req);
        const {firstName, lastName, emailId, password} = req.body;

        const passwordHash = await bcrypt.hash(password, 10);
        const user = new User({
            firstName, lastName, emailId, password: passwordHash,
        });
        const signedUpuser = await user.save();
        res.status(201).send(signedUpuser);
    } catch (err) {
        res.status(400).send("Error saving the user: " + err.message);
    }
});

app.post("/login", async (req, res) => {
    try {
        const {emailId, password} = req.body;

        const user = await User.findOne({emailId: emailId});
        if (!user) {
            throw new Error("Email is not present in database");
        }

        const isPasswordValid = await user.verifyPassword(password);
        if (isPasswordValid) {
            const token = await user.getJWT();

            res.cookie("token", token, {expires: new Date(Date.now() + 8* 3600000)});
            res.send("Login Successfull");
        } else {
            throw new Error("Password is not correct");
        }
    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});

app.get("/profile", userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.send(user);
    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});

app.get("/sendConnectionRequest",userAuth,async (req, res) => {
    const user = req.user;
    res.send(user.firstName+" sent the connect request! ");
});


connectDB().then(() => {
    console.log("Database connected successfully");
    app.listen(7777, () => {
        console.log("Server is running on port 7777");
    });
}).catch((err) => {
    console.log("Database connection failed");
});


