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

app.use(express.json());


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

        const isPasswordValid = bcrypt.compare(password, user.password);
        if (isPasswordValid) {
            res.send("Login Successfull");
        } else {
            throw new Error("Password is not correct");
        }
    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});


// get user by email
app.get("/user", async (req, res) => {

    try {
        const user = await User.findOne({emailId: req.body.emailId}).exec();
        if (!user) {
            res.status(404).send("User not found");
        } else {
            res.send(user);
        }
    } catch (err) {
        res.status(400).send("Something went wrong");
    }
});


// Feed API - get all the users from the database
app.get("/feed", async (req, res) => {
    try {
        const users = await User.find({});
        res.send(users);
    } catch (err) {
        res.status(400).send("Something went wrong");
    }
});

app.delete("/user", async (req, res) => {
    const userID = req.body.userId;
    try {
        const user = await User.findByIdAndDelete({userID});
        res.send("User Deleted successfully!");
    } catch (err) {
        res.status(400).send("Something went wrong");
    }
});

// Update user
app.patch("/user/:userId", async (req, res) => {
    const data = req.body;
    const id = req.params?.userId;
    try {
        const ALLOWED_UPDATES = ["photoUrl", "about", "gender", "age", "skills"];
        const isUpdateAllowed = Object.keys(data).every((k) => {
            return ALLOWED_UPDATES.includes(k);
        });
        if (!isUpdateAllowed) {
            throw new Error("Update not allowed");
        }
        if (data?.skills.length > 10) {
            throw new Error("Skills can not be more than 10");
        }
        await User.findByIdAndUpdate({_id: id}, data, {
            returnDocument: "after",
            runValidators: true,
        });
        res.send("User Updated  successfully!");
    } catch (err) {
        res.status(400).send("UPDATE FAILED: " + err.message);
    }
});


connectDB().then(() => {
    console.log("Database connected successfully");
    app.listen(7777, () => {
        console.log("Server is running on port 7777");
    });
}).catch((err) => {
    console.log("Database connection failed");
});


