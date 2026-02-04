import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/apiMethods';

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    loginWithToken: (authToken: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user data on app start
    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('authToken');
            const storedUser = await AsyncStorage.getItem('userData');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await authApi.login(email, password);
            console.log('Login Response:', response.data); // Debug log

            // The backend returns { success: true, data: { user, token }, message: ... }
            if (!response.data.success) {
                throw new Error(response.data.message || 'Login failed');
            }

            const { token: authToken, user: userData } = response.data.data;

            if (!authToken) {
                throw new Error('No access token received from server');
            }

            // Store token and user data
            await AsyncStorage.setItem('authToken', authToken);
            await AsyncStorage.setItem('userData', JSON.stringify(userData));

            setToken(authToken);
            setUser(userData);
        } catch (error: any) {
            console.error('AuthContext Login Error:', error);
            if (error.response) {
                throw new Error(error.response.data?.message || `Server Error: ${error.response.status}`);
            } else if (error.request) {
                throw new Error(`Network Error: No response received. (${error.message})`);
            } else {
                throw new Error(error.message || 'Login failed');
            }
        }
    };

    const register = async (data: { name: string; email: string; password: string; phone?: string }) => {
        try {
            const response = await authApi.register(data);
            console.log('Register Response:', response.data); // Debug log

            if (!response.data.success) {
                throw new Error(response.data.message || 'Registration failed');
            }

            const { token: authToken, user: userData } = response.data.data;

            // Store token and user data
            await AsyncStorage.setItem('authToken', authToken);
            await AsyncStorage.setItem('userData', JSON.stringify(userData));

            setToken(authToken);
            setUser(userData);
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Registration failed');
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('userData');
            setToken(null);
            setUser(null);
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    // Helper for Oauth (WebView)
    const loginWithToken = async (authToken: string) => {
        try {
            setToken(authToken);
            await AsyncStorage.setItem('authToken', authToken);

            // Fetch user details immediately so the UI is correct
            const response = await authApi.getMe();

            // Backend returns { success: true, data: { user: ... } }
            if (response.data.success && response.data.data?.user) {
                const userData = response.data.data.user;
                setUser(userData);
                await AsyncStorage.setItem('userData', JSON.stringify(userData));
            }
        } catch (error) {
            console.error('Error fetching user profile after OAuth:', error);
            // Even if fetching profile fails, we have the token, so we stay logged in
            // But we might want to retry fetching the profile later
        }
    };

    const value = {
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!token,
        loginWithToken, // Explicitly exposed for OAuth
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
