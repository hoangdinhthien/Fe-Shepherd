import axios from 'axios';
import storageService from './local_storage';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

axiosClient.interceptors.request.use(async (currentConfig) => {
  const customHeaders = {};

  const accessToken = storageService.getAccessToken();
  if (accessToken) {
    customHeaders['Authorization'] = 'Bearer ' + accessToken;
  }

  return {
    ...currentConfig,
    headers: {
      ...customHeaders, // Attach token
      ...currentConfig.headers, // The remain data
    },
  };
});

// Add a response interceptor
axios.interceptors.response.use(
  function (response) {
    if (response.data) {
      // return success
      if (response.status === 200 || response.status === 201) {
        return response;
      }
      // reject errors & warnings
      return Promise.reject(response);
    }
    // default fallback
    return Promise.reject(response);
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
  }
);

export default axiosClient;
