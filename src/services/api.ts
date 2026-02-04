import axios from 'axios';

// API Configuration
const API_BASE_URL = __DEV__
    ? 'http://localhost:3000/api'  // Development (use your computer's IP for physical device)
    : 'https://api-hostelkhata.xivra.pk/api';  // Production

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    async (config) => {
        // TODO: Get token from secure storage
        // const token = await SecureStore.getItemAsync('authToken');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // TODO: Handle token expiration
            // Clear token and redirect to login
        }
        return Promise.reject(error);
    }
);

export default apiClient;
