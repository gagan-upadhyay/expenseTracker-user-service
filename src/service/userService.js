import { logger } from "../../config/logger.js";
import {changeUserPassword, checkPasswordType, findById, getUserCreds} from "../model/userModel.js";
import bcrypt from 'bcrypt';

export async function getUserById(userId){
    const user = await findById(userId);
    if(!user) throw new Error('User not found at service level');
    return user;
}
const getUserDBPassword = async(id)=>{
    const dbPassword= await getUserCreds(id);
    return dbPassword;
}

const checkPassword= async(userPassword, dbPassword)=>{
    try{
        const isValidPassword = await bcrypt.compare(userPassword, dbPassword);
        console.log("Vlaue of isValidPassword:\n", isValidPassword);
        if(!isValidPassword) {
            console.log("Inside !isValidPOasswored");
            return 'not matched';
        }
        return 'matched';
    }catch(err){
        logger.error("Error at password matching")
        return "Something went wrong with password checking";
    }       
}

export const checkPasswordTypeService = async(req, res)=>{
    console.log("from userService:\n",req.user.id);
    try{
        const user = await checkPasswordType(req.user.id);

        if(user === 'PASSWORD') return res.status(200).json({message:'PASSWORD'});
        if(user==='GOOGLE') return res.status(200).json({message:'GOOGLE'});
        if(!user) return res.status(400).json({message:"Something happened try again"});
    }catch(err){
        logger.error("Error while fetching password type", err);
        console.error('error at service level', err);
        return err;
    }
}

export const checkPasswordService = async(req, res)=>{
    console.log('Value of req.body from CheckPassword service:', req.body);
    try{
        console.log("Inside try");
        if(!req.body?.password) return res.status(400).json({message:"No password received"});
        console.log('After one condition');
        if(!req.user.id) return res.status(404).json({message:"User not logged in"});

        const dbPassword = await getUserDBPassword(req.user.id);
        console.log("Value of userPassword:\n", dbPassword);
        const status = await checkPassword(req.body?.password, dbPassword);
        console.log("Value of status:", status);
         if(status ==='not matched'){
            return res.status(401).json({type:"/errors/incorrect-user-password",
                "status":401,
                "details":"Password match is failed",
                "title":"Password is incorrect",
                "instance":"/api/v1/user/checkPassword"}
            );
        }
        return res.status(200).json({message:'Password matched'});
    }catch(err){
        logger.info('Error at checkPassword level', err);
        console.error("Value of error from checkPasswordService:\n",err);
        return res.status(500).json({message:"Error while fetching password",error:err});
    }
}

export const updateUserService = async(req, res)=>{
    return res.status(200).json({message:"updateUser hit"});
}

export const changePasswordService = async(req, res)=>{
    console.log("Value of req.body from savePasswordService", req.body);
    try{
        const {oldPassword, newPassword} = req.body;
        const dbPassword = await getUserDBPassword(req.user.id);
        const isPasswordOkay = await checkPassword(oldPassword, dbPassword);
        if(isPasswordOkay){
            if(oldPassword === newPassword){
                return res.status(400).json({
                    "status":400, 
                    "type":"password_reuse", 
                    "message":"New password can't be same as the old password"
                });
            }
            const newHashedPassword = await bcrypt.hash(newPassword, 12); 
            const changePasswordStatus = await changeUserPassword(req.user.id, newHashedPassword);
            console.log("Value of changedPassword:", changePasswordStatus);
            if(!changePasswordStatus) return res.status(400).json({message:'Error while saving password'});

            return res.status(201).json({message:"Password changed"});
        }else{
            res.status(400).json({
                "status":400,
                "type":'incorrect old_password',
                'message':"password doesn't match"
            })
        }

    }catch(err){
        console.error('Error at changePasswordService:', err);
    }

}



