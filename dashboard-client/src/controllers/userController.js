import { fetchAllFromApi, postWithApi, updateWithApi } from '../services/axiosService';
import { saveInLocalStorage } from '../services/localStorageService';

const USER_ENDPOINT = 'users/';
const AUTH_ENDPOINT = 'auth/';


/**
 * Register the user
 * @param {object} userData 
 * @returns {Promise<[boolean, object]>}
 */
export async function register(userData){
    return await postWithApi(`${AUTH_ENDPOINT}register`, userData, 201)
    
}


/**
 * Login the user
 * @param {object} userData 
 * @returns {Promise<[boolean, object]>}
 */
export async function login(userData){
    return await postWithApi(`${AUTH_ENDPOINT}login`, userData)   
}


/**
 * Logout the user
 * @param {object} userData 
 * @returns {Promise<[boolean, object]>}
 */
export async function logout(){
    const result = await postWithApi(`${AUTH_ENDPOINT}logout`)  
    if (result[0]){
        saveInLocalStorage('access_token', '')
    }
}


/**
 * Get user profile by ID
 * @param {string} userId 
 * @returns {Promise<[boolean, object]>}
 */
export async function getUserProfile(userId) {
    return await fetchAllFromApi(`${USER_ENDPOINT}${userId}/profile`);
}

/**
 * Update user profile
 * @param {string} userId 
 * @param {object} data - { username, email }
 * @returns {Promise<[boolean, object]>}
 */
export async function updateUserProfile(userId, data) {
    return await updateWithApi(`${USER_ENDPOINT}`, `${userId}/profile/edit`, data);
}

/**
 * Change user password
 * @param {string} userId 
 * @param {object} data - { currentPassword, newPassword }
 * @returns {Promise<[boolean, object]>}
 */
export async function changeUserPassword(userId, data) {
    return await postWithApi(`${USER_ENDPOINT}${userId}/profile/change-password`, data);
}

/**
 * Get current logged in user
 * @returns {Promise<[boolean, object]>}
 */
export async function getCurrentUser() {
    return await fetchAllFromApi('auth/me');
}
