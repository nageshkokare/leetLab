import playlistModel from "../models/playlist.model.js"
import problemModel from "../models/problem.model.js";


const createPlaylist = async function(req, res){
    const existedUser = req.user._id;
    const {title, problems, type} = req.body;
    if(!title || !problems || !type){
        return res.status(400).json({message : "all fields are required"});
    }
    
    try {
        // const existedProblems = problems.map((problemId)=> problemModel.findById(problemId).select("-codesnippets -testCases -sollutionCode -examples -createdBy -constraints -hints -editorial"));
        /**
         * 
        // const getProbmems = function(){
            let existedProblems = [];
            for (let i = 0; i < problems.length; i++) {
                const temp = await problemModel.findById(problems[i]).select("-codesnippets -testCases -sollutionCode -examples -createdBy -constraints -hints -editorial");
                existedProblems[i] = temp;
            }
            // }
        */

        const existedProblems = await Promise.all(
            problems.map((id) =>
                problemModel.findById(id).select("-codesnippets -testCases -sollutionCode -examples -createdBy -constraints -hints -editorial")
            )
        );  
        if (existedProblems.includes(null)) {
            return res.status(404).json({ message: "One or more problems not found" });
        }

        const newPlaylist =  await playlistModel.create({
            title,
            problems : existedProblems,
            createdBy : existedUser,
            type
        })
    
        if(!newPlaylist){
            return res.status(500).json({message : "playlist is not created"});
        }
    
        return res
        .status(201)
        .json({
            message : "playlist is created successfully",
            newPlaylist,
        })
    } catch (error) {
        console.log("Error ---->", error);
        return res
        .status(400)
        .json({
            message : "playlist is not created",
            error : error,
        })
    }
}


const deletePlaylist = async function(req, res){

    const {playlistId} = req.query;

    if(!playlistId){
        res.status(400).json({message : "playlistId must be required"})
    }

    try {
        const deletedPlaylist = await playlistModel.findByIdAndDelete({_id : playlistId});
    
        if(!deletedPlaylist){
            res.status(400).json({message : "playlist not deleted successfully"})
        }
    
        return res
        .status(200)
        .json({
            message : "playlist deleted successfully",
            deletedPlaylist,
        })
    
    } catch (error) {
        console.log("Error---->",error);
        return res
        .status(400)
        .json({
            message : "playlist not deleted successfully",
            error : error,
        })
    }
}


const getAllPlaylists = async function(req, res){
    const user = req.user;

    try {
        const allPlaylists = await playlistModel.find({ createdBy: user._id });
        if(!allPlaylists){
            return res.status(400).json({message : "playlists are not found"});
        }
    
        return res 
        .status(200)
        .json({
            message : "playlists are delivered successfully",
            allPlaylists,
        })
    } catch (error) {
        console.log("Error----->", error);
        return res
        .status(400)
        .json({
            message : "playlists are not found",
            error : error
        })
    }
}


const getSinglePlaylist = async function(req, res){
    // console.log("query Object ------->",req.query); //-------TEST LINE
    const {playlistId }= req.query;

    // console.log("Type Of playlistId ------->", typeof playlistId); //-------TEST LINE

    if(!playlistId){
        return res.status(400).json({message : "playlistId must be required"});
    }
    
    try {
        const existedPlaylist = await playlistModel.findById(playlistId);
        if(!existedPlaylist){
            return res.status(400).json({message : "playlist not found"});
        }
    
        return res
        .status(200)
        .json({
            message : "playlist delivered successfully",
            existedPlaylist,
        })
    
    } catch (error) {
        console.log("Error----->", error);
        return res
        .status(400)
        .json({
            message : "playlist not found",
            error :error,
        })
    }
}



const addProblem = async function(req, res){
    const {problemId, playlistId} = req.query;
    if(!problemId || !playlistId){
        return res.status(400).json({message : "problemId and playlistId are must be required"});
    }
    try {
    
        const existedProblem = await problemModel.findById(problemId).select("-codesnippets -testCases -sollutionCode -examples -createdBy -constraints -hints -editorial");
        const existedPlaylist = await playlistModel.findById(playlistId);
        // ----add validation here

        const alreadyAdded = existedPlaylist.problems.some((prob) => prob._id.equals(problemId));
        if (alreadyAdded) {
            return res.status(400).json({ message: "Problem already exists in playlist" });
        }

        existedPlaylist.problems.push(existedProblem);
        await existedPlaylist.save();
        
        return res
        .status(200)
        .json({
            message : "problem added successfully",
            existedPlaylist,
        })
    } catch (error) {
        console.log("Error----->", error);
        return res
        .status(400)
        .json({
            message : "problem not added successfully",
            error : error
        })
    }
}


const removeProblem = async function(req, res){

    const {problemId, playlistId} = req.query;
    if (!problemId || !playlistId) {
        return res.status(400).json({ message: "problemId and playlistId are required" });
    }

    try {
        const existedPlaylist = await playlistModel.findById({_id : playlistId});
        for (const problem of existedPlaylist.problems) {   
            console.log("----------problemTitle------ ",problem.title); //------------TEST LINE
        }



        if (!existedPlaylist) {
            return res.status(400).json({message : "playlistId is required"});
        }
    /*
        let removedProblem;
        for (let i = 0; i<existedPlaylist.problems.length; i++) {
            const problem = existedPlaylist.problems[i];
            // console.log("----------------enter in loop", "--------------------", problem); //------------TEST LINE

            if( problem._id.equals(problemId)){
                removedProblem = existedPlaylist.problems.splice(i, 1);
                console.log("removedProblem-------------->", removedProblem);
                break;
            }

        }
*/      
        const originalLength = existedPlaylist.problems.length;
        existedPlaylist.problems = existedPlaylist.problems.filter((prob)=>{
            return !prob._id.equals(problemId);
        });
        if(originalLength===existedPlaylist.problems.length){
            return res.status(404).json({message : "Problem not found in playlist"})
        }
        
        console.log("----------------it's Run"); //------------TEST LINE
        await existedPlaylist.save();
        console.log("----------------it's Run"); //------------TEST LINE


        return res
        .status(200)
        .json({
            message : "problem removed successfully",
            existedPlaylist,
            // removedProblem : removedProblem,
        })

    } catch (error) {
        console.log("Error----->", error);
        return res
        .status(400)
        .json({
            message : "problem not removed successfully",
            error : error
        })
    }
    
}


const getTheAllProblemsFromPlaylist = async function (req, res){
    // implement this feature by pegination 
} 


//----------- implement the feature which make the change in "Bounch" 
const problemsAddInList = async function (req, res){
    const {listOfProblems, playlistId} = req.params;
    if(!listOfProblems || !playlistId){
        return res.status(400).json({message : "problems Ids and playlist Id are must be required"});
    }

    try {

        const existedPlaylist = await playlistModel.findById({_id : playlistId});

        for(let i = 0; i < listOfProblems.length; i++){
            const problemId = listOfProblems[i];

            const existedProblem = await problemModel.findById(problemId).select("-codesnippets -testCases -sollutionCode -examples -hints -editorial");

            existedPlaylist.problems.push(existedProblem);

        }
        
        await existedPlaylist.save();

        return res
        .status(200)
        .json({
            message : "problems are added successfully",
            existedPlaylist,
        })

    } catch (error) {
        console.log("Error----->", error);
        return res
        .status(400)
        .json({
            message : "problems are not added successfully",
            error : error
        })
    }




}


const problemsRemoveInList = async function (req, res){
    const {listOfProblems, playlistId} = req.params;
    if(!listOfProblems || !playlistId){
        return res.status(400).json({message : "problems Ids and playlist Id are must be required"});
    }

    try {
        const existedPlaylist = await playlistModel.findById({_id : playlistId});

        for(let i = 0; i < listOfProblems.length; i++){

            const problemId = listOfProblems[i];
    
            for (let k = 0; k<existedPlaylist.problems.length; k++) {
                const problem = existedPlaylist.problems[k];
                if( problem._id === problemId){
                    existedPlaylist.problems.splice(k, 1);
                    return;
                }
            }

        }    

        await existedPlaylist.save();

        return res
            .status(200)
            .json({
                message : "problems are removed successfully",
                existedPlaylist,
            })

    } catch (error) {
        console.log("Error----->", error);
        return res
        .status(400)
        .json({
            message : "problems are not removed successfully",
            error : error
        })
    }
 
}

// async function practice (req, res){
//     const playlist = await playlistModel.findById("68836af84168d991e8cb09b7");
//     console.log(playlist.problems._id);
// }
// practice();




export {
    createPlaylist,
    deletePlaylist,
    getAllPlaylists,
    getSinglePlaylist,
    addProblem,
    removeProblem,
    problemsAddInList,
    problemsRemoveInList,
}


