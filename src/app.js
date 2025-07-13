const express = require('express');
const responseTime = require('response-time');
const connectDB = require("./config/database");
const app = express();
const PORT = process.env.PORT || 8000;
const User = require("./models/user");
const { doSomeHeavyTask } = require('./util');
const client = require("prom-client"); //  Metric Collection

// Collect default metrics
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });


const reqResTime = new client.Histogram({
    name: "http_express_req_res_time",
    help: "This tells how much time is taken by req and res",
    labelNames: ["method", "route", "status_code"],
    buckets: [1, 50, 100, 200, 400, 500, 800, 1000, 2000] // in milliseconds
});

app.use(responseTime((req, res, time) => {
    reqResTime
        .labels(req.method, req.url, res.statusCode)
        .observe(time);
}));



app.get("/", (req, res) => {
    return res.json({ message: `Hello from Express Server` });
});

app.get("/slow", async (req, res) => {
    try {
        const timeTaken = await doSomeHeavyTask();
        return res.json({
            status: "Success",
            message: `Heavy task is completed in ${timeTaken}ms`
        });
    } catch (error) {
        return res.status(500).json({
            status: "Error",
            error: error.message || "Internal Server Error"
        });
    }
});


// Metrics endpoint
app.get("/metrics", async (req, res) => {
    res.setHeader('Content-Type', client.register.contentType);
    const metrics = await client.register.metrics();
    res.send(metrics);
});

app.listen(PORT, () => {
    console.log(`Express Server Started at http://localhost:${PORT}`);
});





// app.post("/signup",async(req,res)=>{
//     const userObj = {
//         firstName: "Shakif",
//         lastName: "Sahriar",
//         emailid: "sakifsahriar@gmail.com",
//         password: "2232"
//     }

//     const user =  new User(userObj)
//     try{
//         await user.save();
//         res.send("User Added successfully");
//     }catch(err){
//         res.status(400).send("Error savings the user: "+err.message);
//     }
    
// })


// connectDB().then(()=>{
//     console.log("Database connected successfully");
//     app.listen(7777, () => {
//     console.log("Server is running on port 7777");
// });
// }).catch((err)=>{
//     console.log("Database connection failed");
// });


