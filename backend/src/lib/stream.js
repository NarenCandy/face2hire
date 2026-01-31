import {StreamChat} from 'stream-chat';
import {ENV} from './env.js';
import {StreamClient} from '@stream-io/node-sdk';

const apiKey = ENV.STREAM_API_KEY;
const apiSecret = ENV.STREAM_API_SECRET;

if(!apiKey || !apiSecret) {
    console.error("Stream API key and secret must be provided");
}

export const streamClient = new StreamClient(apiKey, apiSecret);//used for video calls

export const chatClient = StreamChat.getInstance(apiKey, apiSecret);//used for chat 



export const upsertStreamUser = async (userData) => {
    try{
        await chatClient.upsertUser(userData);
        console.log("Stream user upserted: ", userData.id)
    } catch(error) {
        console.error("Error upserting Stream user:", error);
    }
}

export const deleteStreamUser = async (userId) => {
    try{
        await chatClient.deleteUser(userId);
        console.log("Stream user deleted: ", userId)
    } catch(error) {
        console.error("Error deleting Stream user:", error);
    }
}

//todo generate token 