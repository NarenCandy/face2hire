import { chatClient, streamClient } from "../lib/stream.js";
import Session from "../models/Session.js";

export async function createSession(req, res) { 
    try{
        const {problem, difficulty}=req.body;
        const userId=req.user._id;
        const clerkId=req.user.clerkId;
        if(!problem || !difficulty){
            return res.status(400).json({msg:"Please provide all required fields"});
        }

        const callId= `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const session = await Session.create({
            problem,
            difficulty,
            host:userId,callId

        });
        await streamClient.video.call("default", callId).getOrCreate({
            data:{
                created_by_id:clerkId,
                custom:{problem,difficulty,sessionId:session._id.toString()}
            }
        })

        //chat message
        chatClient.channel("messaging", callId,{
            name:`${problem} Session`,
            created_by_id:clerkId,
            members:[clerkId]
        })
        await channel.create();
        res.status(201).json({session} );
    }
    catch(error){
        console.error("Error creating session:", error.message);
        res.status(500).json({message:"Server error"});
    }
}


export async function getActiveSessions(_, res) { 
    try{
        const sessions=await Session.find({status:"active"})
        .populate("host","name profileImage email clerkId")
        .sort({createdAt:-1})
        .limit(20);

        res.status(200).json({sessions} );
    }
    catch(error){
        console.log("Error fetching active sessions:", error.message);
        res.status(500).json({message:"Server error" });
    }
}


export async function getMyRecentSessions(req, res) {
    try{
        const userId=req.user._id;

        const sessions=await Session.find({status:"completed", 
            $or:[{host:userId}, {participant:userId}],
        }).sort({createdAt:-1}).limit(20)
        res.status(200).json({sessions} );
        }

    
    catch(error){
        console.log("Error fetching getmyrecentsessions:", error.message);
        res.status(500).json({message:"Server error" });
    }
 }


export async function getSessionById(req, res) {
    try{
        const {id}= req.params;
        const session = await Session.findById(id)
        .populate("host","name profileImage email")
        .populate("participant","name profileImage email ");

        if(!session) return res.status(404).json({msg:"Session not found"});
        res.status(200).json({session});
    }
    catch(error){
        console.log("Error fetching session by id:", error.message);
        res.status(500).json({message:"Server error" });
    }
    
 }


export async function joinSession(req, res) { 
    try {
        const {id}= req.params;
        const userId=req.user._id;
        const clerkId=req.user.clerkId;
        const session= await Session.findById(id);
        if(!session) return res.status(404).json({msg:"Session not found"});

        //if session is full

        if(session.participant) return res.status(400).json({msg:"Session is already full"});
        session.participant=userId;
        await session.save();

        const channel = chatClient.channel("messaging", session.callId);
        await channel.addMembers([clerkId]);

        res.status(200).json({session} );
    } catch (error) {
        console.log("Error joining session:", error.message);
        res.status(500).json({message:"Server error" });
        
    }
    

}


export async function endSession(req, res) {
    try {
    const {id}= req.params;
    const userId=req.user._id;
    const session= await Session.findById(id);
    if(!session) return res.status(404).json({msg:"Session not found"});

    //only host can end the session
    if(session.host.toString()!==userId.toString()){
        return res.status(403).json({msg:"Only host can end the session"});
    }

    //check if session is already completed
    if(session.status==="completed"){
        return res.status(400).json({msg:"Session is already completed"});
    }

    session.status="completed";
    await session.save();
    //dlete stream video call
    const call= streamClient.video.call("default", session.callId);
    await call.delete();
    //delete chat channel
    const channel= chatClient.channel("messaging", session.callId);
    await channel.delete();

    res.status(200).json({session, message:"Session ended successfully"} );
    } catch (error) {
        console.log("Error ending session:", error.message);
        res.status(500).json({message:"Server error" });
        
    }
 }