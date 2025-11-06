/**
 * **Store data in local storage**
 * @param {string} key
 * @param {string} value
 * @returns boolean
 */
export function saveInLocalStorage(key, value) {

    if (key && key.trim() !== '') {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } else {

        return false;
    }
}



/**
 * **Gets data stored in local storage**
 * @param {string} key
 * @returns array of data or false
 */
export function fetchFromLocalStorage(key) {

    try {

        if (key && key.trim() !== '') {

            const result = JSON.parse(localStorage.getItem(key));
            return result ? result : false;

        } else {
            return false;
        }
    } catch (ex) {
        console.log(ex);
        return false;
    }
}
