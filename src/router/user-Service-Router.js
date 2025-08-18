import express from 'express';
import verifySession from '../../middleware/verifySession.js';
import { getUserByIdController } from '../controller/userController.js';


const userRouter = express.Router();

userRouter.get('/', verifySession,getUserByIdController);


export default userRouter;