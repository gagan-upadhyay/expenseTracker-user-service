import getRedisClient from "../utils/redisConnection";

export const rateLimiter = async(req, res, next)=>{
    const ip = req.ip;
    const key =`login_attempts:${ip}`;
    const maxAttempts=5

    const attempts = await getRedisClient.incr(key);
    if(attempts===1) await getRedisClient.expire(key, 60*5) //5 minutes window
    if(attempts>maxAttempts){
        return res.status(429).json({message:'Too many attempts'});
    }
    next();
}