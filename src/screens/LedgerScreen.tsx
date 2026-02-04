import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../config/theme';
import apiMethods from '../services/apiMethods';
import { format } from 'date-fns';

export default function LedgerScreen() {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { groupId, groupName } = route.params;

    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'ALL' | 'DEPOSIT' | 'EXPENSE'>('ALL');

    useEffect(() => {
        fetchTransactions();
    }, [groupId]);

    const fetchTransactions = async () => {
        try {
            // Use getHistory from apiMethods
            const response = await apiMethods.transaction.getHistory(groupId);
            if (response.data.success) {
                setTransactions(response.data.data);
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
        if (filter === 'ALL') return transactions;
        return transactions.filter(t => t.type === filter);
    };

    const renderTransactionItem = ({ item }: { item: any }) => {
        const isExpense = item.type === 'EXPENSE';
        const isDeposit = item.type === 'DEPOSIT';
        const amountColor = isDeposit ? colors.accent.emerald : colors.error; // rose -> error
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
                    {isExpense ? '-' : '+'}${parseFloat(item.amount).toFixed(2)}
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
                <FlatList
                    data={getFilteredTransactions()}
                    renderItem={renderTransactionItem}
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
                />
            )}
        </View>
    );
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
        fontSize: typography.fontSize.md,
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyText: {
        marginTop: spacing.md,
        color: colors.text.tertiary,
        fontSize: typography.fontSize.md,
    },
});
