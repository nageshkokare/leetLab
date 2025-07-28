import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookie_parser from "cookie-parser";

// IMPORT FILES----->
import db_Connect from "./utils/db_Connect.util.js";
import authRouter from "./routs/auth.rout.js";
import problemRouter from "./routs/problem.rout.js";
import submissionRouter from "./routs/submission.rout.js";
import playlistRouter from "./routs/playlist.rout.js";


const app = express();
dotenv.config({path : "./.env"});

const port = process.env.PORT || 4000;


//-----------CORS
app.use(cors({
  origin: "http://localhost:4000", // Sirf yeh origin allow hoga
  methods: ["GET", "POST", "PUT", "DELETE"],  // Sirf inhi methods ki permission
  allowedHeaders: ["Content-Type", "Authorization"], // Sirf inhi headers ki permission
  credentials: true // Agar cookies ya authentication headers use ho rahe hain
}));


//-----------DATA EXCEPTING DECLAIRATION
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookie_parser());


//----------- DB CONNECTION
db_Connect();

//----------- TEST ROUTS
app.get("/", (req, res)=>{
    res.send("nagesh");
})


//----------- ORIGINAL ROUTS
app.use("/api/v1/Auth", authRouter);
app.use("/api/v1/Problem", problemRouter);
app.use("/api/v1/Submission", submissionRouter);
app.use("/api/v1/Playlist", playlistRouter);

//-----------APP IS LISTENING ON PORT
app.listen(port, ()=>{
    console.log(`app is listening on port ${port}`);
})



//  git config --global user.email "nageshkokare8767@gmail.com"