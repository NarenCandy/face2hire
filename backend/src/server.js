

import express from "express";
import dotenv from "dotenv";
import path from "path";
import {ENV} from "./lib/env.js";
import {connectDB} from "./lib/db.js";
import cors from "cors";
import {serve} from "inngest/express";
import {inngest, functions} from "./lib/inngest.js";
import { fileURLToPath } from "url";
import { clerkMiddleware} from "@clerk/express";

import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";





const app =express();
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

//middleware
app.use(express.json());

//credentials means cookies
app.use(cors({origin:ENV.CLIENT_URL, credentials:true}));

app.use(clerkMiddleware());//clerk auth middleware

app.use("/api/inngest", serve({client:inngest, functions}))
app.use("/api/chat",chatRoutes);
app.use("/api/sessions",sessionRoutes);

app.get("/health",(req,res)=>{
    res.status(200).json({msg:"api is healthy"});
})






//make our app ready for deployment
const frontendPath = path.join(__dirname, "../../frontend/dist");

app.use(express.static(frontendPath));

app.get("/{*any}", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});






const startServer=async()=>{
    try {
        await connectDB();
        app.listen(ENV.PORT,()=>{
        console.log("Server is running on port :" , ENV.PORT);
       

});

    }
    catch (error) {
        console.error("Error starting server:", error);
        process.exit(1);
    }
}


startServer();