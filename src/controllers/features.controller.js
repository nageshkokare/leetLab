import mongoose from "mongoose";
import problemModel from "../models/problem.model.js";




const searchingByPegination = async function (req, res){
    const {searchQuery, difficultyQuery, tagQuery, page, limit, sortQuery} = req.query;

    const skip = (page - 1) * limit;

    const filter = {};

    if(searchQuery){
        
        filter.$or = [
                { title : {$regex : searchQuery, $options : "i" }},
                   {tags: {$regex : searchQuery, $options : "i" }}
            ]
    }


    if (difficultyQuery) {
        filter.difficulty = difficultyQuery;
    }

    if (tagQuery) {
        filter.tags = {$regex : tagQuery, $options : "i"};
    }

    const total = await problemModel.countDocuments(filter);

    const results = await problemModel.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({createdAt : -1});

    return res.status(200)
        .json({
            total,
            currentPage : page,
            totalPages: Math.ceil(total / limit),
            results,
        });
}


export{
    searchingByPegination,
}