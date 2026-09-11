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
/**
 * Reads a JSON value from local storage.
 *
 * Answers false both when the key is missing and when parsing fails, so
 * callers must compare with !== false: stored empty strings are falsy too
 * but mean something completely different.
 *
 * @param {string} key Storage key, like 'access_token'
 * @returns The parsed value, or false when unreadable
 */
export function fetchFromLocalStorage(key) {

    try {

        if (key && key.trim() !== '') {

            const result = JSON.parse(localStorage.getItem(key));
            return result ? result : false;

        } else {
            return false;
        }
    } catch {
        return false;
    }
}
