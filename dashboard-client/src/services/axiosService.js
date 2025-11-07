import axios from "axios";
import { fetchFromLocalStorage } from "./localStorageService";


const baseURL = 'http://localhost:3001/'

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
    // console.log('DEBUG - axios service', token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })
  return axiosService;
}




/**
 * *Sends a get request to server and resturns a list of data or false based on response status*
 * @param {string} endPoint
 * @returns
 */
export async function getFromApi(endPoint) {
    const result = await axiosService.get(endPoint);
    if (result.status === 200) {
        const data = result.data;
        if(data){
            return [true, data]
        }
    }
    return [false, result.data?.errors];
}





/**
 * *Sends a post request to server and returns the data freshly stored id or false according to response status*
 * @param {string} endPoint
 * @param {object} data
 * @returns
 */
export async function postWithApi(endPoint, data = null, successStatus = 200) {

  try{
    let result = null;
    if (data != null){
      result = await axiosService.post(endPoint, data);
    } else{
      result = await axiosService.post(endPoint);
    }
    if (result.status === successStatus) return [true, result.data]
    return [false, result.data]
  }catch(error){
    console.log(error)
      return[false,error.response.data]
  }
}





/**
 * *Sends a put request to server and return true or false according to response status*
 * @param {string} endPoint
 * @param {string} id
 * @param {object} data
 * @param {boolean} autoJoin
 * @returns
 */
export async function updateWithApi(endPoint, id = null, data, autoJoin = true) {
    if (data) {
      try {
        let url = endPoint;
        if (autoJoin && id) {
          url += id;
        }
        
        const result = await axiosService.put(url, data);
        
        if (result.status === 200) {
          return [true, result.data];
        }
        return [false, result.data];
      } catch (error) {
        console.error('Update API Error:', error);
        return [false, error.response?.data || { message: 'Update failed' }];
      }
    }
    return [false, { message: 'No data provided' }];
}





/**
 * *Sends a delete request to server and returns true or false*
 * @param {string} endPoint
 * @param {string} id
 * @returns
 */
export async function deleteWithApi(endPoint, id, successCode = 204) {
    if (id) {
        try {
          const result = await axiosService.delete(endPoint + id);
          if (result.status === successCode) return [true, result.data]
          return [false, result.data]
        } catch (error) {
          return [false, error.response.data]
        }
    }
    return false;
}



/**
 * **Sends a delete all request to server and returns true or false**
 * @param {string} endPoint
 * @returns true or false
 */
export async function deleteAllWithApi(endPoint) {
  try {
    const result = await axiosService.delete(endPoint)
    if (result.status === 204) return [true, result.data]
    return [false, result.data]
  } catch (error) {
    return [false, error.response.data]
  }
}
