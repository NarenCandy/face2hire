import axios from 'axios';
import axio from 'axios';



const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true, //by adding this browser will send cookies automatically with every request
})


export default axiosInstance;