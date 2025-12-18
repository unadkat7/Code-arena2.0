import { chatClient } from "../lib/stream.js";

export async function getStreamToken(req,res){
    try {
        //use clerkId for stream not (mongodb _id)=> it should match the id in stream dashboard
        const token =  chatClient.createToken(req.user.clerkId)

        res.status(200).json({
            token,
            userId: req.user.clerkId,
            userName: req.user.name,
            userImage: req.user.image
        })
    } catch (error) {
        console.log("Error in genrating stream token in chatController");
        res.status(500).json({msg:"Internal server error"})
    }
}