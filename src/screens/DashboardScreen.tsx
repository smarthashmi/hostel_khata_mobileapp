import React, { useEffect, useState } from 'react';
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
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../config/theme';
import { useAuth } from '../contexts/AuthContext';
import apiMethods from '../services/apiMethods';
import { Feather } from '@expo/vector-icons';
import { usePushNotifications } from '../hooks/usePushNotifications';

export default function DashboardScreen() {
    const navigation = useNavigation<any>();
    const isFocused = useIsFocused();
    const { user } = useAuth();

    // State
    const [groups, setGroups] = useState<any[]>([]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [totalPoolBalance, setTotalPoolBalance] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Initialize Push Notifications
    usePushNotifications();

    // Fetch Dashboard Data
    const fetchData = async () => {
        try {
            // 1. Fetch Groups
            const groupsRes = await apiMethods.group.getAll();
            if (groupsRes.data.success && Array.isArray(groupsRes.data.data)) {
                // Take top 3 groups for dashboard
                setGroups(groupsRes.data.data.slice(0, 3));

                // Calculate Totals using reduce safely
                // Backend now sends poolBalance and totalExpense pre-calculated or mapped
                const balance = groupsRes.data.data.reduce((acc: number, g: any) => acc + (parseFloat(g.poolBalance) || 0), 0);
                const expense = groupsRes.data.data.reduce((acc: number, g: any) => acc + (parseFloat(g.totalExpense) || 0), 0);

                setTotalPoolBalance(balance);
                setTotalExpense(expense);
            } else {
                setGroups([]);
                setTotalPoolBalance(0);
                setTotalExpense(0);
            }

            // 2. Fetch Recent Transactions
            // Since we don't have a global "recent transactions" endpoint in apiMethods yet, 
            // we will fetch from the first group if available as a quick fix, or leave as empty with a comment.
            // A better approach for the future: backend endpoint /transactions/recent

            if (groupsRes.data.data && groupsRes.data.data.length > 0) {
                // Try to fetch activity for the first group to show *something*
                // Ideally we want aggregated activity.
                // const activityRes = await apiMethods.activity.getGroupActivity(groupsRes.data.data[0].id);
                // if (activityRes.data.success) {
                //    setRecentActivity(activityRes.data.data.slice(0, 5));
                // }
            }

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

    const gradientColors = colors.primary.gradient as unknown as readonly [string, string, ...string[]];

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
                            {/* Optional: Add Red Dot if unread exists */}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.profileButton}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        <View style={styles.profileCircle}>
                            {(user as any)?.avatar ? (
                                // Use Image if available
                                <Text style={styles.profileInitial}>{user.name?.charAt(0)}</Text>
                            ) : (
                                <Text style={styles.profileInitial}>{user?.name?.charAt(0) || 'U'}</Text>
                            )}
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
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Total Pool Balance</Text>
                        {/* Placeholder Data - connect to real aggregation if available */}
                        <Text style={[styles.statValue, { color: colors.accent.emerald }]}>${totalPoolBalance.toFixed(2)}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Total Expense</Text>
                        <Text style={[styles.statValue, { color: colors.text.primary }]}>${totalExpense.toFixed(2)}</Text>
                    </View>
                </View>

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
                                    <View style={[styles.groupIcon, { backgroundColor: colors.primary.light }]}>
                                        <Text style={styles.groupEmoji}>
                                            {/* Use currency symbol as icon if available, else initial */}
                                            {group.defaultCurrency?.symbol || group.name.charAt(0).toUpperCase()}
                                        </Text>
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

                {/* Recent Activity (Placeholder for now) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>

                    {recentActivity.length > 0 ? (
                        recentActivity.map((item, index) => (
                            <View key={index} style={styles.groupCard}>
                                <Text>{item.description} - ${item.amount}</Text>
                            </View>
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
    },
    statLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.text.secondary,
        fontWeight: '600' as any,
        marginBottom: 4,
    },
    statValue: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold' as any,
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
});
