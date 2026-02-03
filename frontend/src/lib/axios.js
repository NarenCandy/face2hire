import axios from 'axios';



const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    withCredentials: true, //by adding this browser will send cookies automatically with every request
})


export default axiosInstance;