import { db } from "../../config/db.js"
import { logger } from "../../config/logger.js";
import bcrypt from 'bcrypt';

// - getUserById(userId) done
export async function findById(id){
    try{
        const userQuery=
        `
        SELECT firstname, lastname, email, profile_picture, password FROM users WHERE id=$1
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
// export async function changePassword(userId, oldPassword, newPassword){
//     try{
//         const query = 
//     }
// }



// - getUsers(filterOptions)
// - authenticateUser(credentials)
// - changePassword(userId, oldPassword, newPassword)
// - resetPassword(email)
// - verifyEmail(token)
// - sendVerificationEmail(userId)