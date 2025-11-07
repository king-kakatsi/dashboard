import { getFromApi, postWithApi, deleteWithApi } from '../services/connectorsService';

const CONNECTOR_ENDPOINT = 'connectors/';

/**
 * Get all connectors
 * @returns {Promise<[boolean, object]>}
 */
export async function getAllConnectors() {
    return await getFromApi(CONNECTOR_ENDPOINT);
}

/**
 * Activate connector for user
 * @param {string} connectorId 
 * @param {string} userId 
 * @returns {Promise<[boolean, object]>}
 */
export async function activateConnector(connectorId, userId) {
    return await postWithApi(`${CONNECTOR_ENDPOINT}${connectorId}/activate/${userId}`, null, 200);
}

/**
 * Deactivate connector for user
 * @param {string} connectorId 
 * @param {string} userId 
 * @returns {Promise<[boolean, object]>}
 */
export async function deactivateConnector(connectorId, userId) {
    return await deleteWithApi(`${CONNECTOR_ENDPOINT}${connectorId}/deactivate/`, userId, 200);
}

