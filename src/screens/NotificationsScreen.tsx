import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
    Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { formatDistanceToNow } from 'date-fns';
import theme from '../config/theme';
import apiMethods from '../services/apiMethods';

const safeTheme = theme || {};
const colors = safeTheme.colors || {
    primary: { main: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED'], light: '#F3E8FF' },
    secondary: { main: '#06B6D4', gradient: ['#06B6D4', '#0891B2'], light: '#CFFAFE' },
    background: { primary: '#FFFFFF', secondary: '#F9FAFB' },
    text: { primary: '#000', secondary: '#4B5563', tertiary: '#9CA3AF', inverse: '#FFF' },
    neutral: { gray: { '100': '#F3F4F6', '200': '#E5E7EB', '300': '#D1D5DB', '500': '#6B7280' }, white: '#FFFFFF' },
    accent: { emerald: '#10B981', error: '#EF4444' },
    error: '#EF4444',
    success: { main: '#10B981' },
    info: '#3B82F6',
    warning: '#F59E0B'
} as any;
const { spacing, typography, borderRadius, shadows } = safeTheme as any;

export default function NotificationsScreen() {
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);

    const fetchNotifications = async () => {
        try {
            const response = await apiMethods.notification.getAll();
            if (response.data.success) {
                setNotifications(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const handleMarkAsRead = async (id: number) => {
        try {
            await apiMethods.notification.markRead(id);
            // Optimistic update
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await apiMethods.notification.markAllRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
            Alert.alert('Error', 'Failed to mark all as read');
        }
    };

    const getIconForType = (type: string) => {
        switch (type) {
            case 'EXPENSE_ADDED':
                return { name: 'dollar-sign', color: colors.error };
            case 'SETTLEMENT_REQUEST':
                return { name: 'credit-card', color: colors.warning };
            case 'SETTLEMENT_ACCEPTED':
                return { name: 'check-circle', color: (colors.success as any)?.main || '#10B981' };
            case 'GROUP_INVITE':
                return { name: 'user-plus', color: colors.primary.main };
            case 'NUDGE':
                return { name: 'bell', color: colors.info };
            default:
                return { name: 'info', color: colors.neutral.gray[500] };
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const iconInfo = getIconForType(item.type);
        const isRead = item.isRead;

        return (
            <TouchableOpacity
                style={[styles.notificationCard, !isRead && styles.unreadCard]}
                onPress={() => !isRead && handleMarkAsRead(item.id)}
            >
                <View style={[styles.iconContainer, { backgroundColor: iconInfo.color + '20' }]}>
                    <Feather name={iconInfo.name as any} size={20} color={iconInfo.color} />
                </View>
                <View style={styles.contentContainer}>
                    <Text style={[styles.notificationTitle, !isRead && styles.unreadText]}>
                        {item.title}
                    </Text>
                    <Text style={styles.notificationMessage}>{item.message}</Text>
                    <Text style={styles.timeText}>
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </Text>
                </View>
                {!isRead && (
                    <View style={styles.unreadDot} />
                )}
            </TouchableOpacity>
        );
    };

    const gradientColors = colors.primary.gradient as unknown as readonly [string, string, ...string[]];

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary.main} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={gradientColors}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color={colors.text.inverse} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Notifications</Text>
                    <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllButton}>
                        <Feather name="check-square" size={24} color={colors.text.inverse} />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Feather name="bell-off" size={48} color={colors.text.tertiary} />
                        <Text style={styles.emptyText}>No notifications yet</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: spacing.lg,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        ...shadows.md,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        padding: spacing.xs,
    },
    headerTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: 'bold',
        color: colors.text.inverse,
    },
    markAllButton: {
        padding: spacing.xs,
    },
    listContent: {
        padding: spacing.md,
    },
    notificationCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: colors.background.secondary,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.sm,
        ...shadows.sm,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    unreadCard: {
        backgroundColor: colors.info + '10', // Light info color tint
        borderColor: colors.info + '30',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    contentContainer: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: typography.fontSize.base,
        color: colors.text.primary,
        fontWeight: '600',
        marginBottom: 2,
    },
    unreadText: {
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    notificationMessage: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        marginBottom: 4,
        lineHeight: 18,
    },
    timeText: {
        fontSize: typography.fontSize.xs,
        color: colors.text.tertiary,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.info,
        marginTop: 6,
        marginLeft: spacing.xs,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: spacing['4xl'],
    },
    emptyText: {
        marginTop: spacing.md,
        color: colors.text.tertiary,
        fontSize: typography.fontSize.base,
    },
});
