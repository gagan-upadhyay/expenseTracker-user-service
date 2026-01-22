import { db } from "../../config/db.js"
import { logger } from "../../config/logger.js";
import bcrypt from 'bcrypt';

// - getUserById(userId) done
export async function findById(id){
    try{
        const userQuery=
        `
        SELECT firstname, lastname, email, profile_picture, password, theme FROM users WHERE id=$1
        `
        const user =  await db(userQuery, [id]);
        console.log("Value of user from userModel:\n", user);
        return user.rows[0];
    }catch(err){
        logger.error('Error at user-service level fetching userDetails:', err);
        console.error("At model level error", err);
        return err;
    }
}

export async function checkPasswordType(id){
    try{
        const userQuery = 
        `
        SELECT auth_type FROM users WHERE id=$1
        `
        const user = await db(userQuery, [id]);
        console.log("Value of auth_type feom user model:\n", user.rows[0]?.auth_type);
        if(user.rows[0]?.auth_type === 'PASSWORD') return 'PASSWORD';
        if(user.rows[0]?.auth_type === 'GOOGLE') return 'GOOGLE';
    }catch(err){
        logger.error('Error while fetching user Auth_type', err);
        console.error("At model level",err);
        return err;
    }
}

export const getUserCreds = async(id)=>{
    console.log('Inside getUserCreds......');
  const userQuery = `SELECT password from users WHERE id=$1`;
  const result = await db(userQuery, [id]);
  console.log("Value of result from userModel:\n", result.rows[0].password);
  return result.rows[0].password;
}

// - updateUser(userId, data)
export async function updateUser(userId,data){
    try{
        console.log("value of data from model:\n", (data));
        const allowedFields=['firstname', 'lastname', 'profile_picture', 'email'];
        const filteredData = Object.fromEntries(Object.entries(data).filter(([key])=>allowedFields.includes(key)));
        // console.log(filteredData);
        // if(Object.keys(filteredData).length===0) throw new Error('No valid fields to update');
        
        // console.log(filteredData);
        const fields = Object.keys(filteredData);
        const values = Object.values(filteredData);
        const setClause = fields.map((f,i)=>`"${f}"=$${i+1}`).join(',');

        const query = `
        UPDATE users SET ${setClause} WHERE id=$${fields.length+1}
        RETURNING *;
        `
        const result = await db(query, [...values, userId]);

        if(result.rows.length===0) throw new Error (`User with Id ${userId} not found`);
        return result.rows[0];
        
    }catch(err){
        logger.error("Error at user-service level updating userdetails", err);
        console.error('At Model error:\n', err);
        return err;
    }
}

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

// - changePassword(userId, oldPassword, newPassword)
export async function changeUserPassword(userId, newHashedPassword){
    try{
        console.log("Value of userID and newHashedPasswpord", userId, newHashedPassword);
        const query = `
        UPDATE users SET password=$1 WHERE ID=$2
        RETURNING *
        `
        const result = await db(query, [newHashedPassword, userId]);
        console.log("value of result freom changePassword:\n", result);
        return result.rows[0];
    }catch(err){
        logger.error('Error while changing user password');
    }
}



// - getUsers(filterOptions)
// - authenticateUser(credentials)
// - changePassword(userId, oldPassword, newPassword)
// - resetPassword(email)
// - verifyEmail(token)
// - sendVerificationEmail(userId)