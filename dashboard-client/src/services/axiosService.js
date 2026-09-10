import axios from "axios";
import { fetchFromLocalStorage } from "./localStorageService";

// Auth backend address. Change it in .env, never in code.
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/'

/**
 * *Axios instance for using axiosService endpoints*
 */
const axiosService = refreshAxios();
export default axiosService;

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
 * *Sends a get request to server and returns a list of data or false based on response status*
 * @param {string} endpoint
 * @returns
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
 * *Sends a post request to server and returns the data freshly stored id or false according to response status*
 * @param {string} endpoint
 * @param {object} data
 * @returns
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
 * *Sends a put request to server and return true or false according to response status*
 * @param {string} endpoint
 * @param {string} id
 * @param {object} data
 * @param {boolean} autoJoin
 * @returns
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
 * *Sends a delete request to server and returns true or false*
 * @param {string} endpoint
 * @param {string} id
 * @returns
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
 * **Sends a delete all request to server and returns true or false**
 * @param {string} endpoint
 * @returns true or false
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
