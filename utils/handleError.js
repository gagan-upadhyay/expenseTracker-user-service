import { logger } from "../config/logger.js";

export default function handleServerError(res, err, context){
    logger.error(`${context}:`, err);
    return res.status(500).json({message:"Something went wrong! Please try again later"});
}