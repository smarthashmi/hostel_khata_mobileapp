import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Platform,
    StatusBar,
    RefreshControl,
    ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useIsFocused, useFocusEffect } from '@react-navigation/native';
import theme from '../config/theme';
import { useAuth } from '../contexts/AuthContext';
import apiMethods from '../services/apiMethods';
import { Feather } from '@expo/vector-icons';
import { usePushNotifications } from '../hooks/usePushNotifications';

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

export default function DashboardScreen() {
    const navigation = useNavigation<any>();
    const isFocused = useIsFocused();
    const { user } = useAuth();

    // State
    const [groups, setGroups] = useState<any[]>([]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [totalPoolBalance, setTotalPoolBalance] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);
    const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

    // Initialize Push Notifications
    usePushNotifications();

    useFocusEffect(
        useCallback(() => {
            fetchData();
            fetchUnreadCount();
        }, [])
    );

    // Auto-refresh polling effect
    useEffect(() => {
        if (!isFocused || !autoRefreshEnabled) return;

        const interval = setInterval(() => {
            fetchData();
            fetchUnreadCount();
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [isFocused, autoRefreshEnabled]);

    const fetchUnreadCount = async () => {
        try {
            const response = await apiMethods.notification.getUnreadCount();
            if (response.data.success) {
                setUnreadCount(response.data.data?.count || 0);
            }
        } catch (error) {
            console.log('Failed to fetch unread count', error);
        }
    };

    const fetchData = async () => {
        try {
            // 1. Fetch Groups
            const groupsRes = await apiMethods.group.getAll();
            if (groupsRes.data.success && Array.isArray(groupsRes.data.data)) {
                // Take top 3 groups for dashboard
                setGroups(groupsRes.data.data.slice(0, 3));
                const groupData = groupsRes.data.data;
                setGroups(groupData.slice(0, 3));

                // Calculate Totals: Pool Balance is usually in list, but Expenses need detail
                let pool = 0;
                let expenses = 0;

                // 1. Sum Pool Balance from list
                const activeGroups = groupsRes.data.data;
                activeGroups.forEach((g: any) => {
                    pool += parseFloat(g.totalPoolBalance || g.poolBalance || '0');
                });

                // 2. Fetch specific stats for top groups to get accurate Total Expenses
                // (Since list endpoint might not have totalExpenses)
                const statsPromises = activeGroups.slice(0, 5).map((g: any) =>
                    apiMethods.transaction.getStatistics(g.id).catch(() => null)
                );

                const statsResults = await Promise.all(statsPromises);

                statsResults.forEach((res: any) => {
                    if (res && res.data && res.data.success) {
                        const s = res.data.data;
                        expenses += parseFloat(s.totalExpenses || '0');
                    }
                });

                setTotalPoolBalance(pool);
                setTotalExpense(expenses);
            } else {
                setGroups([]);
                setTotalPoolBalance(0);
                setTotalExpense(0);
            }

            // 2. Fetch Recent Transactions (Global)
            try {
                const activityRes = await apiMethods.transaction.getRecentTransactions(5);
                if (activityRes.data.success) {
                    setRecentActivity(activityRes.data.data || []);
                }
            } catch (err) {
                console.log("Failed to fetch recent activity", err);
            }

            // 3. Fetch Pending Invitations
            try {
                const invRes = await apiMethods.invitation.getPendingInvitations();
                if (invRes.data.success) {
                    setPendingInvitations(invRes.data.data || []);
                }
            } catch (err) {
                console.log("Failed to fetch pending invitations", err);
            }

            // 4. Fetch unread notification count
            await fetchUnreadCount();

            // Update last refresh time
            setLastUpdated(new Date());

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setGroups([]);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (isFocused) {
            fetchData();
        }
    }, [isFocused]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning,';
        if (hour < 18) return 'Good Afternoon,';
        return 'Good Evening,';
    };

    const gradientColors = (colors?.primary?.gradient || ['#8B5CF6', '#7C3AED']) as unknown as readonly [string, string, ...string[]];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header with Gradient */}
            <LinearGradient
                colors={gradientColors}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.headerContent}>
                    <Text style={styles.userName}>{user?.name || 'User'}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity
                        style={styles.profileButton}
                        onPress={() => navigation.navigate('Notifications')}
                    >
                        <View style={styles.iconCircle}>
                            <Feather name="bell" size={20} color={colors.text.inverse} />
                            {unreadCount > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.profileButton}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        <View style={styles.profileCircle}>
                            <Text style={styles.profileInitial}>{user?.name?.charAt(0) || 'U'}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </LinearGradient >

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.main} />
                }
            >
                {/* Stats Section */}
                <View style={styles.statsContainer}>
                    <TouchableOpacity
                        style={[styles.statCard, { borderTopColor: colors.accent.emerald }]}
                        activeOpacity={groups.length > 0 ? 0.8 : 1}
                        onPress={() => {
                            if (groups.length > 0) {
                                navigation.navigate('Analytics', { groupId: groups[0]?.id });
                            }
                        }}
                        disabled={groups.length === 0}
                    >
                        <View style={[styles.statIconContainer, { backgroundColor: colors.accent.emerald + '15' }]}>
                            <Feather name="briefcase" size={20} color={colors.accent.emerald} />
                        </View>
                        <Text style={styles.statLabel}>Pool Balance</Text>
                        <Text style={[styles.statValue, { color: colors.accent.emerald }]}>
                            {groups[0]?.defaultCurrency?.symbol || '$'}{totalPoolBalance.toFixed(2)}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.statCard, { borderTopColor: colors.primary.main }]}
                        activeOpacity={groups.length > 0 ? 0.8 : 1}
                        onPress={() => {
                            if (groups.length > 0) {
                                navigation.navigate('Analytics', { groupId: groups[0]?.id });
                            }
                        }}
                        disabled={groups.length === 0}
                    >
                        <View style={[styles.statIconContainer, { backgroundColor: colors.primary.main + '15' }]}>
                            <Feather name="trending-up" size={20} color={colors.primary.main} />
                        </View>
                        <Text style={styles.statLabel}>Total Expense</Text>
                        <Text style={[styles.statValue, { color: colors.text.primary }]}>
                            {groups[0]?.defaultCurrency?.symbol || '$'}{totalExpense.toFixed(2)}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Pending Invitations Banner */}
                {pendingInvitations.length > 0 && (
                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: colors.primary.gradient[1], marginHorizontal: spacing.lg, marginTop: spacing.md, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md }]}
                        onPress={() => navigation.navigate('Invitations')}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}>
                            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                                <Feather name="user-plus" size={20} color={colors.text.inverse} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: colors.text.inverse, fontWeight: 'bold', fontSize: typography.fontSize.md }}>
                                    {pendingInvitations.length} Pending Invite{pendingInvitations.length > 1 ? 's' : ''}!
                                </Text>
                                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: typography.fontSize.xs, marginTop: 2 }}>
                                    Tap to view and respond
                                </Text>
                            </View>
                        </View>
                        <Feather name="chevron-right" size={24} color={colors.text.inverse} />
                    </TouchableOpacity>
                )}

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: colors.primary.main }]}
                        onPress={() => navigation.navigate('CreateGroup')}
                    >
                        <View style={styles.actionIcon}>
                            <Feather name="plus-circle" size={32} color={colors.text.inverse} />
                        </View>
                        <Text style={styles.actionText}>Create Group</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: colors.secondary.main }]}
                        onPress={() => navigation.navigate('JoinGroup')}
                    >
                        <View style={styles.actionIcon}>
                            <Feather name="link" size={32} color={colors.text.inverse} />
                        </View>
                        <Text style={styles.actionText}>Join Group</Text>
                    </TouchableOpacity>
                </View>

                {/* Your Groups */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Your Groups</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Groups')}>
                            <Text style={styles.seeAll}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {isLoading ? (
                        <ActivityIndicator color={colors.primary.main} />
                    ) : (Array.isArray(groups) && groups.length > 0) ? (
                        groups.map((group) => (
                            <TouchableOpacity
                                key={group.id}
                                style={styles.groupCard}
                                activeOpacity={0.7}
                                onPress={() => navigation.navigate('GroupDetails', { groupId: group.id, groupName: group.name })}
                            >
                                <View style={styles.groupCardContent}>
                                    <View style={[styles.groupIcon, { backgroundColor: group.type === 'POOL_SYSTEM' ? colors.primary.light : colors.secondary.light }]}>
                                        <Feather
                                            name={group.type === 'POOL_SYSTEM' ? 'layers' : 'list'}
                                            size={20}
                                            color={group.type === 'POOL_SYSTEM' ? colors.primary.main : colors.secondary.main}
                                        />
                                    </View>

                                    <View style={styles.groupInfo}>
                                        <Text style={styles.groupName}>{group.name}</Text>
                                        <Text style={styles.groupMembers}>{group._count?.members || 1} members</Text>
                                    </View>

                                    <View style={styles.groupBalance}>
                                        <Text style={{ fontWeight: 'bold', color: colors.text.primary }}>
                                            {group.defaultCurrency?.symbol || '$'}{parseFloat(group.poolBalance || 0).toFixed(2)}
                                        </Text>
                                        <Feather name="chevron-right" size={20} color={colors.text.tertiary} />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyText}>No groups yet. Join or create one!</Text>
                        </View>
                    )}
                </View>

                {/* Recent Activity */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>

                    {recentActivity.length > 0 ? (
                        recentActivity.map((item, index) => (
                            <TouchableOpacity
                                key={item.id || index}
                                style={styles.activityCard}
                                onPress={() => {
                                    if (item.groupId) {
                                        navigation.navigate('GroupDetails', { groupId: item.groupId, groupName: item.group?.name });
                                    }
                                }}
                            >
                                <View style={[styles.activityIcon, {
                                    backgroundColor: item.type === 'DEPOSIT' ? colors.accent.emerald + '20' : colors.primary.light
                                }]}>
                                    <Feather
                                        name={item.type === 'DEPOSIT' ? 'arrow-down-left' : 'arrow-up-right'}
                                        size={18}
                                        color={item.type === 'DEPOSIT' ? colors.accent.emerald : colors.primary.main}
                                    />
                                </View>
                                <View style={styles.activityInfo}>
                                    <Text style={styles.activityDesc} numberOfLines={1}>
                                        {item.description || item.type}
                                    </Text>
                                    <Text style={styles.activityMeta}>
                                        {item.payer?.name || 'Unknown'} • {item.group?.name}
                                    </Text>
                                </View>
                                <Text style={[styles.activityAmount, {
                                    color: item.type === 'DEPOSIT' ? colors.accent.emerald : colors.text.primary
                                }]}>
                                    {item.type === 'EXPENSE' ? '-' : '+'}${parseFloat(item.amount).toFixed(2)}
                                </Text>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyCard}>
                            <Feather name="activity" size={24} color={colors.text.tertiary} style={{ marginBottom: 8 }} />
                            <Text style={styles.emptyText}>No recent activity</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Floating Action Button - Could be used for "Quick Expense" later */}
            {/* <TouchableOpacity style={styles.fab} activeOpacity={0.9}>
                <LinearGradient
                    colors={colors.primary.gradient}
                    style={styles.fabGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Feather name="dollar-sign" size={32} color={colors.text.inverse} />
                </LinearGradient>
            </TouchableOpacity> */}
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.secondary,
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 20) + 10,
        paddingBottom: spacing.xl,
        paddingHorizontal: spacing.lg,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greeting: {
        fontSize: typography.fontSize.sm,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: typography.fontWeight.medium as any,
    },
    userName: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.black as any,
        color: colors.text.inverse,
        marginTop: spacing.xs,
    },
    profileButton: {
        padding: spacing.xs,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    profileInitial: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold as any,
        color: colors.text.inverse,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    quickActions: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        gap: spacing.md,
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        marginTop: -30, // Pull up to overlap header slightly if desired, or just margin
        gap: spacing.md,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.background.primary,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        ...shadows.md,
        alignItems: 'center',
        borderTopWidth: 4, // Colored Accent
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    statLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.text.secondary,
        fontWeight: '600',
        marginBottom: 2,
    },
    statValue: {
        fontSize: 22, // Large bold text
        fontWeight: 'bold',
        marginBottom: 2,
    },
    actionCard: {
        flex: 1,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        alignItems: 'center',
        ...shadows.md,
    },
    actionIcon: {
        marginBottom: spacing.sm,
    },
    actionText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold as any,
        color: colors.text.inverse,
    },
    section: {
        paddingHorizontal: spacing.lg,
        marginTop: spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.black as any,
        color: colors.text.primary,
    },
    seeAll: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold as any,
        color: colors.primary.main,
    },
    groupCard: {
        backgroundColor: colors.background.primary,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    groupCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    groupIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    groupEmoji: {
        fontSize: 24,
        fontWeight: 'bold' as any,
        color: colors.primary.main,
    },
    groupInfo: {
        flex: 1,
    },
    groupName: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold as any,
        color: colors.text.primary,
        marginBottom: 2,
    },
    groupMembers: {
        fontSize: typography.fontSize.xs,
        color: colors.text.tertiary,
        fontWeight: typography.fontWeight.medium as any,
    },
    groupBalance: {
        alignItems: 'flex-end',
    },
    emptyCard: {
        padding: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background.primary,
        borderRadius: borderRadius.lg,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: colors.neutral.gray[300],
    },
    emptyText: {
        color: colors.text.tertiary,
        marginTop: spacing.sm,
    },
    fab: {
        position: 'absolute',
        bottom: spacing.xl,
        right: spacing.lg,
        borderRadius: 32,
        ...shadows.xl,
    },
    fabGradient: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badge: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: colors.accent.error,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 3,
        borderWidth: 1,
        borderColor: colors.primary.main,
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    // Activity Card
    activityCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.primary,
        padding: spacing.md,
        borderRadius: borderRadius.lg, // Make it rounder like web
        marginBottom: spacing.sm,
        ...shadows.sm,
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    activityInfo: {
        flex: 1,
    },
    activityDesc: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: 2,
    },
    activityMeta: {
        fontSize: 11,
        color: colors.text.tertiary,
    },
    activityAmount: {
        fontSize: typography.fontSize.sm,
        fontWeight: 'bold',
    },
});
