const mongoose = require("mongoose");

const connectDB = async ()=>{
   await mongoose.connect(
    "mongodb+srv://sakifsahriar:shakif_24@tinder.oehqocv.mongodb.net/Tinder"
    );
}

module.exports = connectDB;

