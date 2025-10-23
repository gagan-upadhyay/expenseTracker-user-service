import express from 'express';
import verifySession from '../../middleware/verifySession.js';
import {
    changePasswordController,
    checkPasswordController, 
    deleteAccountByUserId, 
    getPasswordTypeController, 
    getUserByIdController, 
    updateUserController 
} from '../controller/userController.js';
// import { updateUser } from '../model/userModel.js';


const userRouter = express.Router();


// Route Starting point: /api/v1/user
userRouter.get('/', verifySession,getUserByIdController);
userRouter.get('/password-type', verifySession, getPasswordTypeController);
userRouter.delete('/delete-user',verifySession, deleteAccountByUserId);

userRouter.put('/update-user', verifySession, updateUserController);
userRouter.post('/check-password', verifySession, checkPasswordController);
userRouter.put('/change-password', verifySession, changePasswordController)


export default userRouter;