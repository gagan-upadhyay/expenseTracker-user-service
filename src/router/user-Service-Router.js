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

//suggestions:

// GET    /users/me                    (was /api/v1/user)
// PATCH  /users/me                    (was /update-user)
// DELETE /users/me                    (was /delete-user)
// GET    /users/me/password-type
// POST   /users/me/password/check     (was /check-password)
// PUT    /users/me/password           (was /change-password)

export default userRouter;