import { createClient } from "redis";

export const redisClient = createClient({
    username:'default',
    password:'BgKGWLAzOIAnCL2GEDc3viudHPj3MahN',
    socket:{
        host:'redis-14117.c92.us-east-1-3.ec2.redns.redis-cloud.com',
        port:14117
    }
});
await redisClient.connect();
let isConnected = false;

async function connectWithRetry(retries=5, delay=1000){
    for(let attempt=0;attempt<retries;attempt++){
        try{
            await redisClient.connect();
            isConnected=true;
            console.log("✅ Redis connected with retry function");
            return;
        }catch(error){
            if(error instanceof Error)
                {if(error.name==='ConnectionTimeoutError'){
                    console.warn(`⚠️ Redis timeout. Retrying ${attempt}/${retries}...`);
                    await new Promise((res)=>setTimeout(res, delay*attempt)); //exponential back-off
                }else{
                    console.error("❌ Redis connection failed:", error);
                    break;
                }}
        }
    }
}

redisClient.on('error', async(error)=>{
    console.error('Redis client error:\n',error);
    if(error.name==='ConnectionTimeoutError'){
        isConnected=false;
        await connectWithRetry();
    }
});

export default async function getRedisClient() {
    // if(!isConnected){
    //     await connectWithRetry();
    // }
    return await redisClient.connect();
}
