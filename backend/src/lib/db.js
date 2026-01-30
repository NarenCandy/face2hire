import mongoose from 'mongoose';
import {ENV} from './env.js';

export const connectDB = async () => {
    if(!ENV.DB_URL){
        throw new Error("DB_URL is not defined in environment variables");
    }
    try{
        const conn= await mongoose.connect(ENV.DB_URL)
        console.log(`MongoDB connected : ${conn.connection.host}`);


    }catch(error){
        console.error("Error connecting to MongoDB:",error);
        process.exit(1);//exit with failure 0 measn success
    }
}