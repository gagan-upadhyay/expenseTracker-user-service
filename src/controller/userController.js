import { logger } from '../../config/logger.js';
import {getUserById} from '../service/userService.js'

export async function getUserByIdController(req, res){
    try{
        const userId = req.user.id;
        const result = await getUserById(userId);
        if(!result) return res.status(404).json({message:"User not found, please try again."});
        return res.status(200).json({message:"User Details fetched successfully.", result});

    }catch(err){
        logger.error("At controller level:Error while getting information from db:", err);
        return res.status(500).json({message:"Something went wrong! please try again later."});
    }
}