import axios from "axios";

const GATEWAY_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/department\/?$/, "") ||
  "http://localhost:8085";

const axiosInstance = axios.create({
  baseURL: GATEWAY_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;