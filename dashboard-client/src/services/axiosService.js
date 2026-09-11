import axios from "axios";
import { fetchFromLocalStorage } from "./localStorageService";

// Auth backend address. Change it in .env, never in code.
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/'

/**
 * *Axios instance for using axiosService endpoints*
 */
const axiosService = refreshAxios();
export default axiosService;

/**
 * Builds an auth API client that attaches the login token per request.
 *
 * The interceptor reads local storage on every call, so even the instance
 * created at startup picks up tokens saved later. Calling this again after
 * login is harmless but unnecessary for that reason.
 */
export function refreshAxios(){
  const axiosService = axios.create({
  baseURL: baseURL, // the backend base axiosService
  timeout: 30000, // 30s delay max
  headers: {
      "Content-Type": "application/json",
  }})

  axiosService.interceptors.request.use((config) => {
    const token = fetchFromLocalStorage('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })
  return axiosService;
}

/**
 * Sends a GET request that never throws.
 *
 * Always answers a [worked, payload] tuple: check worked before touching
 * payload, which holds data on success and the server error body otherwise.
 *
 * @param {string} endpoint Path relative to the API, like 'auth/me'
 * @returns Tuple of success flag and data or error body
 * @example
 * const [worked, user] = await getFromApi('auth/me');
 * if (!worked) return showLogin();
 */
export async function getFromApi(endpoint) {
    try {
      const result = await axiosService.get(endpoint);
      if (result.status === 200) {
          const data = result.data;
          if(data){
              return [true, data]
          }
      }
      return [false, result.data?.errors];
    } catch(error){
      return [false, error.response?.data || { message: 'Request failed' }];
    }
}

/**
 * Posts and answers the shared [worked, payload] tuple.
 *
 * successStatus decides what counts as success: pass 201 for creates,
 * keep 200 otherwise. Without data it posts an empty body.
 *
 * @param {string} endpoint Path relative to the API
 * @param {object} data Body to send, or null for none
 * @param {number} successStatus HTTP status treated as success
 */
export async function postWithApi(endpoint, data = null, successStatus = 200) {

  try{
    let result = null;
    if (data != null){
      result = await axiosService.post(endpoint, data);
    } else{
      result = await axiosService.post(endpoint);
    }
    if (result.status === successStatus) return [true, result.data]
    return [false, result.data]
  }catch(error){
      return[false,error.response?.data || { message: 'Request failed' }]
  }
}

/**
 * Puts data, appending the id to the endpoint unless told otherwise.
 *
 * Answers the shared [worked, payload] tuple, or a no-data message when
 * called with nothing to send.
 *
 * @param {string} endpoint Base path, id is joined to it when autoJoin
 * @param {string} id Suffix appended to the endpoint, unless autoJoin is false
 * @param {object} data Body to send
 * @param {boolean} autoJoin Join id onto endpoint (disable for full URLs)
 */
export async function updateWithApi(endpoint, id = null, data, autoJoin = true) {
    if (data) {
      try {
        let url = endpoint;
        if (autoJoin && id) {
          url += id;
        }
        
        const result = await axiosService.put(url, data);
        
        if (result.status === 200) {
          return [true, result.data];
        }
        return [false, result.data];
      } catch (error) {
        return [false, error.response?.data || { message: 'Update failed' }];
      }
    }
    return [false, { message: 'No data provided' }];
}

/**
 * Deletes endpoint plus id, expecting successCode in return.
 *
 * Answers the shared [worked, payload] tuple, or plain false when called
 * without an id, so callers must handle both shapes.
 *
 * @param {string} endpoint Base path the id is joined to
 * @param {string} id Suffix identifying the resource
 * @param {number} successCode HTTP status treated as success
 */
export async function deleteWithApi(endpoint, id, successCode = 204) {
    if (id) {
        try {
          const result = await axiosService.delete(endpoint + id);
          if (result.status === successCode) return [true, result.data]
          return [false, result.data]
        } catch (error) {
          return [false, error.response?.data || { message: 'Delete failed' }]
        }
    }
    return false;
}

/**
 * Deletes a whole collection endpoint. Answers the shared tuple.
 *
 * @param {string} endpoint Full collection path to delete
 */
export async function deleteAllWithApi(endpoint) {
  try {
    const result = await axiosService.delete(endpoint)
    if (result.status === 204) return [true, result.data]
    return [false, result.data]
  } catch (error) {
    return [false, error.response?.data || { message: 'Delete failed' }]
  }
}
