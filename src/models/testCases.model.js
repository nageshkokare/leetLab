import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema({
    submissionId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Submission"
    },
    testCase_no : {
        type : Number,
        required : true,
    },
    testCase : {
        type : Object,
        required : true,
    },
    output : {
        type : String,
        required : true,
    },
    stderr : {
        type : String,
    },
    status : {
        type : String, // -------> "Accepted" , "Wrong Answer" , "Runtime Error" , "Compilation Error"
        required : true,
    },
    passed : {
        type : Boolean,
        required : true,
    },
    memory : {
        type : String,
        required : true,
    },
    executionTime : {
        type : String,
        required : true,
    },
}, {timestamps : true});


const testCase = mongoose.model("testCase", testCaseSchema);
export default testCase;






/*
  expectedOutput : {
        type : String,
        required : true,
    },

   testCase : {
        type : Number,
        required : true,
    }, 
 */