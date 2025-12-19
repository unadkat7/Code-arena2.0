import Session from "../models/Session.model.js";
import { chatClient, streamClient } from "../lib/stream.js"

export async function createSession(req,res) {
    try {
        const {problem,difficulty} = req.body
        const userId = req.user._id;
        const clerkId = req.user.clerkId;
    
        if(!problem || difficulty){
            return res.status(400).json({message:"Problem and difficulty are required!"});
        }
    
        //Generate a unique call id for stream video
        const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`
    
        //Create a session in db
        const session = await Session.create({
            problem,
            difficulty,
            host:userId,
            callId
        })
    
        //Create stream video call
        await streamClient.video.call("default",callId).getOrCreate({
            data:{
                created_by_id:clerkId,
                custom: {problem,difficulty,sessionId:session._id.toString()},
            }
        });
    
        //Chat messaging
        const channel = chatClient.channel("messaging",callId,{
            name: `${problem} Session`,
            created_by_id: clerkId,
            members:[clerkId]
        })
    
        await channel.create()

        res.status(201).json({session:session})
    } catch (error) {
        console.log("Error in create session controller");
        res.status(500).json({message:"Internal server error"})
    }
}

export async function getActiveSessions(_,res) {
    try {
        const sessions = await Session.find({status:"active"})
        .populate("host","name profileImage email clerkId")
        .sort({createdAt:-1})
        .limit(20);

        res.status(200).json({sessions})
    } catch (error) {
        console.log("Error in getActiveSessisons controller:");
        res.status(500).json({message:"Internal server error"});
    }
}

export async function getMyRecentSessions(req,res) {
    try {
        const userId = req.user._id;
    
        //Get session where user is either host or participant
        const sessions = await Session.find({
            status:"completed",
            $or:[{host:userId},{participant:userId}],
        }) 
    
        .sort({createdAt:-1})
        .limit(20);
    
        res.status(200).json({sessions});
    } catch (error) {
        console.log("Error in getMyRecentSessions controller");
        res.status(500).json({message:"Internal Server error"});
    }
}

export async function getSessionById(req,res) {
    try {
        const {id} = req.params
    
        const session = await Session.findById(id)
        .populate("host","name email profileImage clerkId")
        .populate("participant","name email profileImage clerkId")
    
        if(!session) return res.status(404).json({message:"Session not found"})
        
        res.status(200).json({session});
    } catch (error) {
        console.log("Error in getSessionById controller ");
        res.status(500).json({message:"Internal server error!"})
    }
}

export async function joinSession(req,res) {
    try {
        const {id} = req.params
        const userId = req.user._id;
        const clerkId = req.user.clerkId;
    
        const session = await Session.findById(id)

        if(!session) return res.status(404).json({message:"Session not found"})

        if(session.status!=="active"){
            return res.status(400).json({message:"Cannot join a completed session!"})
        }

         if(session.host.toString() === userId.toString()){
            return res.status(400).json({message:"Host Cannot join thier own session!"})
        }


        if(session.participant) return res.status(404).json({message:"Session is full"});
        
        session.participant = userId
        await session.save()

        const channel = chatClient.channel("messaging",session.callId)
        await channel.addMembers([clerkId])
        
        res.status(200).json({session})
    } catch (error) {
        console.log("Error in joinSession controller ");
        res.status(500).json({message:"Internal server error!"})
    }
}

export async function endSession(req,res) {
    try {
        const {id} = req.params
        const userId = req.user._id;
    
        const session = await Session.findById(id)

        if(!session) return res.status(404).json({message:"Session not found"})

        //Check if user is host
        if(session.host.toString()!==userId.toString()){
            return res.status(403).json({message:"Only the host can end the session"})
        }

        //Check if session is already completed
        if(session.status==="completed"){
            return res.status(400).json({message:"Session is already completed"})
        }

        //Delete stream video call
        const call = streamClient.video.call("default",session.callId);
        await call.delete();

        //Delete stream chat channel
        const channel = chatClient.channel("messaging",session.callId);
        await channel.delete();

        session.status = "completed"
        session.save();

        res.status(200).json({message:"Session ended successfully!"})

    } catch (error) {
        onsole.log("Error in endSession controller ");
        res.status(500).json({message:"Internal server error!"})
    }
}
