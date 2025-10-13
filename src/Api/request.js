import axios from 'axios';


const request = axios.create({
    baseURL: 'http://localhost:7008'
});



export default request;