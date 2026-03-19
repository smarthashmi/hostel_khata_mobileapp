import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import theme from '../config/theme';
import apiMethods from '../services/apiMethods';

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

export default function ResetPasswordScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { email } = route.params || {};

    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleResetPassword = async () => {
        if (!token.trim()) {
            Alert.alert('Error', 'Please enter the reset code');
            return;
        }
        if (!password) {
            Alert.alert('Error', 'Please enter a new password');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        try {
            setIsLoading(true);
            const response = await apiMethods.auth.resetPassword({
                token,
                password
            });

            if (response.data.success) {
                Alert.alert(
                    'Success',
                    'Password reset successfully. Please login with your new password.',
                    [
                        {
                            text: 'Login',
                            onPress: () => navigation.navigate('Login')
                        }
                    ]
                );
            } else {
                Alert.alert('Error', response.data.message || 'Failed to reset password');
            }
        } catch (error: any) {
            console.error('Reset password error:', error);
            const msg = error.response?.data?.message || 'Invalid or expired token';
            Alert.alert('Error', msg);
        } finally {
            setIsLoading(false);
        }
    };

    // Defensive gradient
    const primaryGradient = colors?.primary?.gradient || ['#8B5CF6', '#7C3AED'];

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
        >
            <LinearGradient
                colors={primaryGradient as any}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color={colors.text.inverse} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Reset Password</Text>
                    <View style={{ width: 24 }} />
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.formCard}>

                    <Text style={styles.description}>
                        Check your email {email ? `(${email})` : ''} for the reset code and enter it below along with your new password.
                    </Text>

                    {/* Token Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Reset Code</Text>
                        <View style={styles.inputContainer}>
                            <Feather name="key" size={20} color={colors.text.tertiary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={token}
                                onChangeText={setToken}
                                placeholder="Enter code received in email"
                                placeholderTextColor={colors.text.tertiary}
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    {/* New Password Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>New Password</Text>
                        <View style={styles.inputContainer}>
                            <Feather name="lock" size={20} color={colors.text.tertiary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Enter new password"
                                placeholderTextColor={colors.text.tertiary}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.text.tertiary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Confirm Password Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <View style={styles.inputContainer}>
                            <Feather name="check" size={20} color={colors.text.tertiary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Confirm new password"
                                placeholderTextColor={colors.text.tertiary}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.sendButton}
                        onPress={handleResetPassword}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.sendButtonText}>Reset Password</Text>
                        )}
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.secondary,
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 60 : 50,
        paddingBottom: 40,
        paddingHorizontal: spacing.lg,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold as any,
        color: colors.text.inverse,
    },
    backButton: {
        padding: 4,
    },
    content: {
        padding: spacing.lg,
        marginTop: -30,
    },
    formCard: {
        backgroundColor: colors.background.primary,
        borderRadius: borderRadius.lg,
        padding: spacing.xl,
        ...shadows.lg,
    },
    description: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        marginBottom: spacing.xl,
        lineHeight: 20,
    },
    inputGroup: {
        marginBottom: spacing.lg,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold as any,
        color: colors.text.primary,
        marginBottom: spacing.xs,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.neutral.gray[200],
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        height: 50,
        backgroundColor: colors.background.primary,
    },
    inputIcon: {
        marginRight: spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: typography.fontSize.base,
        color: colors.text.primary,
    },
    sendButton: {
        backgroundColor: colors.primary.main,
        borderRadius: borderRadius.md,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.md,
        ...shadows.sm,
    },
    sendButtonText: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold as any,
        color: colors.text.inverse,
    },
});
