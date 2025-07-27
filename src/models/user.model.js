import mongoose from 'mongoose';
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    userName : {
        type : String,
        unique : true,
        required : true,
    },
    email : {
        type : String,
        unique : true,
        required : true,
    },
    password : {
        type : String,
        required : true,
    },
    verificationToken : {
        type : String,
    },
    refreshToken : {
        type : String,
    },
},{timestamps : true})



userSchema.methods.comparePassword = async function (password) {
    return await this.password === password;
}

userSchema.methods.createAccessToken = async function (data) {
    return jwt.sign(
            data,
            process.env.JWT_ACCESSTOKEN_SECRET,
            {expiresIn: '4h'}
        );
}

userSchema.methods.createRefreshToken = async function (data) {
    return jwt.sign(
            data,
            process.env.JWT_REFRESHTOKEN_SECRET,
            {expiresIn: '24h'}
        );
}

const User = mongoose.model("User", userSchema);   //-----> User get users in database
export default User;