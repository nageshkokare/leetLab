import jwt from "jsonwebtoken";
import dotenv from "dotenv";


import userModel from "../models/user.model.js";


const isLogin = async function (req, res, next) {
    const token = req?.cookies?.accessToken;

    const decodedToken = jwt.verify(token, process.env.JWT_ACCESSTOKEN_SECRET);
    req.user = await userModel.findById(decodedToken._id).select("-password -verificationToken -refreshToken");

    // console.log("middleware is gone happily-->",req.user); //----> test line for checking user object key value pairs

    next();
}

const isValid = async function (req, res, next) {
    const existingUser = await userModel.findById(req.user._id);
    
    if (existingUser.role === "ADMIN") {
        next();
    }else{
        return res
        .status(400)
        .json({
            message : "you are not valid user to do this task"
        })
    }
}

export {
    isLogin,
    isValid
}