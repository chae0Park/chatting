import axios from 'axios';

// Create axios instance
// const api = axios.create({
//   baseURL: 'http://localhost:5001/api',
//   headers: {
//     Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
//   },
//   withCredentials: true,
// });


const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
  },
  withCredentials: true,
});

export default api;

