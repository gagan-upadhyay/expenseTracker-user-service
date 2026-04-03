import { logger } from '../../config/logger.js';
import { generateReadSAS, generateUploadSAS } from '../../utils/azureblob.js';
import handleServerError from '../../utils/handleError.js';
import { deleteUser } from '../model/userModel.js';
import {changePasswordService, checkPasswordService, checkPasswordTypeService, getUserById, updateUserService} from '../service/userService.js'

import {v4 as uuidv4} from 'uuid';

export const updateUserController=(req, res)=> updateUserService(req, res);

export const checkPasswordController=(req, res)=> checkPasswordService(req, res);
export const changePasswordController=(req, res)=> changePasswordService(req, res);
export const getPasswordTypeController=(req, res) => checkPasswordTypeService(req, res);


export const GenerateUploadURL = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fileType } = req.body;

    const fileName = `users/${userId}/profile-${Date.now()}`;

    const { uploadUrl, blobName } = await generateUploadSAS(fileName, fileType);

    res.json({
      success: true,
      uploadUrl,
      blobName
    });

  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to generate SAS" });
  }
};

export async function getUserByIdController(req, res){
    try{
        const user = await getUserById(req.user.id);

        if(!user){
            const err = new Error("User not found, please try again");
            return handleServerError(res, err, 'Something went wrong with getting user');
        }
        const userWithImage = {
            ...user, 
            profile_picture:user.profile_picture
            ? 
            generateReadSAS(user.profile_picture)
            :
            null
        };

        return res.status(200).json({success:true, message:"User Details fetched successfully.", result:userWithImage});

    }catch(err){
        logger.error("At controller level:Error while getting information from db:", err);
        // return res.status(500).json({message:"Something went wrong! please try again later."});
        return handleServerError(res, err,"Something went wrong! please try again later");
    }
}

export async function deleteAccountByUserId(req, res){
    try {
        const userId = req.user.id;
        const result = await deleteUser(userId);

        if (!result) {
            const error = new Error('User deletion failed or returned no result');
            return handleServerError(res, error, 'Something went wrong with user deletion');
        }

        return res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });

    } catch(err) {
        return handleServerError(res, err, "Something went wrong with userId");
    }
}