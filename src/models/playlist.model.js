import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
    title : {
        type : String,
        unique : true,
        required : true,
    },
    problems : {
        type : [{}],
        required : true,
    },
    createdBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
    },
    type : {
        type : String,
        required : true,
    },
    counts : {
        type : Number,
    },
})

const Playlist = mongoose.model("Playlist", playlistSchema);

export default Playlist;


/*
{
"title" : "favorite",
"problems" : ["6881b0f738363c95b5f29518", "6881b5f538363c95b5f2951c", "6881c0d81a2f92a115e1f7cd", "6881c3ea5de47a4a53fed000"],
"type" : "binarySearch"
}
*/