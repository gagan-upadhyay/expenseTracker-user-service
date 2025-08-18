import {findById} from "../model/userModel.js";

export async function getUserById(userId){
    const user = await findById(userId);
    if(!user) throw new Error('User not found at service level');
    return user;
}