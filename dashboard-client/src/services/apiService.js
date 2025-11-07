import axios from "axios";

const URL =
    import.meta.env.VITE_API_URL_CONNECTOR;

const API_URL = `${URL}/connectors`;

export const getConnectors = async() => {
    try {
        const response = await axios.get(API_URL);
        // console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error while fetching connectors :", error);
        return [];
    }
};

/* export async function getWidgets() {
    const response = await fetch(`${URL}/widgets`, {
        credentials: "include",
    });
    const data = await response.json();
    return data;
} */

export const api = axios.create({
    baseURL: URL,
    withCredentials: true,
});

export const getWidgets = async() => {
    const response = await api.get('/widgets');
    return response.data;
};

export async function getWidgetsByService(serviceId) {
    const res = await fetch(`${URL}/widgets/service/${serviceId}`, {
        method: 'GET',
        credentials: 'include',
    });
    return res.json();
}