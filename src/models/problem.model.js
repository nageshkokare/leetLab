import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
    title : {
        type : String,
        unique : true,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    codesnippets : {
        type : {},
        required : true
    },
    testCases : {
        type : [{}],
        required : true
    },
    sollutionCode : {
        type : Object,
        required : true
    },
    tags : {
        type : Array,
    },
    serial_no : {
        type : Number,
        unique : true,
        required : true
    },
    difficulty : {
        type : String,
        required : true
    },
    examples : {
        type : [{}],
        required : true
    },
    createdBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    constraints : {
        type : Array,
    },
    hints : {
        type : Array,
    },
    editorial : {
        type : String,
    },
},{timestamps : true});

const Problem = mongoose.model("Problem", problemSchema);

export default Problem;


