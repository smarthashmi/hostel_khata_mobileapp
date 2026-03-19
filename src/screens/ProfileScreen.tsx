import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    StatusBar,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import theme from '../config/theme';

const safeTheme = theme || {};
const colors = safeTheme.colors || {
    primary: { main: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED'], light: '#F3E8FF' },
    secondary: { main: '#06B6D4', gradient: ['#06B6D4', '#0891B2'], light: '#CFFAFE' },
    background: { primary: '#FFFFFF', secondary: '#F9FAFB' },
    text: { primary: '#000', secondary: '#4B5563', tertiary: '#9CA3AF', inverse: '#FFF' },
    neutral: { gray: { '200': '#E5E7EB', '300': '#D1D5DB' } },
    accent: { emerald: '#10B981', error: '#EF4444' },
    error: '#EF4444'
} as any;
const { spacing, typography, borderRadius, shadows } = safeTheme as any;

export default function ProfileScreen() {
    const navigation = useNavigation<any>();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header with Gradient */}
            <LinearGradient
                colors={colors.primary.gradient}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.headerContent}>
                    <View style={styles.profileCircle}>
                        <Text style={styles.profileInitial}>{user?.name?.charAt(0) || 'U'}</Text>
                    </View>
                    <Text style={styles.userName}>{user?.name || 'User'}</Text>
                    <Text style={styles.userEmail}>{user?.email || ''}</Text>
                </View>
            </LinearGradient>

            {/* Profile Options */}
            <View style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>

                    <TouchableOpacity
                        style={styles.optionCard}
                        onPress={() => navigation.navigate('EditProfile')}
                    >
                        <Text style={styles.optionIcon}>👤</Text>
                        <View style={styles.optionInfo}>
                            <Text style={styles.optionTitle}>Edit Profile</Text>
                            <Text style={styles.optionSubtitle}>Update your information</Text>
                        </View>
                        <Text style={styles.optionArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.optionCard}>
                        <Text style={styles.optionIcon}>🔔</Text>
                        <View style={styles.optionInfo}>
                            <Text style={styles.optionTitle}>Notifications</Text>
                            <Text style={styles.optionSubtitle}>Manage notification settings</Text>
                        </View>
                        <Text style={styles.optionArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.optionCard}
                        onPress={() => navigation.navigate('ChangePassword')}
                    >
                        <Text style={styles.optionIcon}>🔒</Text>
                        <View style={styles.optionInfo}>
                            <Text style={styles.optionTitle}>Privacy & Security</Text>
                            <Text style={styles.optionSubtitle}>Password, biometrics</Text>
                        </View>
                        <Text style={styles.optionArrow}>›</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support</Text>

                    <TouchableOpacity style={styles.optionCard}>
                        <Text style={styles.optionIcon}>❓</Text>
                        <View style={styles.optionInfo}>
                            <Text style={styles.optionTitle}>Help Center</Text>
                            <Text style={styles.optionSubtitle}>FAQs and support</Text>
                        </View>
                        <Text style={styles.optionArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.optionCard}>
                        <Text style={styles.optionIcon}>ℹ️</Text>
                        <View style={styles.optionInfo}>
                            <Text style={styles.optionTitle}>About</Text>
                            <Text style={styles.optionSubtitle}>Version 1.0.0</Text>
                        </View>
                        <Text style={styles.optionArrow}>›</Text>
                    </TouchableOpacity>
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    activeOpacity={0.8}
                >
                    <Text style={styles.logoutIcon}>🚪</Text>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.secondary,
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight! + 10,
        paddingBottom: spacing.xl,
        paddingHorizontal: spacing.lg,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerContent: {
        alignItems: 'center',
    },
    profileCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    profileInitial: {
        fontSize: 40,
        fontWeight: typography.fontWeight.black,
        color: colors.text.inverse,
    },
    userName: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.black,
        color: colors.text.inverse,
        marginBottom: spacing.xs,
    },
    userEmail: {
        fontSize: typography.fontSize.sm,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: typography.fontWeight.medium,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.black,
        color: colors.text.secondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: spacing.md,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.primary,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
        ...shadows.sm,
    },
    optionIcon: {
        fontSize: 24,
        marginRight: spacing.md,
    },
    optionInfo: {
        flex: 1,
    },
    optionTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text.primary,
        marginBottom: spacing.xs / 2,
    },
    optionSubtitle: {
        fontSize: typography.fontSize.xs,
        color: colors.text.tertiary,
    },
    optionArrow: {
        fontSize: 32,
        color: colors.text.tertiary,
        fontWeight: typography.fontWeight.bold,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.error + '15',
        borderRadius: borderRadius.lg,
        paddingVertical: spacing.md,
        marginTop: spacing.md,
        borderWidth: 1,
        borderColor: colors.error + '30',
    },
    logoutIcon: {
        fontSize: 20,
        marginRight: spacing.sm,
    },
    logoutText: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
        color: colors.error,
    },
});
