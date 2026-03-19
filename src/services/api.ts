import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../config/env';

// API Configuration
const API_BASE_URL = ENV.API_URL;

// Create axios instance
const apiClient = axios.create({
    baseURL: 'http://192.168.1.X:5000/api', // DEV: replace with your machine's exact local IP address when running standard Expo Go on LAN. Usually 10.0.2.2 for Android Studio emulators.
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error fetching token for request:', error);
        }
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
