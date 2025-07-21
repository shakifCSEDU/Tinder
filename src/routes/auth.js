const express = require('express')
const {validateSignUpData} = require("../utils/validations");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {userAuth} = require("../middlewares/auth");
const User = require("../models/user");


const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
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


authRouter.post("/login", async (req, res) => {
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
authRouter.post("/logout", async (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now())
    });
    res.send("Logout Successfull !!");
});




module.exports = authRouter;
