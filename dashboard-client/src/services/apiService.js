import axios from "axios";

const URL =
    import.meta.env.VITE_API_URL_CONNECTOR;

const API_URL = `${URL}/connectors`;

export const getConnectors = async() => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch {
        return [];
    }
};

export const api = axios.create({
    baseURL: URL,
    withCredentials: true,
});

export const getWidgets = async() => {
    const response = await api.get('/widgets');
    return response.data;
};

/**
 * Lists a connector's widgets using the session cookie.
 *
 * Unlike the axios services it sends no Bearer header and relies on
 * cookies instead, which is why it uses fetch with credentials included.
 *
 * @param {string} serviceId Connector whose widgets to list
 */
export async function getWidgetsByService(serviceId) {
    const res = await fetch(`${URL}/widgets/service/${serviceId}`, {
        method: 'GET',
        credentials: 'include',
    });
    return res.json();
}