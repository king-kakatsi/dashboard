import { getFromApi, postWithApi, deleteWithApi } from '../services/connectorsService';

const WIDGET_ENDPOINT = 'widgets/';

/**
 * Get all widgets
 * @returns {Promise<[boolean, object]>}
 */
export async function getAllWidgets() {
    return await getFromApi(WIDGET_ENDPOINT);
}

/**
 * Activate widget for user
 * @param {string} widgetId 
 * @param {string} userId 
 * @returns {Promise<[boolean, object]>}
 */
export async function activateWidget(widgetId, userId) {
    return await postWithApi(`${WIDGET_ENDPOINT}${widgetId}/activate/${userId}`, null, 200);
}

/**
 * Deactivate widget for user
 * @param {string} widgetId 
 * @param {string} userId 
 * @returns {Promise<[boolean, object]>}
 */
export async function deactivateWidget(widgetId, userId) {
    return await deleteWithApi(`${WIDGET_ENDPOINT}${widgetId}/deactivate/`, userId, 200);
}

