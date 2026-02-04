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
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../config/theme';
import apiMethods from '../services/apiMethods';

export default function BalancesScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { groupId, groupName } = route.params;

    const [balances, setBalances] = useState<any[]>([]);
    const [settlements, setSettlements] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchBalances();
    }, [groupId]);

    const fetchBalances = async () => {
        try {
            // Fetch balances
            // Note: Depending on backend, this might return just member balances or also suggested settlements
            const res = await apiMethods.settlement.getBalances(groupId);
            if (res.data.success) {
                setBalances(res.data.data.balances || []);
                setSettlements(res.data.data.suggestedSettlements || []);
            }
        } catch (error) {
            console.error('Error fetching balances:', error);
            // Alert.alert('Error', 'Failed to load balances');
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
            fromUserId: settlement.fromUserId, // If we are implementing "pay on behalf", otherwise logic is slightly different
            groupName
        });
    };

    const renderBalanceItem = ({ item }: { item: any }) => {
        const isPositive = parseFloat(item.balance) > 0;
        const isZero = parseFloat(item.balance) === 0;
        const color = isZero ? colors.text.secondary : (isPositive ? colors.accent.emerald : colors.error); // rose -> error

        return (
            <View style={styles.card}>
                <View style={styles.memberRow}>
                    <View style={styles.memberInfo}>
                        <View style={[styles.avatar, { backgroundColor: isPositive ? colors.accent.emerald + '20' : colors.error + '20' }]}>
                            <Text style={[styles.avatarText, { color: color }]}>{item.user?.name?.charAt(0) || '?'}</Text>
                        </View>
                        <Text style={styles.memberName}>{item.user?.name || 'Unknown'}</Text>
                    </View>
                    <View>
                        <Text style={[styles.amount, { color }]}>
                            {isZero ? 'Settled' : (isPositive ? `Gets $${parseFloat(item.balance).toFixed(2)}` : `Owes $${Math.abs(parseFloat(item.balance)).toFixed(2)}`)}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    const renderSettlementItem = ({ item }: { item: any }) => (
        <View style={styles.settlementCard}>
            <View style={styles.settlementRow}>
                <View style={styles.settlementInfo}>
                    <Text style={styles.settlementText}>
                        <Text style={{ fontWeight: 'bold' }}>{item.fromUser?.name}</Text> pays <Text style={{ fontWeight: 'bold' }}>{item.toUser?.name}</Text>
                    </Text>
                    <Text style={styles.settlementAmount}>${parseFloat(item.amount).toFixed(2)}</Text>
                </View>
                <TouchableOpacity
                    style={styles.settleButton}
                    onPress={() => handleSettleUp(item)}
                >
                    <Text style={styles.settleButtonText}>Settle</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

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
                        <Text style={styles.headerTitle}>Balances</Text>
                        <Text style={styles.headerSubtitle}>{groupName}</Text>
                    </View>
                    <View style={{ width: 24 }} />
                </View>
            </LinearGradient>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                </View>
            ) : (
                <FlatList
                    data={balances}
                    renderItem={renderBalanceItem}
                    keyExtractor={(item) => item.userId?.toString() || Math.random().toString()}
                    contentContainerStyle={styles.content}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.main} />}
                    ListHeaderComponent={
                        settlements.length > 0 ? (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Suggested Settlements</Text>
                                {settlements.map((s, index) => (
                                    <View key={index}>
                                        {renderSettlementItem({ item: s })}
                                    </View>
                                ))}
                            </View>
                        ) : null
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Feather name="check-circle" size={48} color={colors.accent.emerald} />
                            <Text style={styles.emptyText}>Everyone is settled up!</Text>
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
    content: {
        padding: spacing.lg,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: spacing.md,
    },
    card: {
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    avatarText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    memberName: {
        fontSize: typography.fontSize.base,
        fontWeight: '600',
        color: colors.text.primary,
    },
    amount: {
        fontSize: typography.fontSize.base,
        fontWeight: 'bold',
    },
    settlementCard: {
        backgroundColor: colors.background.primary,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.neutral.gray[200],
    },
    settlementRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    settlementInfo: {
        flex: 1,
    },
    settlementText: {
        fontSize: typography.fontSize.sm,
        color: colors.text.primary,
        marginBottom: 4,
    },
    settlementAmount: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        color: colors.primary.main,
    },
    settleButton: {
        backgroundColor: colors.primary.main,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
    },
    settleButtonText: {
        color: colors.text.inverse,
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
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
