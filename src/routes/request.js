const express = require('express');
const {userAuth} = require("../middlewares/auth");
const connectionRouter = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require("../models/user");



connectionRouter.get("/sendConnectionRequest",userAuth,async (req, res) => {
    const user = req.user;
    res.send(user.firstName+" sent the connect request! ");
});


module.exports = connectionRouter;