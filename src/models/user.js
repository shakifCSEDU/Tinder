const mongoose = require('mongoose');
const validator = require('validator')
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String
    },
    emailId:{
        type: String,
        required: true,
        lowercase: true,
        trim : true,
        // validate(value){
        //   if(!validator.isEmail("value")){
        //       throw new Error("Invalid email address :"+value);
        //   }
        // },
    },
    password:{
        type: String,
        required: true,
    },
    age:{
        type: Number,
    },
    gender:{
        type: String,
        validate(value){
            if(!["male","female","others"].includes(value)){
                throw new Error("Gender data is not valid");
            }
        }
    },
    photoUrl:{
        type: String,
        default: "https://www.shutterstock.com/image-vector/vector-design-avatar-dummy-sign-600nw-1290556063.jpg",
    },
    about:{
        type: String,
        default: "This is a default about of the user!",
    },
    skills:{
        type: [String],
    }
},{
    timestamps:true,
});

userSchema.methods.getJWT = async function(){
    const user = this;
    const token = await jwt.sign({_id: user._id}, "DEV@Tinder$123",
        {
            expiresIn: "7d",
        });
    return token;
}

userSchema.methods.verifyPassword = async function(passwordInputByUser){
    const user = this;
    const passwordHash = user.password;
    const isPasswordValid = await bcrypt.compare(passwordInputByUser, passwordHash);
    return isPasswordValid;
}


const userModel = mongoose.model("User",userSchema);

module.exports = userModel;


