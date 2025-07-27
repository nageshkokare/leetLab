import { json } from "express";
import problemModel from "../models/problem.model.js";
import {
    getJudge0LanguageId,
    submitBatch,
    sleep,
    pollBatchResults 
} from "../utils/otherFunctionality.util.js";




const createProblem = async function (req, res) {
    const {title,
        description,
        testCases,
        tags,
        codesnippets,
        sollutionCode,
        serial_no,
        difficulty,
        examples} = req.body;
    if (!title || !description || !testCases || !sollutionCode || !serial_no || !difficulty || !examples) {
        return res.status(400).json({message : "all fields are required"});
    }
    // console.log("title--->",title,
    //     "description--->",description,
    //     "testCases--->",testCases,
    //     "tags--->",tags,
    //     "serial_no--->",serial_no,
    //     "difficulty--->",difficulty,
    //     "examples--->",examples
    // ); //------------------------------------------> TEST LINE1
    console.log("sollutionCode--->",sollutionCode); //-----------> TEST LINE2

    try {
        const existedProblem = await problemModel.findOne({title});
        if (existedProblem) {
            return res.status(400).json({message : "this problem is already exist"});
        }

        // check your problem is valid or not
        for (const [language, answerCode] of Object.entries(sollutionCode)) {
            const languageId = getJudge0LanguageId(language);
            if (!languageId) {
                return res
                    .status(400)
                    .json({ error: `Unsupported language: ${language}` });
            }

            const submissions = testCases.map(({input, output})=>{
                return {
                    stdin: typeof input === "string" ? input : JSON.stringify(input),
                    expected_output: typeof output === "string" ? output : JSON.stringify(output),
                    language_id : languageId,
                    source_code : answerCode,
                }
            })
            console.log("submissions:", submissions);

            const submissionResults= await submitBatch(submissions);
            console.log("getted result from submitBatch function--->", submissionResults); // TEST LINE
            const tokens = submissionResults.map((res)=> {
                return res.token;
            })

            console.log("EXTRACTED TOKEN",tokens); //-------------- TEST LINE
            const results = await pollBatchResults(tokens);


            for (let i=0; i<results.length; i++) {
                const result = results[i];
                if (result.status.id !== 3){
                    return res.status(400)
                    .json({
                        message : `Validation failed for ${language} on input: ${submissions[i].stdin}`,
                        details : result,
                    })
                }
            }
            
        }
    
        const newProblem = await problemModel.create({
            title,
            description,
            testCases,
            tags,
            codesnippets,
            sollutionCode,
            serial_no,
            difficulty,
            examples,
            createdBy : req.user._id,
        });
        
        if (!newProblem) {
            return res.status(500).json({message : "problem not created"})
        }
    
        return res.status(200).json({
            message : "problem created successfully",
            success : true,
            newProblem});
    } catch (error) { 
        console.log("MongoDB Error --->", error);
        console.error("📌 Error details:", error.code, error.keyValue, error.message);

        console.error("📌 Axios Error Details:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });

        return res
        .status(400)
        .json({
            message : "user not created please check your code",
            error : error.message || error,
            keyValue: error.keyValue ,

            message: "Validation or judge0 batch failed",
            status: error.response?.status,
            details: error.response?.data
        })
    }
}


const updateProblem = async function (req, res) {
    const {title, description, codesnippets, testCases, sollutionCode, tags, difficulty, examples, constraints, hints, editorial} = req.body;
    const {problemId} = req.params;
    
    
    try {
        sollutionCode.entries(([language, answerCode])=>{  
            const languageId = getJudge0LanguageId(language);
    
            const newTestCases = testCases.map(({input, output})=>{
                return {
                    stdIn : typeof input === "string" ? input : JSON.stringify(input),
                    expected_out : typeof output === "string" ? output : json.stringify(output),
                    languageId : languageId,
                    source_code : answerCode,
                }
            })
            
            const submissionResult =  submitBatch(newTestCases);
            
            const tokens = submissionResult.map((res)=>{
                return res.token;
            }) 
            
            const results = pollBatchResults(tokens);
            
            for(let i=0; i<results.length; i++){
                const result = results[i]; 
                
                if(result.status.id !== 3){
                    return res
                    .status(400)
                    .json({
                        message : "problem not update successfully"
                    })
                }
            }
            
        }) //-------------------===============

        const updatedProblem = await problemModel.findByIdAndUpdate(
            {_id : problemId},
            {title, description, codesnippets, testCases, sollutionCode, tags, difficulty, examples, constraints, hints, editorial},
            {new : true}
        );

        return res
        .status(200)
        .json({
            message : "problem updated successfully",
            updatedProblem,
        })
        
    } catch (error) {
        console.log("Error------->", error);
        return res
        .status(400)
        .json({
            message : "problem not updated successfully",
            error : error,
        })
    }
};


const deleteProblem = async function (req, res) {
    console.log("query object ------->", req.query,  "requested user Id ------->",req.user._id); //----------->TEST LINE
    const {problemId} = req.query;

    if(!problemId){
        return res.status(400).json({message : "problemId must be required"});
    }

    try {
        const deletedProblem = await problemModel.findOneAndDelete({
            $and : [
                {_id : problemId}, 
                {createdBy : req.user._id}
            ]
        });
    
        if(!deletedProblem){
            return res.status(400).json({message : "problem not deleted successfully"});
        }
        console.log("reach here ------ line no. 215");

        return res
        .status(200)
        .json({
            message : " problem deleted successfully",
            deletedProblem,
        })

    } catch (error) {
        console.log("Error----->", error);
        return res
        .status(400)
        .json({
            message : " problem not deleted successfully",
            error : error,
        })
    }

};


const getProblemById = async function (req, res) {
        const {problemId} = req.query;

    if(!problemId){
        return res.status(400).json({message : "problemId must be required"});
    }

    try {
        const existedProblem = await problemModel.findById({_id : problemId});
    
        if(!existedProblem){
            return res.status(400).json({message : "problem not found"});
        }
    
        return res
        .status(200)
        .json({
            message : " problem delivered successfully",
            existedProblem,
        })

    } catch (error) {
        console.log("Error----->", error);
        return res
        .status(400)
        .json({
            message : " problem not found successfully",
            error : error,
        })
    }
};


const getAllProblems = async function (req, res) {
    const userId = req.user._id;

    try {
        const allProblems = await problemModel.find({createdBy : userId});
    
        if(!allProblems){
            return res.status(400).json({message : "problems are not found"});
        }
        console.log("ALL PROBLEMS ------------------------------->", allProblems);
    
        return res
        .status(200)
        .json({
            message : "problems are delivered successfully",
            allProblems,
        });
    } catch (error) {
        console.log("Error--->", error);
        return res
        .status(400)
        .json({
            message : "problems are not found",
            error : error,
        });
    }
};



export{
    createProblem,
    updateProblem,
    deleteProblem,
    getProblemById,
    getAllProblems,
}













// --------------------------
/*

{
    "title" : "Target Sum",
    "description" : "The Two Sum problem asks: given an integer array nums and a target value, find the indices of two numbers in nums that add up exactly to the target. You can assume exactly one solution exists, and each element can be used only once—so return the pair of indices.",
    "serial_no" : 1,
    "difficulty" : "EASY",
    "codesnippets" : ,
    "testCases" : ,
    "sollutionCode" : ,
    "tags" : ,
    "examples" : ,

}

*/


    //---------------==========

/*
            [
  {
    "input": { "nums": [2, 7, 11, 15], "target": 9 },
    "output": [0, 1],
    "explanation": "nums[0] + nums[1] equals 2 + 7 = 9, so the function returns [0, 1], which are their indices."
  },
  {
    "input": { "nums": [3, 2, 4], "target": 6 },
    "output": [1, 2],
    "explanation": "Here nums[1] + nums[2] equals 2 + 4 = 6, matching the target, so the output is [1, 2]."
  },
  {
    "input": { "nums": [3, 3], "target": 6 },
    "output": [0, 1],
    "explanation": "Since nums[0] + nums[1] equals 3 + 3 = 6, the two identical values sum to the target and return indices [0, 1]."
  }
]

*/













// tu free zalayavr jaganya ch mn jr asal tr msg kr 

