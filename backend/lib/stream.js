import {StreamChat} from "stream-chat"
import {StreamClient} from "@stream-io/node-sdk";
import {ENV} from "./env.js"

const apiKey = ENV.STREAM_API_KEY;
const apiSecret = ENV.STREAM_API_SECRET;

if(!apiKey || !apiSecret){
    console.error("Stream api key or api secret is missing!");
}

export const streamClient = new StreamClient(apiKey,apiSecret) // Video calls features
export const chatClient = StreamChat.getInstance(apiKey,apiSecret);//This is for chat features!

export const upsertStreamUser = async (userData) => {
    try {
        await chatClient.upsertUser(userData);
        console.log("Stream user upserted successfully:",userData);
    } catch (error) {
        console.error("Error upserting stream user:",error);
    }
}


export const deleteStreamUser = async (userId) => {
    try {
        await chatClient.deleteUser(userId);
        console.log("Stream user deleted successfully:",userId);
    } catch (error) {
        console.error("Error deleting the stream user:",error);
    }
}
