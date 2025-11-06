import { fetchAllFromApi, storeWithApi, updateWithApi } from '../services/axiosService';

const USER_ENDPOINT = 'users/';

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
    return await storeWithApi(`${USER_ENDPOINT}${userId}/profile/change-password`, data);
}

/**
 * Get current logged in user
 * @returns {Promise<[boolean, object]>}
 */
export async function getCurrentUser() {
    return await fetchAllFromApi('auth/me');
}
