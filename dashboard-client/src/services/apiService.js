import axios from "axios";

const URL =
    import.meta.env.VITE_API_URL;

const API_URL = `${URL}/connectors`;

export const getConnectors = async() => {
    try {
        const response = await axios.get(API_URL);
        return response.data.data;
    } catch (error) {
        console.error("Error while fetching connectors :", error);
        return [];
    }
};