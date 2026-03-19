import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
    RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
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

export default function ActivityLogScreen() {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { groupId, groupName } = route.params;

    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activities, setActivities] = useState<any[]>([]);

    const fetchActivity = async () => {
        try {
            const response = await apiMethods.activity.getGroupActivity(groupId);
            if (response.data.success) {
                // The new endpoint returns { transactions: [...] } or just array
                const data = response.data.data;
                const activityList = Array.isArray(data) ? data : (data.transactions || []);
                setActivities(activityList);
            }
        } catch (error) {
            console.error('Error fetching activity:', error);
            // Optional: Alert.alert('Error', 'Failed to load activity log');
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchActivity();
    }, [groupId]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchActivity();
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'EXPENSE_CREATED':
                return { name: 'dollar-sign', color: colors.error };
            case 'DEPOSIT_CREATED':
                return { name: 'plus-circle', color: (colors.success as any)?.main || '#10B981' };
            case 'SETTLEMENT_CREATED':
            case 'SETTLEMENT_COMPLETED':
                return { name: 'check-circle', color: colors.info };
            case 'MEMBER_ADDED':
                return { name: 'user-plus', color: colors.primary.main };
            case 'GROUP_CREATED':
                return { name: 'users', color: colors.warning };
            default:
                return { name: 'activity', color: colors.neutral.gray[500] };
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const iconInfo = getActivityIcon(item.type);

        return (
            <View style={styles.activityCard}>
                <View style={[styles.iconContainer, { backgroundColor: iconInfo.color + '20' }]}>
                    <Feather name={iconInfo.name as any} size={20} color={iconInfo.color} />
                </View>
                <View style={styles.contentContainer}>
                    <Text style={styles.activityDescription}>{item.description}</Text>
                    <Text style={styles.activityTime}>
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </Text>
                </View>
            </View>
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
                    <View>
                        <Text style={styles.headerTitle}>Activity Log</Text>
                        <Text style={styles.headerSubtitle}>{groupName}</Text>
                    </View>
                    <View style={{ width: 24 }} />
                </View>
            </LinearGradient>

            <FlatList
                data={activities}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Feather name="activity" size={48} color={colors.text.tertiary} />
                        <Text style={styles.emptyText}>No recent activity</Text>
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
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: typography.fontSize.sm,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },
    listContent: {
        padding: spacing.md,
    },
    activityCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: colors.background.secondary,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.sm,
        ...shadows.sm,
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
    activityDescription: {
        fontSize: typography.fontSize.base,
        color: colors.text.primary,
        marginBottom: 4,
        lineHeight: 20,
    },
    activityTime: {
        fontSize: typography.fontSize.xs,
        color: colors.text.tertiary,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 48, // Replaced spacing['4xl']
    },
    emptyText: {
        marginTop: spacing.md,
        color: colors.text.tertiary,
        fontSize: typography.fontSize.base,
    },
});
