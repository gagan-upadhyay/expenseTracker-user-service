import { logger } from '../../config/logger.js';
import handleServerError from '../../utils/handleError.js';
import { deleteUser } from '../model/userModel.js';
import {getUserById} from '../service/userService.js'

export async function updateUserController(req, res){
    try{
        const userId = req.user.id;
        console.log("value of req", req);
        console.log("Value of body:\n", req.body); 
        return res.status(200).json({requestBody:req.body});
    }catch(err){
        console.error(err);
    }
}

export async function getUserByIdController(req, res){
    try{
        const userId = req.user.id;
        console.log("Value of userID from controller:\n", userId);
        const result = await getUserById(userId);
        console.log("Value of result from controller:\n", result);

        // if(!result) return res.status(404).json({message:"User not found, please try again."});
        if(!result){
            const err = new Error("User not found, please try again");
            return handleServerError(res, err, 'Something went wrong with getting user');
        }
        console.log("User details fetched", result);
        return res.status(200).json({message:"User Details fetched successfully.", result});

    }catch(err){
        // logger.error("At controller level:Error while getting information from db:", err);
        // return res.status(500).json({message:"Something went wrong! please try again later."});
        return handleServerError(res, err,"Something went wrong! please try again later");
    }
}

export async function deleteAccountByUserId(req, res){
    try{
        const userId = req.user.id;
        const result = await deleteUser(userId);
        if(!result) {
            const error=new Error('User deletion failed or returned no result');
            return handleServerError(res, err, 'Something went wrong with user deletion');
        }
    }catch(err) {return handleServerError(res, err, "something went wrong with userId");}
}