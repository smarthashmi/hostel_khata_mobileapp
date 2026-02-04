import React, { useEffect, useState } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../config/theme';
import apiMethods from '../services/apiMethods';
import * as Clipboard from 'expo-clipboard';

const { width } = Dimensions.get('window');
const GRID_ITEM_WIDTH = (width - (spacing.lg * 2) - spacing.md) / 2;

export default function GroupDetailsScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { groupId, groupName } = route.params;

    const [group, setGroup] = useState<any>(null);
    const [stats, setStats] = useState({
        poolBalance: 0,
        memberCount: 0,
        transactionCount: 0,
        totalExpenses: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchGroupDetails();
    }, [groupId]);

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
                    transactionCount: g._count?.transactions || 0,
                    totalExpenses: parseFloat(g.totalExpenses || '0')
                });
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
            // Determine API URL based on environment (should match api.ts)
            const API_BASE = 'https://api-hostelkhata.xivra.pk/api';

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
                    <TouchableOpacity style={styles.settingsButton} onPress={() => handleFeatureNotImplemented('Settings')}>
                        <Feather name="settings" size={24} color={colors.text.inverse} />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* 1. Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Pool Balance</Text>
                        <Text style={[styles.statValue, { color: colors.accent.emerald }]}>
                            {group?.defaultCurrency?.symbol || '$'}{stats.poolBalance.toFixed(2)}
                        </Text>
                        <View style={styles.statIconAb}>
                            <Feather name="briefcase" size={16} color={colors.accent.emerald} />
                        </View>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Members</Text>
                        <Text style={styles.statValue}>{stats.memberCount}</Text>
                        <View style={styles.statIconAb}>
                            <Feather name="users" size={16} color={colors.primary.main} />
                        </View>
                    </View>
                </View>
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Transactions</Text>
                        <Text style={styles.statValue}>{stats.transactionCount}</Text>
                        <View style={styles.statIconAb}>
                            <Feather name="list" size={16} color={colors.secondary.main} />
                        </View>
                    </View>
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
                        {/* Deposit (Pool Only or All?) User said "Pool Group" has Deposit, implies non-pool might not. 
                            But "Pool Balance" is shown in Stats, so we assume Pool logic broadly available or checked. */}
                        {group?.type === 'POOL_SYSTEM' && (
                            <TouchableOpacity
                                style={[styles.quickActionButton, { backgroundColor: colors.accent.emerald + '15', borderColor: colors.accent.emerald }]}
                                onPress={() => navigation.navigate('AddFund', { groupId, groupName, currencySymbol: group?.currency?.symbol })}
                            >
                                <View style={[styles.qaIcon, { backgroundColor: colors.accent.emerald }]}>
                                    <Feather name="plus" size={20} color="#fff" />
                                </View>
                                <View>
                                    <Text style={[styles.qaTitle, { color: colors.accent.emerald }]}>Add Deposit</Text>
                                    <Text style={styles.qaSubtitle}>Add money to pool</Text>
                                </View>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.quickActionButton, { backgroundColor: colors.error + '15', borderColor: colors.error }]}
                            onPress={() => navigation.navigate('AddExpense', { groupId, groupName, currencySymbol: group?.currency?.symbol })}
                        >
                            <View style={[styles.qaIcon, { backgroundColor: colors.error }]}>
                                <Feather name="dollar-sign" size={20} color="#fff" />
                            </View>
                            <View>
                                <Text style={[styles.qaTitle, { color: colors.error }]}>Add Expense</Text>
                                <Text style={styles.qaSubtitle}>Record new expense</Text>
                            </View>
                        </TouchableOpacity>
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
                            bgColor={colors.error + '20'} // Red for PDF/Excel
                            onPress={showReportOptions}
                        />
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
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        color: colors.text.primary,
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
    },
    quickActionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        backgroundColor: colors.background.primary,
    },
    qaIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    qaTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: 'bold',
    },
    qaSubtitle: {
        fontSize: 10,
        color: colors.text.tertiary,
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
});
