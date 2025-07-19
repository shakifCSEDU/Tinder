const validator = require('validator');

const validateSignUpData = (req)=>{
    const {firstName,lastName,emailId,password} = req.body;
    if(!firstName){
        throw new Error("Name is not valid ! ");
    }
}
module.exports = {
    validateSignUpData,
}