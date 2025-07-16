const mongoose = require('mongoose');
const validator = require('validator')


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
        validate(value){
          if(!validator.isEmail("value")){
              throw new Error("Invalid email address :"+value);
          }
        },
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

const userModel = mongoose.model("User",userSchema);

module.exports = userModel;


