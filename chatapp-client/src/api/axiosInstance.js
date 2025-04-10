import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    withCredentials: true,
  },
});

// Add a response interceptor to handle token expiration
// api.interceptors.response.use(
//   (response) => response, // Continue with the response if it's successful
//   async (error) => {
//     const originalRequest = error.config;
//     if (error.response.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true; // Mark the request as retried : avoiding an infinite loop of retries in case of repeated 401 errors.
      
//       try {
        // Fetch the refreshToken from the server (using the stored accessToken)
        // const response = await api.get('/user'); // or an endpoint that returns the refreshToken for the logged-in user
        // const refreshToken = response.data.refreshToken;

        // const newAccessToken = await refreshAccessToken(refreshToken);
        // localStorage.setItem('accessToken', newAccessToken);
        
        // Update the original request with the new access token and retry it
//         originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
//         return api(originalRequest);
//       } catch (refreshError) {
//         console.error('Refresh token failed');
//         return Promise.reject(refreshError);
//       }
//     }
//     return Promise.reject(error);
//   }
// );

export default api;


/*
- what is interceptors and where it comes from? 
		-provided from Axios library a way to modify or intercept 
		 API requests and responses before they are handled by .then() or .catch().
		 
- error.config : contains the original og configuration of the failed request.
		-It allows you to access and modify the original request i.e) retry a request after handling an error.
		
- what does 'error.response.status === 401 && !originalRequest._retry' mean? 
		-if the response status is 401 (Unauthorized), meaning the user is not authenticated.
		-!originalRequest._retry :  '_retry' ensures that the request is retried only once to avoid infinite loops (e.g., when refreshing tokens).
*/