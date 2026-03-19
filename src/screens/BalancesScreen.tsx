import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
    Alert,
    ToastAndroid,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import theme from '../config/theme';
import apiMethods from '../services/apiMethods';
import { useAuth } from '../contexts/AuthContext';

const safeTheme = theme || {};
const colors = safeTheme.colors || {
    primary: { main: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED'], light: '#F3E8FF' },
    secondary: { main: '#06B6D4', gradient: ['#06B6D4', '#0891B2'], light: '#CFFAFE' },
    background: { primary: '#FFFFFF', secondary: '#F9FAFB' },
    text: { primary: '#000', secondary: '#4B5563', tertiary: '#9CA3AF', inverse: '#FFF' },
    neutral: { gray: { '100': '#F3F4F6', '200': '#E5E7EB', '300': '#D1D5DB' }, white: '#FFFFFF' },
    accent: { emerald: '#10B981', error: '#EF4444', warning: '#F59E0B' },
    error: '#EF4444'
} as any;
const { spacing, typography, borderRadius, shadows } = safeTheme as any;

export default function BalancesScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { groupId, groupName } = route.params;
    const { user } = useAuth(); // Get current user

    const [balances, setBalances] = useState<any[]>([]);
    const [settlements, setSettlements] = useState<any[]>([]);
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'BALANCES' | 'SETTLEMENTS'>('BALANCES');

    useEffect(() => {
        fetchBalances();
    }, [groupId]);

    const fetchBalances = async () => {
        try {
            const [resBalances, resRequests] = await Promise.all([
                apiMethods.settlement.getBalances(groupId),
                apiMethods.settlement.getRequests(groupId, 'PENDING')
            ]);

            if (resBalances.data?.success) {
                setBalances(resBalances.data.data.balances || []);
                setSettlements(resBalances.data.data.suggestedSettlements || []);
            }
            if (resRequests.data?.success) {
                setPendingRequests(resRequests.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching balances:', error);
            if (Platform.OS === 'android') {
                ToastAndroid.show('Failed to load balances', ToastAndroid.SHORT);
            }
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchBalances();
    };

    const handleSettleUp = (settlement: any) => {
        navigation.navigate('SettleUp', {
            groupId,
            toUserId: settlement.toUserId,
            amount: settlement.amount,
            fromUserId: settlement.fromUserId,
            groupName
        });
    };

    const handleRemind = async (settlement: any) => {
        try {
            await apiMethods.settlement.nudge(groupId, settlement.fromUserId);
            Alert.alert('Reminder Sent', `A notification has been sent to ${settlement.fromUserName} to settle this debt.`);
        } catch (error) {
            Alert.alert('Error', 'Failed to send reminder. Try again later.');
        }
    };

    const handleProcessRequest = (requestId: number, action: 'ACCEPT' | 'REJECT') => {
        Alert.alert(
            action === 'ACCEPT' ? 'Accept Settlement' : 'Reject Settlement',
            `Are you sure you want to ${action.toLowerCase()} this settlement request?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        try {
                            const res = await apiMethods.settlement.process(requestId, action);
                            if (res.data.success) {
                                if (Platform.OS === 'android') {
                                    ToastAndroid.show(`Settlement ${action.toLowerCase()}ed`, ToastAndroid.SHORT);
                                }
                                fetchBalances(); // Refresh data
                            }
                        } catch (error: any) {
                            Alert.alert('Error', error.response?.data?.message || `Failed to ${action.toLowerCase()} request`);
                        }
                    }
                }
            ]
        );
    };

    const renderBalanceItem = ({ item }: { item: any }) => {
        const balanceVal = parseFloat(item.balance);
        const isPositive = balanceVal > 0;
        const isZero = Math.abs(balanceVal) < 0.01;

        // Dynamic styling
        const amountColor = isZero ? colors.text.secondary : (isPositive ? colors.accent.emerald : colors.error);
        const bgColor = isZero ? colors.neutral.gray[100] : (isPositive ? '#ECFDF5' : '#FEF2F2');
        const borderColor = isZero ? 'transparent' : (isPositive ? colors.accent.emerald : colors.error);

        return (
            <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: borderColor }]}>
                <View style={styles.memberRow}>
                    <View style={styles.memberInfo}>
                        <View style={[styles.avatar, { backgroundColor: isPositive ? colors.primary.light : colors.neutral.gray[200] }]}>
                            <Text style={[styles.avatarText, { color: isPositive ? colors.primary.main : colors.text.secondary }]}>
                                {item.user?.name?.charAt(0) || '?'}
                            </Text>
                        </View>
                        <View>
                            <Text style={styles.memberName}>
                                {item.user?.name || 'Unknown'}
                                {item.user?.id === user?.id && <Text style={{ color: colors.primary.main, fontWeight: 'bold' }}> (You)</Text>}
                            </Text>
                            <Text style={styles.memberEmail}>{item.user?.email}</Text>
                        </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[styles.amount, { color: amountColor }]}>
                            {isZero ? 'Settled' : (isPositive ? `+ $${balanceVal.toFixed(2)}` : `- $${Math.abs(balanceVal).toFixed(2)}`)}
                        </Text>
                        <Text style={styles.statusText}>
                            {isZero ? 'All clear' : (isPositive ? 'gets back' : 'owes')}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    const renderSettlementItem = ({ item }: { item: any }) => {
        const isMePayer = item.fromUserId === user?.id;
        const isMeReceiver = item.toUserId === user?.id;

        return (
            <View style={styles.settlementCard}>
                <View style={styles.settlementHeader}>
                    <View style={styles.transferRow}>
                        <View style={styles.transferUser}>
                            <View style={[styles.miniAvatar, { backgroundColor: colors.error + '20' }]}>
                                <Text style={[styles.miniAvatarText, { color: colors.error }]}>{item.fromUserName.charAt(0)}</Text>
                            </View>
                            <Text style={styles.transferName} numberOfLines={1}>{item.fromUserName}</Text>
                        </View>

                        <View style={styles.transferArrow}>
                            <Text style={styles.transferAmount}>${parseFloat(item.amount).toFixed(2)}</Text>
                            <Feather name="arrow-right" size={20} color={colors.text.tertiary} />
                        </View>

                        <View style={styles.transferUser}>
                            <View style={[styles.miniAvatar, { backgroundColor: colors.accent.emerald + '20' }]}>
                                <Text style={[styles.miniAvatarText, { color: colors.accent.emerald }]}>{item.toUserName.charAt(0)}</Text>
                            </View>
                            <Text style={styles.transferName} numberOfLines={1}>{item.toUserName}</Text>
                        </View>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actionRow}>
                    {isMePayer && (
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.primary.main }]}
                            onPress={() => handleSettleUp(item)}
                        >
                            <Feather name="dollar-sign" size={16} color="white" style={{ marginRight: 6 }} />
                            <Text style={styles.actionButtonText}>Pay Now</Text>
                        </TouchableOpacity>
                    )}
                    {isMeReceiver && (
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: 'white', borderWidth: 1, borderColor: colors.primary.main }]}
                            onPress={() => handleRemind(item)}
                        >
                            <Feather name="bell" size={16} color={colors.primary.main} style={{ marginRight: 6 }} />
                            <Text style={[styles.actionButtonText, { color: colors.primary.main }]}>Remind</Text>
                        </TouchableOpacity>
                    )}
                    {!isMePayer && !isMeReceiver && (
                        <Text style={styles.readOnlyText}>Proposed Transaction</Text>
                    )}
                </View>
            </View>
        );
    };

    const renderRequestItem = (item: any) => {
        const isMePayer = item.from?.id === user?.id;
        const isMeReceiver = item.to?.id === user?.id;
        const fromName = item.from?.name || 'Unknown';
        const toName = item.to?.name || 'Unknown';

        return (
            <View style={[styles.settlementCard, { borderColor: colors.warning }]} key={`req-${item.id}`}>
                <View style={styles.settlementHeader}>
                    <Text style={{ fontSize: 12, color: colors.warning, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>
                        PENDING APPROVAL
                    </Text>
                    <View style={styles.transferRow}>
                        <View style={styles.transferUser}>
                            <View style={[styles.miniAvatar, { backgroundColor: colors.error + '20' }]}>
                                <Text style={[styles.miniAvatarText, { color: colors.error }]}>{fromName.charAt(0)}</Text>
                            </View>
                            <Text style={styles.transferName} numberOfLines={1}>{fromName}</Text>
                        </View>

                        <View style={styles.transferArrow}>
                            <Text style={styles.transferAmount}>${parseFloat(item.amount).toFixed(2)}</Text>
                            <Feather name="arrow-right" size={20} color={colors.text.tertiary} />
                        </View>

                        <View style={styles.transferUser}>
                            <View style={[styles.miniAvatar, { backgroundColor: colors.accent.emerald + '20' }]}>
                                <Text style={[styles.miniAvatarText, { color: colors.accent.emerald }]}>{toName.charAt(0)}</Text>
                            </View>
                            <Text style={styles.transferName} numberOfLines={1}>{toName}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.actionRow}>
                    {isMeReceiver ? (
                        <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
                            <TouchableOpacity
                                style={[styles.actionButton, { flex: 1, backgroundColor: colors.accent.emerald }]}
                                onPress={() => handleProcessRequest(item.id, 'ACCEPT')}
                            >
                                <Feather name="check" size={16} color="white" style={{ marginRight: 6 }} />
                                <Text style={styles.actionButtonText}>Accept</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, { flex: 1, backgroundColor: 'white', borderWidth: 1, borderColor: colors.error }]}
                                onPress={() => handleProcessRequest(item.id, 'REJECT')}
                            >
                                <Feather name="x" size={16} color={colors.error} style={{ marginRight: 6 }} />
                                <Text style={[styles.actionButtonText, { color: colors.error }]}>Reject</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (isMePayer ? (
                        <Text style={[styles.readOnlyText, { color: colors.warning, fontWeight: '600' }]}>Waiting for approval</Text>
                    ) : (
                        <Text style={styles.readOnlyText}>Pending Request</Text>
                    ))}
                </View>
            </View>
        );
    };

    const gradientColors = colors.primary.gradient as unknown as readonly [string, string, ...string[]];

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
                        <Text style={styles.headerTitle}>Ledger</Text>
                        <Text style={styles.headerSubtitle}>{groupName}</Text>
                    </View>
                    <View style={{ width: 24 }} />
                </View>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'BALANCES' && styles.activeTab]}
                        onPress={() => setActiveTab('BALANCES')}
                    >
                        <Text style={[styles.tabText, activeTab === 'BALANCES' && styles.activeTabText]}>Net Balances</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'SETTLEMENTS' && styles.activeTab]}
                        onPress={() => setActiveTab('SETTLEMENTS')}
                    >
                        <Text style={[styles.tabText, activeTab === 'SETTLEMENTS' && styles.activeTabText]}>Settlement Plan</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Financial Summary Card */}
            {
                !isLoading && balances.length > 0 && (
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryRow}>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Total Receivables</Text>
                                <Text style={[styles.summaryValue, { color: colors.accent.emerald }]}>
                                    +${balances.filter(b => parseFloat(b.balance) > 0)
                                        .reduce((sum, b) => sum + parseFloat(b.balance), 0)
                                        .toFixed(2)}
                                </Text>
                            </View>
                            <View style={[styles.verticalDivider, { backgroundColor: colors.neutral.gray[300] }]} />
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Total Payables</Text>
                                <Text style={[styles.summaryValue, { color: colors.error }]}>
                                    -${Math.abs(balances.filter(b => parseFloat(b.balance) < 0)
                                        .reduce((sum, b) => sum + parseFloat(b.balance), 0))
                                        .toFixed(2)}
                                </Text>
                            </View>
                        </View>
                        {user && (
                            <View style={styles.userPositionContainer}>
                                <Text style={styles.userPositionText}>
                                    You are {
                                        (() => {
                                            const myBal = parseFloat(balances.find(b => b.user.id === user.id)?.balance || '0');
                                            if (Math.abs(myBal) < 0.01) return 'All Settled';
                                            return myBal > 0 ? 'owed money' : 'in debt';
                                        })()
                                    }
                                </Text>
                                <Text style={[styles.userPositionAmount, {
                                    color: parseFloat(balances.find(b => b.user.id === user.id)?.balance || '0') >= 0
                                        ? colors.accent.emerald
                                        : colors.error
                                }]}>
                                    {(() => {
                                        const myBal = parseFloat(balances.find(b => b.user.id === user.id)?.balance || '0');
                                        return Math.abs(myBal) < 0.01
                                            ? '$0.00'
                                            : `${myBal > 0 ? '+' : '-'}$${Math.abs(myBal).toFixed(2)}`;
                                    })()}
                                </Text>
                            </View>
                        )}
                    </View>
                )
            }

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                </View>
            ) : (
                <View style={styles.contentContainer}>
                    {activeTab === 'BALANCES' ? (
                        <FlatList
                            data={balances}
                            renderItem={renderBalanceItem}
                            keyExtractor={(item) => item.userId?.toString() || Math.random().toString()}
                            contentContainerStyle={styles.listContent}
                            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.main} />}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <View style={styles.emptyIconBg}>
                                        <Feather name="check" size={32} color={colors.accent.emerald} />
                                    </View>
                                    <Text style={styles.emptyTitle}>All Settled Up!</Text>
                                    <Text style={styles.emptyText}>No one owes anything in this group.</Text>
                                </View>
                            }
                        />
                    ) : (
                        <FlatList
                            data={settlements}
                            renderItem={renderSettlementItem}
                            keyExtractor={(item, index) => index.toString()}
                            contentContainerStyle={styles.listContent}
                            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.main} />}
                            ListHeaderComponent={
                                pendingRequests.length > 0 ? (
                                    <View style={{ marginBottom: spacing.md }}>
                                        <Text style={{ fontSize: typography.fontSize.md, fontWeight: 'bold', color: colors.text.secondary, marginBottom: spacing.sm }}>
                                            Pending Requests ({pendingRequests.length})
                                        </Text>
                                        {pendingRequests.map(req => renderRequestItem(req))}
                                        {settlements.length > 0 && (
                                            <Text style={{ fontSize: typography.fontSize.md, fontWeight: 'bold', color: colors.text.secondary, marginTop: spacing.md, marginBottom: spacing.sm }}>
                                                Suggested Plans
                                            </Text>
                                        )}
                                    </View>
                                ) : null
                            }
                            ListEmptyComponent={
                                pendingRequests.length === 0 ? (
                                    <View style={styles.emptyContainer}>
                                        <View style={styles.emptyIconBg}>
                                            <Feather name="thumbs-up" size={32} color={colors.primary.main} />
                                        </View>
                                        <Text style={styles.emptyTitle}>No Debts Found</Text>
                                        <Text style={styles.emptyText}>There are no pending settlements required.</Text>
                                    </View>
                                ) : null // If there are pending requests, we don't show the completely empty message
                            }
                        />
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.secondary,
    },
    header: {
        paddingTop: 50,
        paddingBottom: 40, // Increased for summary card overlap
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        ...shadows.md,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.lg,
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
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.sm,
    },
    tab: {
        flex: 1,
        paddingVertical: spacing.sm,
        alignItems: 'center',
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: colors.text.inverse,
    },
    tabText: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.6)',
    },
    activeTabText: {
        color: colors.text.inverse,
        fontWeight: 'bold',
    },
    contentContainer: {
        flex: 1,
    },
    listContent: {
        padding: spacing.lg,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: colors.background.primary,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    avatarText: {
        fontWeight: 'bold',
        fontSize: 18,
    },
    memberName: {
        fontSize: typography.fontSize.base,
        fontWeight: '600',
        color: colors.text.primary,
    },
    memberEmail: {
        fontSize: typography.fontSize.xs,
        color: colors.text.tertiary,
    },
    amount: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    statusText: {
        fontSize: typography.fontSize.xs,
        color: colors.text.tertiary,
    },
    settlementCard: {
        backgroundColor: colors.background.primary,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        ...shadows.sm,
        borderWidth: 1,
        borderColor: colors.neutral.gray[200],
    },
    settlementHeader: {
        marginBottom: spacing.md,
    },
    transferRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    transferUser: {
        alignItems: 'center',
        width: 80,
    },
    miniAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    miniAvatarText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    transferName: {
        fontSize: typography.fontSize.xs,
        color: colors.text.secondary,
        textAlign: 'center',
    },
    transferArrow: {
        alignItems: 'center',
        flex: 1,
    },
    transferAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 4,
    },
    actionRow: {
        marginTop: spacing.xs,
        borderTopWidth: 1,
        borderTopColor: colors.neutral.gray[100],
        paddingTop: spacing.md,
        alignItems: 'center',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.full,
        width: '100%',
    },
    actionButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: typography.fontSize.sm,
    },
    readOnlyText: {
        color: colors.text.tertiary,
        fontStyle: 'italic',
        fontSize: typography.fontSize.xs,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyIconBg: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.neutral.gray[100],
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    emptyTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    emptyText: {
        color: colors.text.tertiary,
        fontSize: typography.fontSize.sm,
        textAlign: 'center',
        paddingHorizontal: spacing.xl,
    },
    // Summary Card Styles
    summaryCard: {
        marginHorizontal: spacing.lg,
        marginTop: -spacing.xl, // Overlap header slightly
        backgroundColor: colors.background.primary,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        ...shadows.md,
        marginBottom: spacing.md,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral.gray[100],
    },
    summaryItem: {
        alignItems: 'center',
        flex: 1,
    },
    summaryLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.text.tertiary,
        fontWeight: '600',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
    },
    verticalDivider: {
        width: 1,
        height: '80%',
    },
    userPositionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: spacing.sm,
    },
    userPositionText: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        fontWeight: '500',
    },
    userPositionAmount: {
        fontSize: typography.fontSize.md,
        fontWeight: 'bold',
    },
});
