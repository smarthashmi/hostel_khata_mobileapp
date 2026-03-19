import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Dimensions,
    Alert,
    Platform,
    Linking
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import theme from '../config/theme';
import apiMethods from '../services/apiMethods';
import * as Clipboard from 'expo-clipboard';
import { ENV } from '../config/env';
import { useAuth } from '../contexts/AuthContext';

const safeTheme = theme || {};
const colors = safeTheme.colors || {
    primary: { main: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED'], light: '#F3E8FF' },
    secondary: { main: '#06B6D4', gradient: ['#06B6D4', '#0891B2'], light: '#CFFAFE' },
    background: { primary: '#FFFFFF', secondary: '#F9FAFB' },
    text: { primary: '#000', secondary: '#4B5563', tertiary: '#9CA3AF', inverse: '#FFF' },
    neutral: { gray: { '200': '#E5E7EB', '300': '#D1D5DB', '600': '#4B5563' } },
    accent: { emerald: '#10B981', error: '#EF4444' },
    error: '#EF4444', info: '#3B82F6', warning: '#F59E0B'
} as any;
const { spacing, typography, borderRadius, shadows } = safeTheme as any;

const { width } = Dimensions.get('window');
const GRID_ITEM_WIDTH = (width - (spacing.lg * 2) - spacing.md) / 2;

export default function GroupDetailsScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { groupId, groupName } = route.params;
    const { user } = useAuth();

    const [group, setGroup] = useState<any>(null);
    const [stats, setStats] = useState({
        poolBalance: 0,
        memberCount: 0,
        transactionCount: 0,
        totalExpenses: 0
    });
    const [activity, setActivity] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            fetchGroupDetails();
        }, [groupId])
    );

    const fetchGroupDetails = async () => {
        try {
            setIsLoading(true);
            const groupRes = await apiMethods.group.getById(groupId);
            if (groupRes.data.success) {
                const g = groupRes.data.data;
                setGroup(g);

                // Map backend response to stats
                // Backend returns: totalPoolBalance, members array, _count object
                setStats({
                    poolBalance: parseFloat(g.totalPoolBalance || '0'),
                    memberCount: g.members?.length || 0,
                    transactionCount: 0, // Will update from stats
                    totalExpenses: 0 // Will update from stats
                });

                // 2. Fetch Accurate Statistics (Logic from Web)
                // Web uses transactionApi.getExpenseStatistics(groupId)
                const statsRes = await apiMethods.transaction.getStatistics(groupId);
                if (statsRes.data.success) {
                    const s = statsRes.data.data;
                    setStats(prev => ({
                        ...prev,
                        transactionCount: s.totalCount || 0,
                        totalExpenses: parseFloat(s.totalExpenses || '0')
                    }));
                }

                // 3. Fetch Recent Activity
                const activityRes = await apiMethods.activity.getGroupActivity(groupId, { limit: 5 });
                if (activityRes.data.success) {
                    const acts = Array.isArray(activityRes.data.data) ? activityRes.data.data : (activityRes.data.data.transactions || []);
                    setActivity(acts);
                }
            }
        } catch (error) {
            console.error('Error fetching group details:', error);
            Alert.alert('Error', 'Failed to load group details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFeatureNotImplemented = (feature: string) => {
        Alert.alert('Coming Soon', `${feature} is currently under development.`);
    };

    const handleDownloadReport = async (type: 'TRANSACTIONS' | 'BALANCES' | 'BACKUP') => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                Alert.alert('Error', 'You must be logged in to download reports');
                return;
            }

            let url = '';
            const API_BASE = ENV.API_URL;

            if (type === 'TRANSACTIONS') {
                url = `${API_BASE}/analytics/reports/transactions/${groupId}/csv?token=${token}`;
            } else if (type === 'BALANCES') {
                url = `${API_BASE}/analytics/reports/balances/${groupId}/csv?token=${token}`;
            } else if (type === 'BACKUP') {
                url = `${API_BASE}/analytics/reports/backup/${groupId}?token=${token}`;
            }

            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Error', 'Cannot open release url');
            }
        } catch (error) {
            console.error('Download error:', error);
            Alert.alert('Error', 'Failed to initiate download');
        }
    };

    const showReportOptions = () => {
        Alert.alert(
            'Download Report',
            'Select a report type to download',
            [
                { text: 'Transactions (CSV)', onPress: () => handleDownloadReport('TRANSACTIONS') },
                { text: 'Balances (CSV)', onPress: () => handleDownloadReport('BALANCES') },
                { text: 'Full Backup (JSON)', onPress: () => handleDownloadReport('BACKUP') },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    };

    const handleCopyInviteCode = async () => {
        if (group?.code) {
            await Clipboard.setStringAsync(group.code);
            Alert.alert('Copied!', `Invite code ${group.code} copied to clipboard`);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary.main} />
            </View>
        );
    }

    const gradientColors = colors.primary.gradient as unknown as readonly [string, string, ...string[]];

    const MenuGridItem = ({ icon, label, onPress, color, bgColor }: any) => (
        <TouchableOpacity style={styles.gridItem} onPress={onPress}>
            <View style={[styles.gridIcon, { backgroundColor: bgColor }]}>
                <Feather name={icon} size={24} color={color} />
            </View>
            <Text style={styles.gridLabel}>{label}</Text>
            {/* <Text style={styles.gridSubLabel}>View details</Text> */}
        </TouchableOpacity>
    );

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
                        <Text style={styles.headerTitle}>{groupName}</Text>
                        <TouchableOpacity style={styles.codeContainer} onPress={handleCopyInviteCode}>
                            <Text style={styles.headerSubtitle}>Code: {group?.code || 'N/A'}</Text>
                            <Feather name="copy" size={14} color="rgba(255,255,255,0.7)" style={{ marginLeft: 6 }} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={styles.settingsButton}
                        onPress={() => navigation.navigate('GroupSettings', {
                            groupId,
                            groupName,
                            currentCurrencyId: group?.currency?.id
                        })}
                    >
                        <Feather name="settings" size={24} color={colors.text.inverse} />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* 1. Stats Row */}
                <View style={styles.statsRow}>
                    {group?.type === 'POOL_SYSTEM' ? (
                        <View style={styles.statCard}>
                            <Text style={styles.statLabel}>Pool Balance</Text>
                            <Text style={[styles.statValue, { color: colors.accent.emerald }]}>
                                {group?.defaultCurrency?.symbol || '$'}{stats.poolBalance.toFixed(2)}
                            </Text>
                            <View style={styles.statIconAb}>
                                <Feather name="briefcase" size={16} color={colors.accent.emerald} />
                            </View>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.statCard}
                            onPress={() => navigation.navigate('Balances', { groupId, groupName })}
                        >
                            <Text style={styles.statLabel}>Your Balance</Text>
                            <Text style={[styles.statValue, {
                                color: (() => {
                                    const myBal = parseFloat(group?.members?.find((m: any) => m.user?.id === user?.id)?.currentBalance || '0');
                                    if (Math.abs(myBal) < 0.01) return colors.text.primary;
                                    return myBal > 0 ? colors.accent.emerald : colors.error;
                                })()
                            }]}>
                                {(() => {
                                    const myBal = parseFloat(group?.members?.find((m: any) => m.user?.id === user?.id)?.currentBalance || '0');
                                    if (Math.abs(myBal) < 0.01) return `${group?.defaultCurrency?.symbol || '$'}0.00`;
                                    return `${myBal > 0 ? '+' : '-'}${group?.defaultCurrency?.symbol || '$'}${Math.abs(myBal).toFixed(2)}`;
                                })()}
                            </Text>
                            <View style={styles.statIconAb}>
                                <Feather name="pie-chart" size={16} color={colors.primary.main} />
                            </View>
                        </TouchableOpacity>
                    )}
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Members</Text>
                        <Text style={styles.statValue}>{stats.memberCount}</Text>
                        <View style={styles.statIconAb}>
                            <Feather name="users" size={16} color={colors.primary.main} />
                        </View>
                    </View>
                </View>
                <View style={styles.statsRow}>
                    <TouchableOpacity
                        style={styles.statCard}
                        onPress={() => navigation.navigate('Ledger', { groupId, groupName, currencySymbol: group?.defaultCurrency?.symbol })}
                    >
                        <Text style={styles.statLabel}>Transactions</Text>
                        <Text style={styles.statValue}>{stats.transactionCount}</Text>
                        <View style={styles.statIconAb}>
                            <Feather name="list" size={16} color={colors.secondary.main} />
                        </View>
                    </TouchableOpacity>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Total Expenses</Text>
                        <Text style={[styles.statValue, { color: colors.error }]}>
                            {group?.defaultCurrency?.symbol || '$'}{stats.totalExpenses.toFixed(2)}
                        </Text>
                        <View style={styles.statIconAb}>
                            <Feather name="trending-down" size={16} color={colors.error} />
                        </View>
                    </View>
                </View>

                {/* 2. Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActionRow}>
                        {/* Deposit (Pool Only) */}
                        {group?.type === 'POOL_SYSTEM' && (
                            <TouchableOpacity
                                style={[styles.quickActionButton, { backgroundColor: colors.accent.emerald }]}
                                onPress={() => navigation.navigate('AddFund', { groupId, groupName, currencySymbol: group?.currency?.symbol })}
                                activeOpacity={0.9}
                            >
                                <View style={styles.qaIcon}>
                                    <Feather name="plus" size={24} color="#fff" />
                                </View>
                                <View>
                                    <Text style={styles.qaTitle}>Add Deposit</Text>
                                    <Text style={styles.qaSubtitle}>Add money to pool</Text>
                                </View>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.quickActionButton, { backgroundColor: colors.error }]} // Solid red
                            onPress={() => navigation.navigate('AddExpense', { groupId, groupName, currencySymbol: group?.currency?.symbol })}
                            activeOpacity={0.9}
                        >
                            <View style={styles.qaIcon}>
                                <Feather name="dollar-sign" size={24} color="#fff" />
                            </View>
                            <View>
                                <Text style={styles.qaTitle}>Add Expense</Text>
                                <Text style={styles.qaSubtitle}>Record new expense</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Settle Up (Expense Tracking Only) */}
                        {group?.type === 'EXPENSE_TRACKING' && (
                            <TouchableOpacity
                                style={[styles.quickActionButton, { backgroundColor: colors.accent.emerald }]}
                                onPress={() => navigation.navigate('Balances', { groupId, groupName })}
                                activeOpacity={0.9}
                            >
                                <View style={styles.qaIcon}>
                                    <Feather name="check-circle" size={24} color="#fff" />
                                </View>
                                <View>
                                    <Text style={styles.qaTitle}>Settle Up</Text>
                                    <Text style={styles.qaSubtitle}>Pay balances</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* 3. Grid Menu */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Menu</Text>
                    <View style={styles.gridContainer}>
                        <MenuGridItem
                            icon="list"
                            label="Transaction History"
                            color={colors.primary.main}
                            bgColor={colors.primary.light}
                            onPress={() => navigation.navigate('Ledger', { groupId, groupName })}
                        />
                        <MenuGridItem
                            icon="book"
                            label="Transaction Ledger"
                            color={colors.secondary.main}
                            bgColor={colors.secondary.light}
                            onPress={() => navigation.navigate('Ledger', { groupId, groupName })}
                        />
                        <MenuGridItem
                            icon="bar-chart-2"
                            label="Balances & Settlements"
                            color={colors.info}
                            bgColor={colors.info + '20'}
                            onPress={() => navigation.navigate('Balances', { groupId, groupName })}
                        />
                        <MenuGridItem
                            icon="pie-chart"
                            label="Analytics"
                            color={colors.warning}
                            bgColor={colors.warning + '20'}
                            onPress={() => navigation.navigate('Analytics', { groupId, groupName })}
                        />
                        <MenuGridItem
                            icon="activity"
                            label="Activity Log"
                            color={colors.neutral.gray[600]}
                            bgColor={colors.neutral.gray[200]}
                            onPress={() => navigation.navigate('ActivityLog', { groupId, groupName })}
                        />
                        <MenuGridItem
                            icon="bell"
                            label="Payment Reminders"
                            color={colors.primary.main}
                            bgColor={colors.primary.light}
                            onPress={() => handleFeatureNotImplemented('Reminders')}
                        />
                        <MenuGridItem
                            icon="target"
                            label="Budget Management"
                            color={colors.accent.emerald}
                            bgColor={colors.accent.emerald + '20'}
                            onPress={() => navigation.navigate('BudgetManagement', { groupId, groupName })}
                        />
                        <MenuGridItem
                            icon="file-text"
                            label="Reports"
                            color={colors.error}
                            bgColor={colors.error + '20'}
                            onPress={() => navigation.navigate('Reports', { groupId, groupName })}
                        />
                        {/* 
                        <MenuGridItem
                            icon="package"
                            label="Inventory"
                            color={colors.secondary.main}
                            bgColor={colors.secondary.light}
                            onPress={() => navigation.navigate('Inventory', { groupId, groupName })}
                        /> 
                        */}
                    </View>
                </View>

                {/* 4. Members Preview (Optional but requested structure) */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Members</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('AddMember', { groupId, groupName, groupCode: group?.code })}>
                            <Text style={styles.seeAll}>+ Add Member</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 10 }}>
                        {group?.members?.map((m: any, i: number) => (
                            <View key={i} style={styles.memberCard}>
                                <View style={styles.memberAvatar}>
                                    <Text style={styles.memberInitial}>{m.user?.name?.charAt(0)}</Text>
                                </View>
                                <Text style={styles.memberName} numberOfLines={1}>{m.user?.name}</Text>
                                <Text style={styles.memberRole}>{m.role}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* 5. Recent Activity (New Section) */}
                <View style={[styles.section, { marginBottom: 30 }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Activity</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('ActivityLog', { groupId, groupName })}>
                            <Text style={styles.seeAll}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {activity.length > 0 ? (
                        activity.map((item, index) => (
                            <View key={index} style={styles.activityCard}>
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
                                        {item.payer?.name || 'Unknown'} • {new Date(item.transactionDate || item.createdAt).toLocaleDateString()}
                                    </Text>
                                </View>
                                <Text style={[styles.activityAmount, {
                                    color: item.type === 'DEPOSIT' ? colors.accent.emerald : colors.text.primary
                                }]}>
                                    {item.type === 'EXPENSE' ? '-' : '+'}${parseFloat(item.amount).toFixed(2)}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyText}>No recent activity</Text>
                        </View>
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.secondary,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 60 : 50,
        paddingBottom: 30,
        paddingHorizontal: spacing.lg,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: 'bold',
        color: colors.text.inverse,
    },
    codeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 4,
        alignSelf: 'flex-start',
    },
    headerSubtitle: {
        fontSize: typography.fontSize.xs,
        color: colors.text.inverse,
        fontWeight: '600',
    },
    backButton: { padding: 4 },
    settingsButton: { padding: 4 },
    scrollContent: {
        paddingTop: spacing.lg,
        paddingHorizontal: spacing.md,
    },
    // Stats
    statsRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.background.primary,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        ...shadows.sm,
        position: 'relative',
    },
    statLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.text.secondary,
        marginBottom: 4,
        fontWeight: '500',
    },
    statValue: {
        fontSize: 24, // Increased from lg
        fontWeight: 'bold',
        color: colors.text.primary,
        marginVertical: 4,
    },
    statIconAb: {
        position: 'absolute',
        top: spacing.md,
        right: spacing.md,
        opacity: 0.8,
    },
    // Sections
    section: {
        marginTop: spacing.lg,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: spacing.md,
        marginLeft: spacing.xs,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
        marginLeft: spacing.xs,
        marginRight: spacing.xs,
    },
    seeAll: {
        fontSize: typography.fontSize.sm,
        color: colors.primary.main,
        fontWeight: '600',
    },
    // Quick Actions
    quickActionRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.xs,
    },
    quickActionButton: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.xl,
        ...shadows.md, // Add standard shadow
        borderWidth: 0, // Remove border
        minHeight: 120, // Taller button
    },
    qaIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)', // Semi-transparent white
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    qaTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: 'bold',
        color: '#FFFFFF', // Force white text
        textAlign: 'center',
        marginBottom: 2,
    },
    qaSubtitle: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.8)', // Force white text
        textAlign: 'center',
    },
    // Grid
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    gridItem: {
        width: GRID_ITEM_WIDTH,
        backgroundColor: colors.background.primary,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        alignItems: 'flex-start',
        ...shadows.sm,
        minHeight: 110,
    },
    gridIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    gridLabel: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.text.primary,
        marginTop: 'auto',
    },
    gridSubLabel: {
        fontSize: 10,
        color: colors.text.tertiary,
    },
    // Members
    memberCard: {
        alignItems: 'center',
        marginRight: spacing.lg,
        width: 70,
    },
    memberAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.primary.light,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    memberInitial: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary.main,
    },
    memberName: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.text.primary,
        textAlign: 'center',
    },
    memberRole: {
        fontSize: 10,
        color: colors.text.tertiary,
    },
    // Activity Card (Reuse)
    activityCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.primary,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
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
        fontSize: typography.fontSize.base,
        fontWeight: '600',
    },
    emptyCard: {
        padding: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.neutral.gray[100],
        borderRadius: borderRadius.md,
    },
    emptyText: {
        color: colors.text.tertiary,
        fontSize: typography.fontSize.sm,
    },
});
