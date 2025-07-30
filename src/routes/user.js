const express = require("express");
const {userAuth} = require("../middlewares/auth");
const userRouter = express.Router();
const connectionRequest = require("../models/connectionRequest");

// get all pending connection request for the loggedIn user
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
    const loggedInUser = req.user;
    try {
        const connectionRequests = await connectionRequest.find({
            toUserId: loggedInUser._id,
            status: "pending",
        }).populate("fromUserId", ["firstName", "lastName", "photoUrl", "age", "gender"]);

        res.json({
            message: "Data fetched successfully",
            data: connectionRequests,
        });

    } catch (err) {
        res.status(400).json({message: "Error " + err.message});
    }
});
userRouter.get("/user/connections", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const connectionRequests = await connectionRequest.find({
            $or: [
                {toUserId: loggedInUser._id, status: "accepted"},
                {fromUserId: loggedInUser._id, status: "accepted"},
            ],
        })
            .populate("fromUserId", ["firstName", "lastName", "photoUrl", "age", "gender"])
            .populate("toUserId", ["firstName", "lastName", "photoUrl", "age", "gender"]);

        const data = connectionRequests.map((row) => {
            if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
                return row.toUserId;
            } else
                return row.fromUserId;
        });


        res.json({
            message: "Data fetched successfully",
            data: data,
        });
    } catch (err) {
        res.status(400).json({message: "Error " + err.message});
    }
});
module.exports = userRouter;