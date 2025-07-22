const express = require('express');
const {userAuth} = require("../middlewares/auth");
const requestRouter = express.Router();
const ConnectionRequest = require("../models/connectionRequest");



requestRouter.post("/request/send/:status/:toUserId",userAuth,async (req, res) => {
    try{
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        const allowedStatus = ["ignore", "interested"];

        if(!allowedStatus.includes(status)){
            return res.status(400).send("Invalid status");
        }

        const toUser = await User.findById(toUserId);

        if(toUserId === fromUserId){
            return res.status(400).send("You cannot send connection request to yourself");
        }

        if(!toUser){
            return res.status(404).send("User not found");
        }


        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or: [
                {fromUserId, toUserId},
                {fromUserId: toUserId, toUserId: fromUserId}
            ],
        });

        if(existingConnectionRequest){
            return res.status(400).send("Connection request already exists");
        }


        const connectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status
        });
        const savedConnectionRequest = await connectionRequest.save();
        res.json({
            message:req.user.firstName+" is "+status+" in "+toUser.firstName,
            savedConnectionRequest
        });
    }catch (err){
        res.status(400).send("Error: "+err.message);
    }
});


module.exports = requestRouter;