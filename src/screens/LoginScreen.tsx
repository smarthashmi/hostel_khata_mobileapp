import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    Modal,
    SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import theme from '../config/theme';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../config/env';

const safeTheme = theme || {};
const colors = safeTheme.colors || {
    primary: { main: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED'] },
    secondary: { main: '#06B6D4', gradient: ['#06B6D4', '#0891B2'] },
    background: { primary: '#FFFFFF', secondary: '#F9FAFB' },
    text: { primary: '#000', secondary: '#4B5563', tertiary: '#9CA3AF', inverse: '#FFF' },
    neutral: { gray: { '200': '#E5E7EB', '300': '#D1D5DB' } },
    accent: { emerald: '#10B981', error: '#EF4444' }
} as any;
const { spacing, typography, borderRadius, shadows } = safeTheme as any;

export default function LoginScreen() {
    const navigation = useNavigation<any>();
    const { login, loginWithToken } = useAuth();

    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [showGoogleModal, setShowGoogleModal] = useState(false);

    // This URL must match your BACKEND deployment URL
    // This URL must match your BACKEND deployment URL
    const GOOGLE_AUTH_URL = `${ENV.API_URL}/auth/google`;

    // Defensively define gradient colors
    const primaryGradient = colors?.primary?.gradient || ['#8B5CF6', '#7C3AED'];


    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            console.log('Attempting login with:', email);
            await login(email, password);
            console.log('Login successful');
        } catch (error: any) {
            console.error('Login error details:', error);
            const message = error.message || 'Unknown error occurred';
            Alert.alert('Login Failed', `Details: ${message}\n\nPlease check your internet connection and try again.`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        setShowGoogleModal(true);
    };

    const handleWebViewNavigationStateChange = async (newNavState: any) => {
        const { url } = newNavState;
        // console.log('WebView URL:', url); // Debugging

        // Check if the URL contains the success token
        // Expected format: https://api.devideit.com/auth/success?token=eyJ...
        if (url.includes('token=')) {
            // Extract token
            const token = url.split('token=')[1].split('&')[0];

            if (token) {
                setShowGoogleModal(false);
                try {
                    console.log('Google Login Token Extracted:', token.substring(0, 10) + '...');

                    // Use the context helper to set token AND fetch user details
                    await loginWithToken(token);

                    Alert.alert('Success', 'Google Login Successful!');
                } catch (error) {
                    console.error('Error saving Google token:', error);
                    Alert.alert('Error', 'Failed to save login session.');
                }
            }
        }

        // Handle failure redirect
        if (url.includes('error=auth_failed') || url.includes('error=server_error')) {
            setShowGoogleModal(false);
            Alert.alert('Login Failed', 'Google authentication failed.');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header with Gradient */}
                <LinearGradient
                    colors={primaryGradient as any}
                    style={styles.header}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircle}>
                            <Text style={styles.logoText}>🏠</Text>
                        </View>
                        <Text style={styles.appName}>DivideIt</Text>
                        <Text style={styles.tagline}>Track expenses together</Text>
                    </View>
                </LinearGradient>

                {/* Login Form Card */}
                <View style={styles.formCard}>
                    <Text style={styles.welcomeText}>Welcome Back!</Text>
                    <Text style={styles.subtitleText}>Sign in to continue</Text>

                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="name@company.com"
                            placeholderTextColor={colors.text.tertiary}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            placeholderTextColor={colors.text.tertiary}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Forgot Password */}
                    <TouchableOpacity
                        style={styles.forgotButton}
                        onPress={() => navigation.navigate('ForgotPassword')}
                    >
                        <Text style={styles.forgotText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    {/* Login Button */}
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleLogin}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={primaryGradient as any}
                            style={styles.loginButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.loginButtonText}>
                                {isLoading ? 'Signing in...' : 'Sign In'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Google Sign In */}
                    <TouchableOpacity
                        style={styles.googleButton}
                        activeOpacity={0.8}
                        onPress={handleGoogleLogin}
                    >
                        <Text style={styles.googleIcon}>G</Text>
                        <Text style={styles.googleButtonText}>Continue with Google</Text>
                    </TouchableOpacity>

                    {/* Sign Up Link */}
                    <View style={styles.signupContainer}>
                        <Text style={styles.signupText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.signupLink}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Google Login WebView Modal */}
            <Modal
                visible={showGoogleModal}
                animationType="slide"
                onRequestClose={() => setShowGoogleModal(false)}
            >
                <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
                    <View style={{ padding: 10, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' }}>
                        <Text style={{ position: 'absolute', left: 0, right: 0, textAlign: 'center', fontWeight: 'bold' }}>Sign in to Google</Text>
                        <TouchableOpacity onPress={() => setShowGoogleModal(false)} style={{ padding: 5 }}>
                            <Text style={{ color: colors.primary.main, fontSize: 16, fontWeight: '600' }}>Close</Text>
                        </TouchableOpacity>
                    </View>
                    <WebView
                        source={{ uri: GOOGLE_AUTH_URL }}
                        onNavigationStateChange={handleWebViewNavigationStateChange}
                        startInLoadingState={true}
                        userAgent="Mozilla/5.0 (Linux; Android 10; Android SDK built for x86) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
                    />
                </SafeAreaView>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 40,
        paddingHorizontal: spacing.lg,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    logoContainer: {
        alignItems: 'center',
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    logoText: {
        fontSize: 40,
    },
    appName: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: typography.fontWeight.black,
        color: colors.text.inverse,
        marginBottom: spacing.xs,
    },
    tagline: {
        fontSize: typography.fontSize.sm,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: typography.fontWeight.medium,
    },
    formCard: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
    },
    welcomeText: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    subtitleText: {
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
        marginBottom: spacing.xl,
    },
    inputContainer: {
        marginBottom: spacing.lg,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold as any,
        color: colors.text.secondary,
        marginBottom: spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        fontSize: typography.fontSize.base,
        color: colors.text.primary,
        ...shadows.sm,
    },
    forgotButton: {
        alignSelf: 'flex-end',
        marginBottom: spacing.lg,
    },
    forgotText: {
        fontSize: typography.fontSize.sm,
        color: colors.primary.main,
        fontWeight: typography.fontWeight.semibold as any,
    },
    loginButton: {
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        ...shadows.md,
    },
    loginButtonGradient: {
        paddingVertical: spacing.md + 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButtonText: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold as any,
        color: colors.text.inverse,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.neutral.gray[200],
    },
    dividerText: {
        marginHorizontal: spacing.md,
        fontSize: typography.fontSize.xs,
        color: colors.text.tertiary,
        fontWeight: typography.fontWeight.semibold as any,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.lg,
        paddingVertical: spacing.md,
        ...shadows.sm,
    },
    googleIcon: {
        fontSize: typography.fontSize.lg,
        marginRight: spacing.sm,
        fontWeight: typography.fontWeight.bold as any,
        color: colors.primary.main,
    },
    googleButtonText: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold as any,
        color: colors.text.primary,
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: spacing.lg,
        marginBottom: spacing.xl,
    },
    signupText: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
    },
    signupLink: {
        fontSize: typography.fontSize.sm,
        color: colors.primary.main,
        fontWeight: typography.fontWeight.bold,
    },
});
