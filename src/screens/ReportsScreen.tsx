import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Platform,
    Alert,
    ToastAndroid
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import theme from '../config/theme';
import apiMethods from '../services/apiMethods';

const safeTheme = theme || {};
const colors = safeTheme.colors || {
    primary: { main: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED'], light: '#F3E8FF' },
    secondary: { main: '#06B6D4', gradient: ['#06B6D4', '#0891B2'], light: '#CFFAFE' },
    background: { primary: '#FFFFFF', secondary: '#F9FAFB' },
    text: { primary: '#000', secondary: '#4B5563', tertiary: '#9CA3AF', inverse: '#FFF' },
    neutral: { gray: { '100': '#F3F4F6', '200': '#E5E7EB', '300': '#D1D5DB' }, white: '#FFFFFF' },
    accent: { emerald: '#10B981', error: '#EF4444' }
} as any;
const { spacing, typography, borderRadius, shadows } = safeTheme as any;

const FILTER_OPTIONS = [
    { label: 'Last 30 Days', id: 'LAST_30' },
    { label: 'This Month', id: 'THIS_MONTH' },
    { label: 'All Time', id: 'ALL' }
];

export default function ReportsScreen() {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { groupId, groupName } = route.params;

    const [activeFilter, setActiveFilter] = useState('LAST_30');
    const [reportData, setReportData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState({ totalExpenses: 0, totalSettlements: 0 });

    useEffect(() => {
        fetchReport();
    }, [activeFilter, groupId]);

    const fetchReport = async () => {
        setIsLoading(true);
        try {
            // Calculate date range based on filter
            let startDate: string | undefined;
            let endDate: string | undefined;
            const now = new Date();

            if (activeFilter === 'LAST_30') {
                startDate = subDays(now, 30).toISOString();
                endDate = now.toISOString();
            } else if (activeFilter === 'THIS_MONTH') {
                startDate = startOfMonth(now).toISOString();
                endDate = endOfMonth(now).toISOString();
            }

            // Fetch Transactions for the report view
            const res = await apiMethods.transaction.getHistory(groupId, {
                startDate,
                endDate,
                limit: 50 // Cap for view
            });

            if (res.data.success) {
                const transactions = res.data.data.transactions || [];
                setReportData(transactions);

                // Calculate local stats for the view
                const totalExp = transactions
                    .filter((t: any) => t.type === 'EXPENSE')
                    .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);

                const totalSet = transactions
                    .filter((t: any) => t.type === 'SETTLEMENT')
                    .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);

                setStats({ totalExpenses: totalExp, totalSettlements: totalSet });
            }
        } catch (error) {
            console.error('Report fetch error:', error);
            Alert.alert('Error', 'Failed to load report data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportCsv = async () => {
        try {
            const res = await apiMethods.report.getTransactionCsv(groupId);
            // Since we receive raw string/blob, we'll assume it's text for clipboard
            const csvData = res.data;

            // Copy to Clipboard as fallback for file download
            await Clipboard.setStringAsync(csvData);

            if (Platform.OS === 'android') {
                ToastAndroid.show('CSV Report copied to clipboard!', ToastAndroid.LONG);
            } else {
                Alert.alert('Success', 'Report CSV copied to clipboard!');
            }
        } catch (error) {
            console.error('Export error:', error);
            Alert.alert('Error', 'Failed to export report');
        }
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
                        <Text style={styles.headerTitle}>Reports</Text>
                        <Text style={styles.headerSubtitle}>{groupName}</Text>
                    </View>
                    <View style={{ width: 24 }} />
                </View>
            </LinearGradient>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                {FILTER_OPTIONS.map((option) => (
                    <TouchableOpacity
                        key={option.id}
                        style={[styles.filterTab, activeFilter === option.id && { backgroundColor: colors.primary.main }]}
                        onPress={() => setActiveFilter(option.id)}
                    >
                        <Text style={[styles.filterText, activeFilter === option.id && { color: 'white', fontWeight: 'bold' }]}>
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Summary Cards */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Total Expenses</Text>
                        <Text style={[styles.statValue, { color: colors.error }]}>
                            ${stats.totalExpenses.toFixed(2)}
                        </Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Settled Amount</Text>
                        <Text style={[styles.statValue, { color: colors.accent.emerald }]}>
                            ${stats.totalSettlements.toFixed(2)}
                        </Text>
                    </View>
                </View>

                {/* Report Preview List */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Transaction History</Text>
                    <TouchableOpacity onPress={handleExportCsv} style={styles.exportButton}>
                        <Feather name="copy" size={14} color={colors.primary.main} style={{ marginRight: 4 }} />
                        <Text style={styles.exportText}>Copy CSV</Text>
                    </TouchableOpacity>
                </View>

                {isLoading ? (
                    <ActivityIndicator size="large" color={colors.primary.main} style={{ marginTop: 20 }} />
                ) : (
                    <View style={styles.listContainer}>
                        {reportData && reportData.length > 0 ? (
                            reportData.map((item: any) => (
                                <View key={item.id} style={styles.row}>
                                    <View style={[styles.iconBox, { backgroundColor: item.type === 'EXPENSE' ? '#FEF2F2' : '#ECFDF5' }]}>
                                        <Feather
                                            name={item.type === 'EXPENSE' ? 'dollar-sign' : 'check'}
                                            size={16}
                                            color={item.type === 'EXPENSE' ? colors.error : colors.accent.emerald}
                                        />
                                    </View>
                                    <View style={{ flex: 1, paddingHorizontal: 10 }}>
                                        <Text style={styles.rowTitle}>{item.description}</Text>
                                        <Text style={styles.rowDate}>{format(new Date(item.transactionDate), 'MMM dd, yyyy')}</Text>
                                    </View>
                                    <Text style={[styles.rowAmount, { color: item.type === 'EXPENSE' ? colors.text.primary : colors.accent.emerald }]}>
                                        {item.type === 'EXPENSE' ? '-' : '+'} ${parseFloat(item.amount).toFixed(2)}
                                    </Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>No transactions found for this period.</Text>
                        )}
                    </View>
                )}
            </ScrollView>
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
        justifyContent: 'space-between',
        backgroundColor: colors.background.primary,
        ...shadows.sm,
    },
    filterTab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: borderRadius.full,
        marginHorizontal: 4,
        backgroundColor: colors.neutral.gray[100],
    },
    filterText: {
        fontSize: typography.fontSize.xs,
        color: colors.text.secondary,
        fontWeight: '600',
    },
    scrollContent: {
        padding: spacing.lg,
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.background.primary,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        ...shadows.sm,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.text.tertiary,
        marginBottom: 4,
    },
    statValue: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    exportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary.light,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: borderRadius.full,
    },
    exportText: {
        fontSize: typography.fontSize.xs,
        color: colors.primary.main,
        fontWeight: '600',
    },
    listContainer: {
        backgroundColor: colors.background.primary,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        ...shadows.sm,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral.gray[100],
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rowTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.text.primary,
    },
    rowDate: {
        fontSize: 10,
        color: colors.text.tertiary,
    },
    rowAmount: {
        fontSize: typography.fontSize.sm,
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        color: colors.text.tertiary,
        padding: 20,
    },
});
