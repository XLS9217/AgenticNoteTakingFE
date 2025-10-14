import axios from 'axios';


const request = axios.create({
    // Use Vite dev server proxy to avoid CORS during development
    baseURL: '/api'
});



export default request;