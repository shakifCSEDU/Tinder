const express = require('express');
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user")

app.post("/signup",async(req,res)=>{
    const userObj = {
        firstName: "Shakif",
        lastName: "Sahriar",
        emailid: "sakifsahriar@gmail.com",
        password: "2232"
    }

    const user =  new User(userObj)
    try{
        await user.save();
        res.send("User Added successfully");
    }catch(err){
        res.status(400).send("Error savings the user: "+err.message);
    }
    
})



connectDB().then(()=>{
    console.log("Database connected successfully");
    app.listen(7777, () => {
    console.log("Server is running on port 7777");
});
}).catch((err)=>{
    console.log("Database connection failed");
});


