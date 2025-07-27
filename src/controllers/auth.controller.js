import cookie_parser from "cookie-parser";
import mongoose from 'mongoose';
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";


const register = async function (req, res) {
    const {userName, email, password} = req.body;
    if (!userName || !email || !password) {
        return res
        .status(400)
        .json({message : "all fields are required"});
    }

    try {
        const existingUser = await userModel.findOne({email});
        if (existingUser) {
            return res
            .status(400)
            .json({message : "user are already exist"});
        }
        console.log("data getting successfully", userName, email, password);  //--test line
        const newUser = await userModel.create({userName, email, password})
        if (!newUser) {
            return res
            .status(400)
            .json({message : "user not registered"});
        }

        const safeUser = await userModel.findById(newUser._id).select("-password -verificationToken -refreshToken");
        // const { Password, verificationToken, refreshToken, ...safeUser } = newUser._doc;
        console.log("data getting successfully---->", safeUser);  //--test line

        return res
            .status(200)
            .json({
                message : "user registered successfully",
                safeUser
            });

    } catch (error) {
        console.log("MongoDB Error:",error);
            return res
            .status(400)
            .json({
                message : "user not registered",
                error: error.message || error,
            });
    }
}


const updateProfile = async function (req, res) {
    // const {userId} = req.user._id;---------------------------------------------->explore this line
    const {userName} = req.body;
    const userId = req.user._id;

    // console.log("req.user---->", req.user); //----------test line
    // console.log("userName---->", userName, "userId------>", userId); //----------test line


    if (!userName || !userId) {
        return res.status(400).json({message : "userName userId fields are required"});
    }
    
    try {
/*      const existedUser = await userModel.findById({_id : userId});
        if(!existedUser){
            return res.status(400).json({messsage : "user not found"});
        }
*/
        const existedUser = await userModel.findByIdAndUpdate(
            {_id : userId},
            {userName},
            {new : true}
        )
        // console.log("Existed user---->", existedUser); //----------test line
    
        await existedUser.save();

        const updatedUser = await userModel.findById(existedUser._id).select("-password -verificationToken -refreshToken");
        
        return res
        .status(200)
        .json({
            message : "User updated successfully",
            updatedUser
        })

    } catch (error) {
        console.log("Error ---->", error);
        return res
        .status(400)
        .json({
            message : "User not updated successfully",
            error : error
        })        
    }

}


const creationOfTokens = async function (user) {
    const accessToken = await user.createAccessToken({_id : user._id, email : user.email});
    const refreshToken = await user.createRefreshToken({_id : user._id, email : user.email});

    // await user.refreshToken = refreshToken;

    return {accessToken, refreshToken};
}

const refreshTheAccessToken = async function () {
    /*
     get the token refresh token
     get the User by that token 
     match both tokens
     if matched then create new tokens (restart)
     and set them at their places
    */

    const decodedRefreshToken = req?.cookies?.refreshToken;
    const decoded = jwt.verify(decodedRefreshToken, process.env.JWT_REFRESHTOKEN_SECRET);

    try {
        const existedUser = await userModel.findById(decoded._id).select("-password -verificationToken");
    
        if(existedUser.refreshToken !== decodedRefreshToken){
            return res.status(400).json({messsage : "tokens are not matched"});
        }
    
        const {accessToken, refreshToken} = await creationOfTokens(existedUser);
    
        existedUser.refreshToken = refreshToken;
        await existedUser.save();
    
    
        const cookieOptions = {
                HttpOnly : true,
                Secure : true,
                // SameSite : Strict,
                maxAge : 24*60*60*1000
            }
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json({
            message : "AccessToken successfully refreshed",
        })

    } catch (error) {
        console.log("MongoDB Error", error);
        return res
        .status(400)
        .json({
            message : "AccessToken not successfully refreshed",
            error : error.message || error,
        })
    }
}

const login = async function (req, res) {
    const {email, password} = req.body;
    if (!email || !password) {
        return res
        .status(400)
        .json({message : "all fields are required"});
    }

    try {
        const existingUser = await userModel.findOne({email});
        if (!existingUser) {
            return res
            .status(400)
            .json({message : "user are not exist"});
        }

        const isMatched = await existingUser.comparePassword(password);
        if (!isMatched) {
            return res
            .status(400)
            .json({message : "your email or password is not valid"});
        }
        // const accessToken = await existingUser.createAccessToken({id : existingUser._id, email : existingUser.email});
        // const refreshToken = await existingUser.createRefreshToken({id : existingUser._id, email : existingUser.email});
        const {accessToken, refreshToken} = await creationOfTokens(existingUser);

        const safeUser = await userModel.findById(existingUser._id).select("-password -verificationToken -refreshToken");

        existingUser.refreshToken = refreshToken; 
        await existingUser.save();

        const cookieOptions = {
            HttpOnly : true,
            Secure : true,
            // SameSite : Strict,
            maxAge : 24*60*60*1000
        }
        return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        // .cookie("refreshToken", refreshToken, cookieOptions)
        .json({
            message : "you are logged in successfully",
            safeUser,
        })

    } catch (error) {
        console.log("MongoDB Error", error);
        return res
        .status(400)
        .json({
            message : "you are failed to login",
            error : error.message || error,
        })
    }

}


const logOut = async function (req, res) {
    const userId = req.user;

    try {
        const logedInUser = await userModel.findById(userId._id);
        logedInUser.refreshToken = "";
        await logedInUser.save();
    
        const cookieOptions = {
                HttpOnly : true,
                Secure : true,
                // SameSite : Strict,
                maxAge : 24*60*60*1000
            }

        console.log("user logged out-->",logedInUser);
        return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json({
                message : "you are logged Out successfully",
            })
    } catch (error) {
        console.log("MongoDB Error", error);
        return res
        .status(400)
        .json({
            message : "you are failed to logOut",
            error : error.message || error,
        })
    }

}

const resetPassword = async function(req, res){}

export {
    register,
    updateProfile,
    login,
    logOut,
    resetPassword,
}