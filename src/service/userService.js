import { logger } from "../../config/logger.js";
import {changeUserPassword, checkPasswordType, findById, getUserCreds} from "../model/userModel.js";
import bcrypt from 'bcrypt';
import { updateUser } from "../model/userModel.js";
import { deleteFromAzure, generateReadSAS } from "../../utils/azureblob.js";

export async function getUserById(userId){
    const user = await findById(userId);
    if(!user) throw new Error('User not found at service level');
    return user;
}
export const getUserDBPassword = async(id)=>{
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

export const extractBlobName=(url)=>{
    if(!url) return null;
    return url.split(".net/")[1]?.split("?")[0];
}

export const updateUserService = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log("Incoming body:", req.body)

        if(!userId) return res.status(401).json({success:false, error:'Unauthorized'});

        const { email, firstName, lastName, profile_picture } = req.body;


        // 🔥 Validation
        const isEmpty = (val) => val === undefined || val === null || (typeof val === "string" && val.trim() === "");
        if(
            isEmpty(email) &&
            isEmpty(firstName) &&
            isEmpty(lastName) &&
            isEmpty(profile_picture)
        )
        {
            return res.status(400).json({
            success: false,
            message: "No valid fields provided",
            });
        }

        // 🔥 Email validation
        if (email && !/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({
            success: false,
            message: "Invalid email format",
            });
        }

        //Profile Picture URL vaildation
        if (profile_picture && typeof profile_picture !== "string") {
        return res.status(400).json({
            success: false,
            error: "Invalid profile picture format"
        });
        }

        //Deleting old profile picture from blob
        if (profile_picture) {
            const existingUser = await getUserById(userId);
            console.log('value of existingUser.profile_picture:',existingUser.profile_picture);

            if (existingUser?.profile_picture) {
                const blobName = extractBlobName(existingUser.profile_picture);
                await deleteFromAzure(blobName);
            }
        }

        // 🔥 Prepare update object
        const updateData={};

        if (email) updateData.email = email;
        if (firstName) updateData.firstname = firstName;
        if (lastName) updateData.lastname = lastName;
        if(profile_picture) updateData.profile_picture=profile_picture;

        // 🔥 DB call
        const updatedUser = await updateUser(userId, updateData);
        const userWithImage = {
            ...updatedUser, 
            profile_picture:updatedUser.profile_picture
            ?
            generateReadSAS(updatedUser.profile_picture)
            :
            null
        }

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            user: userWithImage,
        });
        } catch (err) {
        console.error("Update user error:", err);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error:err
        });
    }
};



// - deleteUser(userId)
export async function deleteUser(userId){
    try{
        const query = `
        UPDATE users SET deletedAt = NOW() WHERE ID=$1
        `
        await db(query, [userId]);

    }catch(err){
        logger.error("Error while deleting user", err);
        return err;
    }
}


//--------------------Passord serivices---------------
//-----------check password service----------

export const checkPasswordService = async(req, res)=>{
    console.log('Value of req.body from CheckPassword service:', req.body);
    try{
        console.log("Inside try");
        if(!req.body?.password) return res.status(400).json({success:false, error:"No password received"});
        console.log('After one condition');
        if(!req.user.id) return res.status(404).json({success:false, error:"User not logged in"});

        const dbPassword = await getUserDBPassword(req.user.id);
        console.log("Value of userPassword:\n", dbPassword);
        const status = await checkPassword(req.body?.password, dbPassword);
        console.log("Value of status:", status);
        if(status ==='not matched'){
            return res.status(400).json({success:false, error:"Incorrect Password!",
                }
            );
        }
        return res.status(200).json({success:true, message:'Password Matched'});
    }catch(err){
        logger.info('Error at checkPassword level', err);
        console.error("Value of error from checkPasswordService:\n",err);
        return res.status(500).json({success:false, message:"Error while fetching password",error:err});
    }
}




//----change password service----------------------
export const changePasswordService = async(req, res)=>{
    console.log("Value of req.body from savePasswordService", req.body);
    try{
        const {oldPassword, newPassword} = req.body;
        const dbPassword = await getUserDBPassword(req.user.id);
        const isPasswordOkay = await checkPassword(oldPassword, dbPassword);
        if(isPasswordOkay){
            if(oldPassword === newPassword){
                return res.status(400).json({success:false, error:'Same as Old One',
                    "message":"New password can't be same as the old password"
                });
            }
            const newHashedPassword = await bcrypt.hash(newPassword, 12); 
            const changePasswordStatus = await changeUserPassword(req.user.id, newHashedPassword);
            // console.log("Value of changedPassword:", changePasswordStatus);
            if(!changePasswordStatus) return res.status(400).json({success:false, error:'Error while saving password'});

            return res.status(201).json({success:true, message:"Password changed"});
        }else{
            res.status(400).json({success:false, 
                "status":400,
                "type":'incorrect old_password',
                'message':"password doesn't match"
            })
        }

    }catch(err){
        console.error('Error at changePasswordService:', err);
        return res.status(500).json({success:false, error:err});
    }

}



