import jwt from 'jsonwebtoken';
import { redisClient } from '../utils/redisConnection.js';

const verifySession = async(req, res, next)=>{
    try{
        console.log("From verify session of user-service:");
        const token = req.cookies.accessToken;
        console.log("Value of token from verifySession:", token);
        if(!token) return res.status(401).json({message:'Token missing'});
        const decoded = jwt.verify(token, process.env.SECRET);
    
        console.log("value of decoded from verifySesison form user-service:", decoded);
 
        const cachedToken = await redisClient.get(`session:${decoded.id}`);
        if(cachedToken!== token){
            return res.status(401).json({message:'Invalid or expired token'})
        }
        req.user=decoded;
        console.log("Value of req.user from verifySession of user-service:\n",req.user);
        next();
    }catch(err){
        res.status(401).json({message:'Unauthorized!'});
    }
};

export default verifySession;