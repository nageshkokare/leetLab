import submissionModel from "../models/submission.model.js"
import testCaseModel from "../models/testCases.model.js"
import {
    getJudge0LanguageId,
    submitBatch,
    sleep,
    pollBatchResults
} from "../utils/otherFunctionality.util.js"


const submission = async function (req, res){
    const {language, testCases, sollutionCode, problemId} = req.body;
    if(!language || !testCases || !sollutionCode){
        return res.status(400).json({message : "all fields are required"})
    }

    const languageId = getJudge0LanguageId(language);
    console.log("languageId--->",languageId);
    try {
        const newArrayForSubmission = testCases.map(({input, output})=>{
            return {
                stdin : typeof input === "string" ? input : JSON.stringify(input),
                expected_output : typeof output === "string" ? output : JSON.stringify(output),
                source_code : sollutionCode,
                language_id : languageId,
            }
        })
        console.log("one by one testCases--->", newArrayForSubmission);
        const tokens = await submitBatch(newArrayForSubmission);

        const extractedTokens = tokens.map((res)=>{
            return res.token;
        })
        console.log("Extracted Tokens ----->",extractedTokens);

        const results = await pollBatchResults(extractedTokens);
        console.log("result from pollBatchResult ---->", results);
        for(let i=0; i<results.length; i++){
            const result = results[i];
            if(result?.status.id !== 3){
                res
                .status(400)
                .json({
                        message : `Validation failed for ${language} on input: ${newArrayForSubmission[i].stdin}`,
                        details : result,
                    })
            }
        }

        const isAccepted =  results.every((testCase=>testCase.status.description === "Accepted"))
        const newSubmission = await submissionModel.create({
            userId : req.user._id,
            problemId,
            language,
            testCases,
            sollutionCode,
            status : isAccepted ? "Accepted" : "Rejected",
            stderr : results.map(r => r.stderr),
            compileoutput : results.map(r => r.compile_output),
            executionTime : results.reduce((totalTime, testCase)=>{ return totalTime + Number(testCase.time)}, 0),
            memory : results.reduce((totalMemory, testCase)=>{ return totalMemory + Number(testCase.memory)}, 0),
        })

        let track;
        const newTestCasesArray = results.map((testCase)=>{
            track===undefined ? track = 0 : track++
            console.log("track values----->", track); //-----TEST LINE
                return {
                    submissionId : newSubmission._id,
                    testCase_no : track + 1,
                    testCase : testCases[track],
                    output : testCase.stdout,
                    stderr : testCase.stderr,
                    status : testCase.status.description,
                    passed : testCase.status.description === "Accepted" ? true : false ,
                    memory : testCase.memory,
                    executionTime : testCase.time,
                }
            })

        const newTestCases = await testCaseModel.insertMany(newTestCasesArray);
        console.log("testCase Models--------->", newTestCases);

        return res
        .status(200)
        .json({
            message : "you are successfilly submitted your problem",
            newSubmission,
        })

    } catch (error) {
        console.log("MongoDB Error ---->",error);

        console.error("📌 Axios Error Details:", {
          message: error.message,
          status: error.response?.status, 
          data: error.response?.data,
          headers: error.response?.headers
        });
        return res.status(400)
        .json({
            message : "problem not submmited successfully",
            error : error.message || error,
            keyValue: error.keyValue ,

            message: "Validation or judge0 batch failed",
            status: error.response?.status,
            details: error.response?.data,
            
        })
    }

}


const removeSubmission = async function (req, res) {
    const submissionId = req.query.submissionId;
    if(!submissionId){
        return res.status(400).json({message : "submissionId is must"})
    }

    try {
        const deletedSubmission = await submissionModel.findByIdAndDelete(submissionId);
        if(!deletedSubmission){
            return res.status(400).json({message : "submission not deleted successfully", submissionId});
        }
    
        const deletedTestCases = await testCaseModel.deleteMany({submissionId : submissionId});
        if(!deletedTestCases){
            return res.status(400).json({message : "TestCases not deleted successfully"});
        }

        console.log("deletedTestCases------->", deletedTestCases);
        return res.status(200)
        .json({
            message: " submission and its testCases are deleted successfully",
            deletedSubmission,
            deletedTestCases
        })
    } catch (error) {
        console.log("Error---->", error);
        return res.status(400)
        .json({
            message: "given task is not Done",
            error : error
        })
    }
}


export {
    submission,
    removeSubmission,
}