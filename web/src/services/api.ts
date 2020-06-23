import axios from 'axios';

const api = axios.create({
  baseURL: 'https://glacial-beyond-52907.herokuapp.com',
});

export default api;
