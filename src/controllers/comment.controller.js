import commentModel from "../models/comment.model.js";

const createComment = async function(req, res){
    const {problemId, content, parentId} = req.query;
    const userId = req.user;
    if(!problemId || !content || !userId){
        return res.status(400).json({ message : "all fields are required"});
    }
    
    try {
        const newCommment = await commentModel.create({
            content,
            createdBy,
            problem : problemId,
            parentComment : parentId,
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
    const problemId = req.query;
    const parentId = req.query.parentId || null;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortQuery = req.query.sortQuery || "latest";

    if(!problemId || !page){
        return res.status(400).json({
            message : "all fields are required",
        })
    }

    const skip = (page-1)*limit;

    const total = await commentModel.countDocuments({problem : problemId, parentComment : parentId});

    const comments = await commentModel.find({problem : problemId, parentComment : parentId})
    .skip(skip)
    .limit(limit)
    .sort({createdAt : sortQuery === "oldest" ? 1 :-1})
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






//  show the reaplys





export {
    createComment,
    showTheCommments,
}