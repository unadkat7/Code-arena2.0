import express from "express";
import { ENV } from "../lib/env.js  ";
import path from "path";
import { connectDB } from "../lib/db.js";

const app = express();

const __dirname = path.resolve();

app.get("/health",(req,res)=>{
    res.status(200).json({msg:"api is up and running"})
})  

app.get("/books",(req,res)=>{
    res.status(200).json({msg:"books"})
}) 

if(ENV.NODE_ENV==="production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")))
    app.get("/{*any}",(req,res)=>{
        res.sendFile(path.join(__dirname,"../frontend","dist","index.html"));
    })
}

 

const startServer = async () =>{
    try {
        await connectDB();
        app.listen(ENV.PORT,()=>{
        console.log("🚀 Server stared on port: ",ENV.PORT);
})
    } catch (error) {
        console.error("💥 Error in connecting server");
    }
}

startServer();