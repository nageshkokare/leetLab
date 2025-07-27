import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true,
    },
    problemId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Problem",
        required : true,
    },
    sollutionCode : {
        type : String,
        required :true,
    },
    language : {
        type : String,
        required :true,
    },
    testCases : {
        type : [{}],
        required :true,
    },
    status : {
        type : String,
        required :true,
    },
    stderr : {
        type : [{}],
    },
    compileoutput : {
        type : [{}],
        required :true,
    },
    executionTime : {
        type :Number,
        required : true,
    },
    memory : {
        type: Number, //  1---memory: 1234 (in KB)  2---memory: 12.5 (in MB — if you're using float)
        required: true,
    },

}, {timestamps : true})

const Submission = mongoose.model("Submission", submissionSchema);
export default Submission;
