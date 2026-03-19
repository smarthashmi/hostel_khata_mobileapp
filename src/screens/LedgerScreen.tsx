import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    SectionList,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { format } from 'date-fns';
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
    accent: { emerald: '#10B981', error: '#EF4444' },
    error: '#EF4444'
} as any;
const { spacing, typography, borderRadius, shadows } = safeTheme as any;
// ... (imports)

export default function LedgerScreen() {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { groupId, groupName, currencySymbol } = route.params;
    const { user } = useAuth(); // Get current user for balance calculation

    const [transactions, setTransactions] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalDebt: 0, totalOwed: 0 }); // New State
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'ALL' | 'DEPOSIT' | 'EXPENSE'>('ALL');

    useFocusEffect(
        useCallback(() => {
            fetchTransactions();
        }, [groupId, user]) // Added user to dependency array
    );

    const fetchTransactions = async () => {
        try {
            // Parallel fetch: Transactions + User Balances
            const [txRes, balRes] = await Promise.all([
                apiMethods.transaction.getHistory(groupId),
                apiMethods.settlement.getBalances(groupId).catch(() => ({ data: { success: false } }))
            ]);

            if (txRes.data.success) {
                const responseData = txRes.data.data;
                const txData = Array.isArray(responseData)
                    ? responseData
                    : (Array.isArray(responseData?.transactions) ? responseData.transactions : []);
                setTransactions(txData);
            }

            if (balRes.data?.success && user) {
                // Calculate user's personal debt and owed amounts
                const balances = balRes.data.data.balances || [];

                // Find current user's balance
                const myBalance = balances.find((b: any) => b.user?.id === user.id || b.userId === user.id);

                if (myBalance) {
                    const balanceValue = parseFloat(myBalance.balance || '0');
                    // Positive balance = others owe me (totalOwed)
                    // Negative balance = I owe others (totalDebt)
                    setStats({
                        totalDebt: balanceValue < 0 ? Math.abs(balanceValue) : 0,
                        totalOwed: balanceValue > 0 ? balanceValue : 0
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchTransactions();
    };

    const getFilteredTransactions = () => {
        // Always ensure transactions is an array
        if (!Array.isArray(transactions)) return [];
        if (filter === 'ALL') return transactions;
        return transactions.filter(t => t.type === filter);
    };

    const renderTransactionItem = ({ item }: { item: any }) => {
        const isExpense = item.type === 'EXPENSE';
        const isDeposit = item.type === 'DEPOSIT';
        const amountColor = isDeposit ? colors.accent.emerald : colors.error;
        const iconName = isDeposit ? 'arrow-down-left' : 'arrow-up-right';

        return (
            <TouchableOpacity style={styles.transactionCard}>
                <View style={[styles.iconContainer, { backgroundColor: isDeposit ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
                    <Feather name={iconName} size={20} color={amountColor} />
                </View>
                <View style={styles.transactionDetails}>
                    <Text style={styles.transactionTitle}>{item.description || 'No description'}</Text>
                    <Text style={styles.transactionMeta}>
                        {format(new Date(item.transactionDate), 'MMM d, yyyy')} • {item.payer?.name || 'Unknown'}
                    </Text>
                </View>
                <Text style={[styles.transactionAmount, { color: amountColor }]}>
                    {isExpense ? '-' : '+'}{currencySymbol || '$'}{parseFloat(item.amount).toFixed(2)}
                </Text>
            </TouchableOpacity>
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
            </LinearGradient>

            {/* Net Balance Summary (Parity with Web) */}
            <View style={styles.summaryContainer}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Total Debt</Text>
                    <Text style={[styles.summaryValue, { color: colors.error }]}>-${Math.abs(stats.totalDebt || 0).toFixed(2)}</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Total Owed</Text>
                    <Text style={[styles.summaryValue, { color: colors.accent.emerald }]}>+${Math.abs(stats.totalOwed || 0).toFixed(2)}</Text>
                </View>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                {(['ALL', 'DEPOSIT', 'EXPENSE'] as const).map((f) => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterTab, filter === f && styles.activeFilterTab]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[styles.filterText, filter === f && styles.activeFilterText]}>
                            {f.charAt(0) + f.slice(1).toLowerCase()}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                </View>
            ) : (
                <SectionList
                    sections={groupTransactionsByDate(getFilteredTransactions())}
                    renderItem={renderTransactionItem}
                    renderSectionHeader={({ section: { title } }) => (
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionHeaderText}>{title}</Text>
                        </View>
                    )}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.main} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Feather name="list" size={48} color={colors.neutral.gray[300]} />
                            <Text style={styles.emptyText}>No transactions found</Text>
                        </View>
                    }
                    stickySectionHeadersEnabled={false}
                />
            )}
        </View>
    );
}

// Helper to group transactions by Month Year
function groupTransactionsByDate(transactions: any[]) {
    if (!Array.isArray(transactions)) return [];

    const groups: { [key: string]: any[] } = {};

    transactions.forEach(t => {
        const date = new Date(t.transactionDate);
        const key = format(date, 'MMMM yyyy'); // e.g. "February 2026"
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(t);
    });

    return Object.keys(groups).map(key => ({
        title: key,
        data: groups[key]
    }));
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
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
    summaryContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        gap: spacing.md,
        backgroundColor: colors.background.secondary,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: colors.background.primary,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        ...shadows.sm,
    },
    summaryLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.text.secondary,
        marginBottom: 4,
        fontWeight: '600',
    },
    summaryValue: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
    },
    filterContainer: {
        flexDirection: 'row',
        padding: spacing.md,
        backgroundColor: colors.background.secondary,
        justifyContent: 'center',
        gap: spacing.md,
    },
    filterTab: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.full,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.neutral.gray[300],
    },
    activeFilterTab: {
        backgroundColor: colors.primary.main,
        borderColor: colors.primary.main,
    },
    filterText: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        fontWeight: '600',
    },
    activeFilterText: {
        color: colors.text.inverse,
    },
    listContent: {
        padding: spacing.md,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    transactionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.primary,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.sm,
        ...shadows.sm,
        borderWidth: 1,
        borderColor: colors.neutral.gray[100],
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    transactionDetails: {
        flex: 1,
    },
    transactionTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: 2,
    },
    transactionMeta: {
        fontSize: typography.fontSize.xs,
        color: colors.text.tertiary,
    },
    transactionAmount: {
        fontSize: typography.fontSize.base,
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        color: colors.text.tertiary,
        fontSize: typography.fontSize.sm,
        textAlign: 'center',
        paddingHorizontal: spacing.xl,
    },
    sectionHeader: {
        backgroundColor: colors.background.secondary,
        paddingVertical: 8,
        paddingHorizontal: 4,
        marginTop: 16,
        marginBottom: 8,
        borderRadius: 8,
    },
    sectionHeaderText: {
        fontSize: typography.fontSize.xs,
        fontWeight: 'bold',
        color: colors.text.secondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});
