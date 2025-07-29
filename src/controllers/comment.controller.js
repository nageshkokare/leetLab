import commentModel from "../models/comment.model.js";

const createComment = async function(req, res){
    // console.log("createComment start to run");                          //---------------TEST LINE

    const {problemId, parentCommentId} = req.query;
    const {content} = req.body;
    const userId = req.user._id;
    // console.log(userId ? "finnaly its getting " : "its not getting"); //---------------TEST LINE
    // console.log(userId);                                                 //---------------TEST LINE

    if(!problemId || !content || !userId){
        return res.status(400).json({ message : "all fields are required"});
    }
    
    try {
        const newCommment = await commentModel.create({
            content,
            createdBy : userId,
            problem : problemId,
            parentComment : parentCommentId,
        })
    
        if(!newCommment){
            return res.status(400).json({ message : "comment not created"});
        }
    
        return res.status(201).json({
            message : "comment created successfully",
            newCommment,
        })
    } catch (error) {
        console.log(error);
        return res.status(400)
        .json({
            message : "comment not created",
            error : error.message,
        })
    }

}


//  show the commments 
const showTheCommments = async function(req, res){
    const problemId = req.query.problemId;
    const parentCommentId = req.query.parentCommentId || null;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortQuery = req.query.sortQuery || "latest";

    if(!problemId || !page){
        return res.status(400).json({
            message : "all fields are required",
        })
    }

    const skip = (page-1)*limit;

    const total = await commentModel.countDocuments({problem : problemId, parentComment : parentCommentId}).lean();

    const comments = await commentModel.find({problem : problemId, parentComment : parentCommentId})
    .sort({createdAt : sortQuery === "oldest" ? 1 :-1})
    .skip(skip)
    .limit(limit)
    console.log(comments.length);//--------------TEST LINE

    if(!comments){
        return res.status(404).json({
            message : "comments not found",
        })
    }

    return res.status(200)
    .json({
        message : "comments fetched  successfully",
        total,
        currentPage : page,
        totalPages : Math.ceil(total/limit),
        comments
    })


}

const deleteComment = async function (req, res){

}


const updateComment = async function (req, res){
    // update the only upvotes and downvotes
}



//  show the reaplys





export {
    createComment,
    showTheCommments,
}