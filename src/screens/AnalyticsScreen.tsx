import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Dimensions,
    TouchableOpacity,
    Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { PieChart, LineChart, BarChart } from 'react-native-chart-kit';
import theme from '../config/theme';
import apiMethods from '../services/apiMethods';

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

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { groupId, groupName } = route.params;

    const [isLoading, setIsLoading] = useState(true);
    const [trends, setTrends] = useState<any>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [contributions, setContributions] = useState<any[]>([]); // New
    const [stats, setStats] = useState<any>(null); // New
    const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'breakdown'>('overview'); // Updated tabs

    useEffect(() => {
        fetchAnalytics();
    }, [groupId]);

    const fetchAnalytics = async () => {
        try {
            setIsLoading(true);
            const [trendRes, catRes, contribRes, statsRes] = await Promise.all([
                apiMethods.analytics.getTrends(groupId),
                apiMethods.analytics.getCategories(groupId),
                apiMethods.analytics.getContributions(groupId),
                apiMethods.statistics.getGroupStatistics(groupId).catch(() => ({ data: { success: false } }))
            ]);

            if (trendRes.data.success) setTrends(trendRes.data.data);
            if (catRes.data.success) setCategories(catRes.data.data.categoryBreakdown || []);
            if (contribRes.data.success) setContributions(contribRes.data.data.memberContributions || []);
            if (statsRes.data?.success) setStats(statsRes.data.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            Alert.alert('Error', 'Failed to load analytics data');
        } finally {
            setIsLoading(false);
        }
    };

    // Prepare chart configuration (Modern Theme)
    const chartConfig = {
        backgroundGradientFrom: colors.background.primary,
        backgroundGradientTo: colors.background.primary,
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Emerald Primary
        strokeWidth: 2,
        barPercentage: 0.5,
        useShadowColorFromDataset: false,
        decimalPlaces: 0,
        labelColor: (opacity = 1) => colors.text.secondary,
    };

    // Prepare Pie Chart Data
    const pieData = Array.isArray(categories) ? categories.map((cat: any) => ({
        name: cat.categoryName,
        population: cat.total,
        color: cat.categoryColor || '#' + Math.floor(Math.random() * 16777215).toString(16),
        legendFontColor: colors.text.secondary,
        legendFontSize: 12,
    })) : [];

    // Prepare Line Chart Data (Last 6 months)
    const trendData = {
        labels: trends?.monthly?.map((m: any) => m.month) || [],
        datasets: [
            {
                data: trends?.monthly?.map((m: any) => m.total) || [],
                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                strokeWidth: 2,
            },
        ],
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
                        <Text style={styles.headerTitle}>Analytics</Text>
                        <Text style={styles.headerSubtitle}>{groupName}</Text>
                    </View>
                    <View style={{ width: 24 }} />
                </View>
            </LinearGradient>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                {(['overview', 'trends', 'breakdown'] as const).map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {activeTab === 'overview' && (
                    <>
                        {/* Group Health / Stats */}
                        <View style={styles.statsGrid}>
                            <View style={styles.statCard}>
                                <Text style={styles.statLabel}>Total Expense</Text>
                                <Text style={styles.statValue}>${stats?.totalExpenses || trends?.total?.toFixed(2) || '0.00'}</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statLabel}>Total Debt</Text>
                                <Text style={[styles.statValue, { color: colors.error }]}>${stats?.totalDebt || '0.00'}</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statLabel}>Transactions</Text>
                                <Text style={styles.statValue}>{stats?.transactionCount || '0'}</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statLabel}>Pool Balance</Text>
                                <Text style={[styles.statValue, { color: colors.accent.emerald }]}>${stats?.poolBalance || '0.00'}</Text>
                            </View>
                        </View>

                        {/* Member Contributions (Bar Chart) */}
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Member Contributions</Text>
                            {contributions.length > 0 ? (
                                <BarChart
                                    data={{
                                        labels: contributions.map((c: any) => (c.userName || 'U').split(' ')[0]),
                                        datasets: [{ data: contributions.map((c: any) => c.totalPaid || 0) }]
                                    }}
                                    width={screenWidth - 64}
                                    height={220}
                                    yAxisLabel="$"
                                    yAxisSuffix=""
                                    fromZero
                                    chartConfig={{
                                        ...chartConfig,
                                        barPercentage: 0.7,
                                        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Blue for contributions
                                    }}
                                    style={{ marginVertical: 8, borderRadius: 16 }}
                                />
                            ) : (
                                <Text style={styles.emptyText}>No contributions data</Text>
                            )}
                        </View>
                    </>
                )}

                {activeTab === 'trends' && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Monthly Spending Trend</Text>
                        {trendData.labels.length > 0 ? (
                            <LineChart
                                data={trendData}
                                width={screenWidth - 48}
                                height={220}
                                chartConfig={chartConfig}
                                bezier
                                style={{ marginVertical: 8, borderRadius: 16 }}
                            />
                        ) : (
                            <Text style={styles.emptyText}>Not enough data for trends</Text>
                        )}
                    </View>
                )}

                {activeTab === 'breakdown' && (
                    <>
                        {/* Category Breakdown (Pie Chart) */}
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Category Breakdown</Text>
                            {pieData.length > 0 ? (
                                <PieChart
                                    data={pieData}
                                    width={screenWidth - 64}
                                    height={220}
                                    chartConfig={chartConfig}
                                    accessor={'population'}
                                    backgroundColor={'transparent'}
                                    paddingLeft={'15'}
                                    center={[0, 0]}
                                    absolute
                                />
                            ) : (
                                <Text style={styles.emptyText}>No category data available</Text>
                            )}
                        </View>

                        {/* Chart Legend / List */}
                        <View style={styles.categoriesList}>
                            {categories.map((cat: any) => (
                                <View key={cat.categoryId} style={styles.categoryRow}>
                                    <View style={[styles.categoryIcon, { backgroundColor: cat.categoryColor || colors.neutral.gray[300] }]}>
                                        <Text style={{ fontSize: 16 }}>{cat.categoryIcon || '🏷️'}</Text>
                                    </View>
                                    <View style={styles.categoryInfo}>
                                        <Text style={styles.categoryName}>{cat.categoryName}</Text>
                                        <Text style={styles.categoryCount}>{cat.count} transactions</Text>
                                    </View>
                                    <Text style={styles.categoryAmount}>${cat.total.toFixed(2)}</Text>
                                </View>
                            ))}
                        </View>
                    </>
                )}
            </ScrollView>
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
    tabContainer: {
        flexDirection: 'row',
        padding: spacing.md,
        backgroundColor: colors.background.primary,
    },
    tab: {
        flex: 1,
        paddingVertical: spacing.md,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: colors.primary.main,
    },
    tabText: {
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
        fontWeight: '600',
    },
    activeTabText: {
        color: colors.primary.main,
    },
    content: {
        padding: spacing.lg,
    },
    card: {
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        ...shadows.sm,
    },
    cardTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: spacing.md,
    },
    totalAmount: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: 'bold',
        color: colors.primary.main,
    },
    emptyText: {
        color: colors.text.tertiary,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: spacing.md,
    },
    categoriesList: {
        marginTop: spacing.sm,
    },
    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral.gray[100],
    },
    categoryIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    categoryInfo: {
        flex: 1,
    },
    categoryName: {
        fontSize: typography.fontSize.base,
        fontWeight: '600',
        color: colors.text.primary,
    },
    categoryCount: {
        fontSize: typography.fontSize.xs,
        color: colors.text.tertiary,
    },
    categoryAmount: {
        fontSize: typography.fontSize.base,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    statCard: {
        width: (screenWidth - 48 - spacing.md) / 2,
        backgroundColor: colors.background.secondary,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    statLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.text.tertiary,
        marginBottom: 4,
    },
    statValue: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
});
