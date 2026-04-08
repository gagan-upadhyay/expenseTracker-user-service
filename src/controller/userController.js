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

const getLogContext =(req, context)=> ({
    context: context, 
    route:req.OriginalUrl,
    method:req.method,
    status:req.statusCode,
    userId: req.user?.id, 
    accountId: req.params.id, 
    requestId: req.headers['x-request-id']
});

export const GenerateUploadURL = async (req, res) => {
    const logDetails = getLogContext(req, "UserService:generateUploadURLProfilePic");
  try {
    const userId = req.user.id;
    const { fileType } = req.body;

    const fileName = `users/${userId}/profile-${Date.now()}`;

    const { uploadUrl, blobName } = await generateUploadSAS(fileName, fileType);
    logger.info('Generated upload URL', logDetails);
    res.json({
      success: true,
      uploadUrl,
      blobName
    });

  } catch (err) {
    logger.error('Critical error: generateUploadURL', {...logDetails, error:err.message, stack:err.stack});
    res.status(500).json({ success: false, error: "Failed to generate SAS" });
  }
};

export async function getUserByIdController(req, res){
    const logDetails = getLogContext(req, "UserService:getUserById");
    try{
        const user = await getUserById(req.user.id);

        if(!user){
            const err = new Error("User not found, please try again");
            logger.warn('user not found', logDetails);
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
        logger.info('User details fetched successfully', logDetails);
        return res.status(200).json({success:true, message:"User Details fetched successfully.", result:userWithImage});

    }catch(err){
        logger.error("Critical issue: getUserByID",{...logDetails, error:err.message, stack:err.stack});
        // return res.status(500).json({message:"Something went wrong! please try again later."});
        return handleServerError(res, err,"Something went wrong! please try again later");
    }
}

export async function deleteAccountByUserId(req, res){
    const logDetails = getLogContext(req, "UserService:DeleteAccount")
    try {
        const userId = req.user.id;
        const result = await deleteUser(userId);

        if (!result) {
            logger.warn('User deletion failed', logDetails);
            const error = new Error('User deletion failed or returned no result');
            return handleServerError(res, error, 'Something went wrong with user deletion');
        }
        logger.info(`User deleted successfully`, logDetails);
        return res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });

    } catch(err) {
        logger.error("Critical error: DeleteUser", {...logDetails, error:err.message, stack:err.stack});
        return handleServerError(res, err, "Something went wrong with userId");
    }
}