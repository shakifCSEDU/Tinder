const express = require('express');
const {userAuth} = require("../middlewares/auth");
const requestRouter = express.Router();
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        const allowedStatus = ["ignore", "interested"];

        if (!allowedStatus.includes(status)) {
            return res.status(400).send("Invalid status");
        }

        const toUser = await User.findById(toUserId);

        if (toUserId === fromUserId) {
            return res.status(400).send("You cannot send connection request to yourself");
        }

        if (!toUser) {
            return res.status(404).send("User not found");
        }


        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or: [
                {fromUserId, toUserId},
                {fromUserId: toUserId, toUserId: fromUserId}
            ],
        });

        if (existingConnectionRequest) {
            return res.status(400).send("Connection request already exists");
        }


        const connectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status
        });
        const savedConnectionRequest = await connectionRequest.save();
        res.json({
            message: req.user.firstName + " is " + status + " in " + toUser.firstName,
            savedConnectionRequest
        });
    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});

requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user; // toUser
        const {status, requestId} = req.params;

        const allowedStatus = ["accepted", "rejected"];

        if (!allowedStatus.includes(status)) {
            return res.status(400).json({message: "Status is not allowed! "});
        }

        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status: "interested",
        });

        if (!connectionRequest) {
            return res
                .status(400)
                .json({message: "Connection request not found!"})
        }

        connectionRequest.status = status;
        const data = await connectionRequest.save();
        res.status(200).json({message: "Connection request " + status, data})

    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});


module.exports = requestRouter;