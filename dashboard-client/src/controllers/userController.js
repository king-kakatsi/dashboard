import { getFromApi, postWithApi, updateWithApi } from '../services/axiosService';
import { saveInLocalStorage } from '../services/localStorageService';

const USER_ENDPOINT = 'users/';
const AUTH_ENDPOINT = 'auth/';


/**
 * Register the user
 * @param {object} userData 
 * @returns {Promise<[boolean, object]>}
 */
export async function register(userData = null, method = null){
    if (method === 'google'){
        // return await getFromApi(`${AUTH_ENDPOINT}google`)  
        window.location.href = import.meta.env.VITE_API_URL + '/auth/google';
    } else if (method === 'github'){
        // return await getFromApi(`${AUTH_ENDPOINT}github`)  
        window.location.href = import.meta.env.VITE_API_URL + '/auth/github';
    }else if (userData){
        return await postWithApi(`${AUTH_ENDPOINT}register`, userData, 201)
    } else {
        return [false, {message: 'Invalid user data'}]
    }
    
}


/**
 * Login the user
 * @param {object} userData 
 * @returns {Promise<[boolean, object]>}
 */
export async function login(userData){
    return await postWithApi(`${AUTH_ENDPOINT}login`, userData)   
}


// /**
//  * Login the user using google
//  * @param {object} userData 
//  * @returns {Promise<[boolean, object]>}
//  */
// export async function googleLogin(){
//     return await postWithApi(`${AUTH_ENDPOINT}google`)   
// }


// /**
//  * Login the user using github
//  * @returns {Promise<[boolean, object]>}
//  */
// export async function githubLogin(){
//     return await postWithApi(`${AUTH_ENDPOINT}google`)   
// }


/**
 * Logout the user
 * @param {object} userData 
 * @returns {Promise<[boolean, object]>}
 */
export async function logout(){
    const result = await postWithApi(`${AUTH_ENDPOINT}logout`)  
    if (result[0]){
        saveInLocalStorage('access_token', '')
        saveInLocalStorage('user', '')
    }
    return result[0]
}


/**
 * Update user profile
 * @param {string} userId 
 * @param {object} data - { standByUsername, standByEmail }
 * @returns {Promise<[boolean, object]>}
 */
export async function updateUserProfile(userId, data) {
    return await updateWithApi(`${USER_ENDPOINT}profile`, null, data, false);
}

/**
 * Confirm user update
 * @param {string} userId 
 * @returns {Promise<[boolean, object]>}
 */
export async function confirmUserUpdate(userId) {
    return await getFromApi(`${USER_ENDPOINT}confirm-update/${userId}`);
}


/**
 * Get user profile by ID
 * @param {string} userId 
 * @returns {Promise<[boolean, object]>}
 */
export async function getUserProfile(userId) {
    return await getFromApi(`${USER_ENDPOINT}${userId}/`);
}


/**
 * Change user password
 * @param {string} userId 
 * @param {object} data - { currentPassword, newPassword }
 * @returns {Promise<[boolean, object]>}
 */
export async function changeUserPassword(userId, data) {
    return await postWithApi(`${USER_ENDPOINT}${userId}/change-password`, data);
}

/**
 * Get current logged in user
 * @returns {Promise<[boolean, object]>}
 */
export async function getCurrentUser() {
    return await getFromApi('auth/me');
}
