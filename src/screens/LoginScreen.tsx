import React from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius, shadows } from '../config/theme';

export default function LoginScreen() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        // TODO: Implement login logic
        setTimeout(() => setIsLoading(false), 1000);
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
                    colors={colors.primary.gradient}
                    style={styles.header}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircle}>
                            <Text style={styles.logoText}>🏠</Text>
                        </View>
                        <Text style={styles.appName}>Hostel Khata</Text>
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
                    <TouchableOpacity style={styles.forgotButton}>
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
                            colors={colors.primary.gradient}
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
                    <TouchableOpacity style={styles.googleButton} activeOpacity={0.8}>
                        <Text style={styles.googleIcon}>G</Text>
                        <Text style={styles.googleButtonText}>Continue with Google</Text>
                    </TouchableOpacity>

                    {/* Sign Up Link */}
                    <View style={styles.signupContainer}>
                        <Text style={styles.signupText}>Don't have an account? </Text>
                        <TouchableOpacity>
                            <Text style={styles.signupLink}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
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
        fontWeight: typography.fontWeight.semibold,
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
        fontWeight: typography.fontWeight.semibold,
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
        fontWeight: typography.fontWeight.bold,
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
        fontWeight: typography.fontWeight.semibold,
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
        fontWeight: typography.fontWeight.bold,
        color: colors.primary.main,
    },
    googleButtonText: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
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
