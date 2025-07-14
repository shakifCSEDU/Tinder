const express = require('express');
const responseTime = require('response-time');
const connectDB = require("./config/database");
const app = express();
const PORT = process.env.PORT || 8000;
const User = require("./models/user");
const { doSomeHeavyTask } = require('./util');
const client = require("prom-client"); //  Metric Collection


app.use(express.json());


app.post("/signup",async(req,res)=>{
    const user = new User(req.body);
    try{
        await user.save();
        res.send("User Added successfully!");
    }catch(err){
        res.status(400).send("Error saving the user: "+err.message);
    }
});

// get user by email
app.get("/user",async (req,res)=>{
    
    try{
        const user = await User.findOne({emailId:req.body.emailId}).exec();
        if(!user){
            res.status(404).send("User not found");
        }else{  
            res.send(user);
        }
    }catch(err){
        res.status(400).send("Something went wrong");
    }
});


// Feed API - get all the users from the database
app.get("/feed",async(req,res)=>{
    try{
        const users = await User.find({});
            res.send(users);
        }catch(err){
            res.status(400).send("Something went wrong");
        }
});



connectDB().then(()=>{
    console.log("Database connected successfully");
    app.listen(7777, () => {
    console.log("Server is running on port 7777");
});
}).catch((err)=>{
    console.log("Database connection failed");
});


