import { logger } from '../../config/logger.js';
import handleServerError from '../../utils/handleError.js';
import { deleteUser } from '../model/userModel.js';
import {changePasswordService, checkPasswordService, checkPasswordTypeService, getUserById} from '../service/userService.js'

export const updateUserController=(req, res)=> updateUserService(req, res);

export const checkPasswordController=(req, res)=> checkPasswordService(req, res);
export const changePasswordController=(req, res)=> changePasswordService(req, res);
export const getPasswordTypeController=(req, res) => checkPasswordTypeService(req, res);

export async function getUserByIdController(req, res){
    try{
        const result = await getUserById(req.user.id);
        console.log("Value of result from controller:\n", result);
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