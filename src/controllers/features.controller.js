import mongoose from "mongoose";
import problemModel from "../models/problem.model.js";




const searchingByPegination = async function (req, res){
    const {searchQuery, difficultyQuery, tagQuery, page, limit, sortQuery} = req.query;
    const no_page = parseInt(req.query.page) || 1;
    const no_limit = parseInt(req.query.limit) || 10;

    const skip = (no_page - 1) * no_limit;

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
        .limit(no_limit)
        .sort({createdAt : -1});

    return res.status(200)
        .json({
            total,
            currentPage : no_page,
            totalPages: Math.ceil(total / no_limit),
            results,
        });
}


export{
    searchingByPegination,
}