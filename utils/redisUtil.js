import { logger } from "../config/logger.js";
import getRedisClient from "./redisConnection.js"
import { redisClient } from "./redisConnection.js";

export const redisSet = async(key, value, options={})=>{
    try{
        await getRedisClient.set(key, value, options);
        logger.info(`REDIS SET: ${key}`);
    }catch(err){
        logger.error(`Redis SET error for key ${key}:`, err);
    throw err;
    }
};

export const redisGet = async(key)=>{
    try{
        const value = await redisClient.get(key);
        logger.info(`REDIS GET: ${key}`);
        return value;
    }catch(err){
        logger.error(`REDIS get error for ${key}`, err);
        throw err;
    }
}

export const redisDel = async(key)=>{
    try{
        await getRedisClient.del(key);
        logger.info(`REDIS Del: ${key}`);
    }catch(err){
        logger.error(`REDIS DEL ERROR for ${key}`, err);
        throw err
    }
}

export const redisExist = async(key)=>{
    try{
        const exists = await getRedisClient.exists(key);
        if(exists) {logger.info(`Key ${key} exists`); return exists}
        else {logger.info(`Key ${key} doesn't exists`); return null;}
    }catch(err){
        logger.error(`REDIS exist error for key${key}`, err);
        throw err;
    }
}