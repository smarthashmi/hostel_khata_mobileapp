// Environment configuration
export const ENV = {
    API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
    GOOGLE_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
    FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
    FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
    APP_ENV: process.env.EXPO_PUBLIC_APP_ENV || 'development',
};

export const isDevelopment = ENV.APP_ENV === 'development';
export const isProduction = ENV.APP_ENV === 'production';
