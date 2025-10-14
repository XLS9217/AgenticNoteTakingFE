import axios from 'axios';


const request = axios.create({
    baseURL: 'http://172.16.16.202:7008'
});



export default request;