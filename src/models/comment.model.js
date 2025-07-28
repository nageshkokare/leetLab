import mongoose from "mongoose";

const commmentSchema = new mongoose.Schema({
    content : {
        type : Text,
        required : true,
    },
    createdBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true,
    },
    problem : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Problem",
        required : true,
    },
    parentComment : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Comment",
        default : null,
    },
});

const Comment = mongoose.model("Comment", commmentSchema);

export default Comment;