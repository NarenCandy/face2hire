import { chatClient, streamClient } from "../lib/stream.js";
import Session from "../models/Session.js";

/* ================= CREATE SESSION ================= */
export async function createSession(req, res) {
  try {
    const { problem, difficulty } = req.body;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    if (!problem || !difficulty) {
      return res.status(400).json({ msg: "Please provide all required fields" });
    }

    const callId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}`;

    const session = await Session.create({
      problem,
      difficulty,
      host: userId,
      callId,
      status: "active", // ✅ IMPORTANT FIX
    });

    // Create Stream video call
    await streamClient.video.call("default", callId).getOrCreate({
      data: {
        created_by_id: clerkId,
        custom: {
          problem,
          difficulty,
          sessionId: session._id.toString(),
        },
      },
    });

    // Create Stream chat channel
    const channel = chatClient.channel("messaging", callId, {
      name: `${problem} Session`,
      created_by_id: clerkId,
      members: [clerkId],
    });
    await channel.create();

    res.status(201).json({ session });
  } catch (error) {
    console.error("Error creating session:", error.message);
    res.status(500).json({ message: "Server error" });
  }
}

/* ================= GET ACTIVE SESSIONS ================= */
export async function getActiveSessions(_, res) {
  try {
    const sessions = await Session.find({ status: "active" })
      .populate("host", "name profileImage email clerkId")
      .populate("participant", "name profileImage email clerkId")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.log("Error getActiveSessions:", error.message);
    res.status(500).json({ message: "Server error" });
  }
}

/* ================= GET MY RECENT SESSIONS ================= */
export async function getMyRecentSessions(req, res) {
  try {
    const userId = req.user._id;

    const sessions = await Session.find({
      status: "completed",
      $or: [{ host: userId }, { participant: userId }],
    })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.log("Error getMyRecentSessions:", error.message);
    res.status(500).json({ message: "Server error" });
  }
}

/* ================= GET SESSION BY ID ================= */
export async function getSessionById(req, res) {
  try {
    const { id } = req.params;

    const session = await Session.findById(id)
      .populate("host", "name profileImage email clerkId")
      .populate("participant", "name profileImage email clerkId");

    if (!session) {
      return res.status(404).json({ msg: "Session not found" });
    }

    res.status(200).json({ session });
  } catch (error) {
    console.log("Error getSessionById:", error.message);
    res.status(500).json({ message: "Server error" });
  }
}

/* ================= JOIN SESSION ================= */
export async function joinSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ msg: "Session not found" });
    }

    if (session.status !== "active") {
      return res
        .status(400)
        .json({ msg: "Cannot join a completed session" });
    }

    if (session.host.toString() === userId.toString()) {
      return res
        .status(400)
        .json({ msg: "Host cannot join as participant" });
    }

    if (session.participant) {
      return res.status(409).json({ msg: "Session is already full" });
    }

    // Save participant
    session.participant = userId;
    await session.save();

    // ✅ ADD PARTICIPANT TO STREAM VIDEO CALL
    //const call = streamClient.video.call("default", session.callId);
    //await call.addMembers([{ user_id: clerkId }]);

    // Add to chat channel
    const channel = chatClient.channel("messaging", session.callId);
    await channel.addMembers([clerkId]);

    res.status(200).json({ session });
  } catch (error) {
    console.log("Error joinSession:", error.message);
    res.status(500).json({ message: "Server error" });
  }
}

/* ================= END SESSION ================= */
export async function endSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ msg: "Session not found" });
    }

    if (session.host.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ msg: "Only host can end the session" });
    }

    if (session.status === "completed") {
      return res
        .status(400)
        .json({ msg: "Session is already completed" });
    }

    // Delete Stream video call
    const call = streamClient.video.call("default", session.callId);
    await call.delete({ hard: true });

    // Delete chat channel
    const channel = chatClient.channel("messaging", session.callId);
    await channel.delete();

    session.status = "completed";
    await session.save();

    res
      .status(200)
      .json({ session, message: "Session ended successfully" });
  } catch (error) {
    console.log("Error endSession:", error.message);
    res.status(500).json({ message: "Server error" });
  }
}
