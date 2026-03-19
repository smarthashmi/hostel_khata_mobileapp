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
import { useNavigation } from '@react-navigation/native';
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

export default function ForgotPasswordScreen() {
    const navigation = useNavigation<any>();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendResetEmail = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        try {
            setIsLoading(true);
            const response = await apiMethods.auth.forgotPassword(email);

            if (response.data.success) {
                Alert.alert(
                    'Email Sent',
                    'If an account exists with this email, you will receive a reset code/link.',
                    [
                        {
                            text: 'Enter Code',
                            onPress: () => navigation.navigate('ResetPassword', { email })
                        }
                    ]
                );
            } else {
                Alert.alert('Error', response.data.message || 'Failed to send reset email');
            }
        } catch (error: any) {
            console.error('Forgot password error:', error);
            const msg = error.response?.data?.message || 'An error occurred';
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
                    <Text style={styles.headerTitle}>Forgot Password</Text>
                    <View style={{ width: 24 }} />
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.formCard}>
                    <View style={styles.iconContainer}>
                        <Feather name="lock" size={48} color={colors.primary.main} />
                    </View>

                    <Text style={styles.description}>
                        Enter the email associated with your account and we'll send you a code to reset your password.
                    </Text>

                    {/* Email Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <View style={styles.inputContainer}>
                            <Feather name="mail" size={20} color={colors.text.tertiary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="name@example.com"
                                placeholderTextColor={colors.text.tertiary}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.sendButton}
                        onPress={handleSendResetEmail}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.sendButtonText}>Send Reset Code</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.backToLogin}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backToLoginText}>Back to Login</Text>
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
        paddingBottom: 40, // Extended header background
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
        marginTop: -30, // Overlap with header
    },
    formCard: {
        backgroundColor: colors.background.primary,
        borderRadius: borderRadius.lg,
        padding: spacing.xl,
        ...shadows.lg,
    },
    iconContainer: {
        alignSelf: 'center',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary.light,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    description: {
        textAlign: 'center',
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
        marginBottom: spacing.xl,
        lineHeight: 22,
    },
    inputGroup: {
        marginBottom: spacing.xl,
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
        marginTop: spacing.sm,
        ...shadows.sm,
    },
    sendButtonText: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold as any,
        color: colors.text.inverse,
    },
    backToLogin: {
        marginTop: spacing.lg,
        alignSelf: 'center',
        padding: spacing.sm,
    },
    backToLoginText: {
        color: colors.text.tertiary,
        fontSize: typography.fontSize.sm,
        fontWeight: '600' as any,
    }
});
