import { db } from "../../config/db.js"
import { logger } from "../../config/logger.js";

// - getUserById(userId) done
export async function findById(id){
    try{
        const userQuery=
        `
        SELECT * FROM users WHERE id=$1
        `
        const user =  await db(userQuery, [id]);

        return user.rows[0];
    }catch(err){
        logger.error('Error at user-service level fetching userDetails:', err);
        console.error("At model level error", err);
        return err;
    }
}

findById('316cb919-afe1-4f1e-9947-254f7c63a8ac');
// - createUser(data)
// - updateUser(userId, data)
// - deleteUser(userId)

// - getUsers(filterOptions)
// - authenticateUser(credentials)
// - changePassword(userId, oldPassword, newPassword)
// - resetPassword(email)
// - verifyEmail(token)
// - sendVerificationEmail(userId)