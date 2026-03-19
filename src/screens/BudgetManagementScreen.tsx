import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    RefreshControl,
    Modal,
    TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
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
    error: '#EF4444',
    success: { main: '#10B981' },
    warning: '#F59E0B'
} as any;
const { spacing, typography, borderRadius, shadows } = safeTheme as any;

export default function BudgetManagementScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { groupId, groupName } = route.params;

    const [budgets, setBudgets] = useState<any[]>([]);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        categoryId: null as number | null,
        period: 'MONTHLY' as 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [budgetsRes, alertsRes] = await Promise.all([
                apiMethods.budget.getAll(groupId),
                apiMethods.budget.getAlerts(groupId),
            ]);

            if (budgetsRes.data.success) {
                setBudgets(budgetsRes.data.data || []);
            }
            if (alertsRes.data.success) {
                setAlerts(alertsRes.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching budgets:', error);
            Alert.alert('Error', 'Failed to load budgets');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchData();
        setIsRefreshing(false);
    };

    const handleCreateBudget = async () => {
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            Alert.alert('Invalid Input', 'Please enter a valid amount');
            return;
        }

        try {
            const response = await apiMethods.budget.create(groupId, {
                amount: parseFloat(formData.amount),
                categoryId: formData.categoryId || undefined,
                period: formData.period,
            });

            if (response.data.success) {
                Alert.alert('Success', 'Budget created successfully');
                setShowCreateModal(false);
                setFormData({ amount: '', categoryId: null, period: 'MONTHLY' });
                fetchData();
            }
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to create budget');
        }
    };

    const handleDeleteBudget = (budgetId: number) => {
        Alert.alert(
            'Delete Budget',
            'Are you sure you want to delete this budget?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await apiMethods.budget.delete(budgetId);
                            Alert.alert('Success', 'Budget deleted');
                            fetchData();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete budget');
                        }
                    },
                },
            ]
        );
    };

    const renderBudgetCard = (budget: any) => {
        const spent = parseFloat(budget.spent || '0');
        const total = parseFloat(budget.amount || '1');
        const percentage = Math.min((spent / total) * 100, 100);
        const isOverBudget = spent > total;

        return (
            <View key={budget.id} style={styles.budgetCard}>
                <View style={styles.budgetHeader}>
                    <View style={styles.budgetInfo}>
                        <Text style={styles.budgetLabel}>
                            {budget.category?.name || 'General Budget'}
                        </Text>
                        <Text style={styles.budgetPeriod}>{budget.period}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteBudget(budget.id)}>
                        <Feather name="trash-2" size={20} color={colors.error} />
                    </TouchableOpacity>
                </View>

                <View style={styles.budgetAmounts}>
                    <View>
                        <Text style={styles.amountLabel}>Spent</Text>
                        <Text style={[styles.amountValue, isOverBudget && { color: colors.error }]}>
                            ${spent.toFixed(2)}
                        </Text>
                    </View>
                    <View style={styles.amountDivider} />
                    <View>
                        <Text style={styles.amountLabel}>Budget</Text>
                        <Text style={styles.amountValue}>${total.toFixed(2)}</Text>
                    </View>
                </View>

                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${percentage}%`,
                                    backgroundColor: isOverBudget
                                        ? colors.error
                                        : percentage > 80
                                            ? colors.warning
                                            : colors.success,
                                },
                            ]}
                        />
                    </View>
                    <Text style={[styles.progressText, isOverBudget && { color: colors.error }]}>
                        {percentage.toFixed(0)}%
                    </Text>
                </View>

                {isOverBudget && (
                    <View style={styles.warningBadge}>
                        <Feather name="alert-circle" size={16} color={colors.error} />
                        <Text style={styles.warningText}>Over Budget!</Text>
                    </View>
                )}
            </View>
        );
    };

    const gradientColors = colors.primary.gradient as unknown as readonly [string, string, ...string[]];

    return (
        <View style={styles.container}>
            <LinearGradient colors={gradientColors} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color={colors.text.inverse} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Budget Management</Text>
                    <View style={{ width: 24 }} />
                </View>
                <Text style={styles.headerSubtitle}>{groupName}</Text>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
            >
                {alerts.length > 0 && (
                    <View style={styles.alertsSection}>
                        <Text style={styles.sectionTitle}>⚠️ Alerts</Text>
                        {alerts.map((alert, index) => (
                            <View key={index} style={styles.alertCard}>
                                <Feather name="alert-triangle" size={20} color={colors.warning} />
                                <Text style={styles.alertText}>{alert.message}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary.main} />
                    </View>
                ) : budgets.length > 0 ? (
                    <View style={styles.budgetsSection}>
                        {budgets.map(renderBudgetCard)}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Feather name="pie-chart" size={48} color={colors.text.tertiary} />
                        <Text style={styles.emptyText}>No budgets created yet</Text>
                        <Text style={styles.emptySubtext}>Tap the + button to create your first budget</Text>
                    </View>
                )}
            </ScrollView>

            <TouchableOpacity style={styles.fab} onPress={() => setShowCreateModal(true)}>
                <LinearGradient colors={gradientColors} style={styles.fabGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Feather name="plus" size={24} color={colors.text.inverse} />
                </LinearGradient>
            </TouchableOpacity>

            <Modal visible={showCreateModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Create Budget</Text>
                            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                                <Feather name="x" size={24} color={colors.text.primary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Amount</Text>
                            <TextInput
                                style={styles.formInput}
                                placeholder="Enter budget amount"
                                keyboardType="numeric"
                                value={formData.amount}
                                onChangeText={(text) => setFormData({ ...formData, amount: text })}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Period</Text>
                            <View style={styles.periodButtons}>
                                {(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] as const).map((period) => (
                                    <TouchableOpacity
                                        key={period}
                                        style={[
                                            styles.periodButton,
                                            formData.period === period && styles.periodButtonActive,
                                        ]}
                                        onPress={() => setFormData({ ...formData, period })}
                                    >
                                        <Text
                                            style={[
                                                styles.periodButtonText,
                                                formData.period === period && styles.periodButtonTextActive,
                                            ]}
                                        >
                                            {period}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity style={styles.submitButton} onPress={handleCreateBudget}>
                            <LinearGradient colors={gradientColors} style={styles.submitGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                                <Text style={styles.submitButtonText}>Create Budget</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    backButton: {
        padding: spacing.xs,
    },
    headerTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: '700' as any,
        color: colors.text.inverse,
    },
    headerSubtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.text.inverse,
        opacity: 0.9,
        marginTop: spacing.xs,
    },
    content: {
        flex: 1,
        padding: spacing.lg,
    },
    alertsSection: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: '700' as any,
        color: colors.text.primary,
        marginBottom: spacing.md,
    },
    alertCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: colors.warning + '20',
        borderRadius: borderRadius.md,
        borderLeftWidth: 4,
        borderLeftColor: colors.warning,
        marginBottom: spacing.sm,
    },
    alertText: {
        flex: 1,
        marginLeft: spacing.md,
        fontSize: typography.fontSize.sm,
        color: colors.text.primary,
    },
    budgetsSection: {
        marginBottom: spacing.xl,
    },
    budgetCard: {
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        ...shadows.md,
    },
    budgetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    budgetInfo: {
        flex: 1,
    },
    budgetLabel: {
        fontSize: typography.fontSize.base,
        fontWeight: '700' as any,
        color: colors.text.primary,
        marginBottom: 4,
    },
    budgetPeriod: {
        fontSize: typography.fontSize.xs,
        color: colors.text.tertiary,
        textTransform: 'capitalize',
    },
    budgetAmounts: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: spacing.md,
    },
    amountLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.text.secondary,
        marginBottom: 4,
        textAlign: 'center',
    },
    amountValue: {
        fontSize: typography.fontSize.xl,
        fontWeight: '700' as any,
        color: colors.text.primary,
        textAlign: 'center',
    },
    amountDivider: {
        width: 1,
        backgroundColor: colors.neutral.gray[300],
        marginHorizontal: spacing.lg,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    progressBar: {
        flex: 1,
        height: 8,
        backgroundColor: colors.neutral.gray[200],
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600' as any,
        color: colors.text.secondary,
        minWidth: 40,
        textAlign: 'right',
    },
    warningBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.sm,
        padding: spacing.sm,
        backgroundColor: colors.error + '15',
        borderRadius: borderRadius.sm,
    },
    warningText: {
        marginLeft: spacing.xs,
        fontSize: typography.fontSize.xs,
        fontWeight: '600' as any,
        color: colors.error,
    },
    loadingContainer: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
        marginTop: spacing.xl,
    },
    emptyText: {
        fontSize: typography.fontSize.lg,
        fontWeight: '600' as any,
        color: colors.text.secondary,
        marginTop: spacing.md,
    },
    emptySubtext: {
        fontSize: typography.fontSize.sm,
        color: colors.text.tertiary,
        marginTop: spacing.xs,
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        borderRadius: 28,
        ...shadows.lg,
    },
    fabGradient: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.background.primary,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: spacing.xl,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    modalTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: '700' as any,
        color: colors.text.primary,
    },
    formGroup: {
        marginBottom: spacing.lg,
    },
    formLabel: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600' as any,
        color: colors.text.secondary,
        marginBottom: spacing.sm,
    },
    formInput: {
        borderWidth: 1,
        borderColor: colors.neutral.gray[300],
        borderRadius: borderRadius.md,
        padding: spacing.md,
        fontSize: typography.fontSize.base,
        color: colors.text.primary,
    },
    periodButtons: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    periodButton: {
        flex: 1,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.xs,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.neutral.gray[300],
        alignItems: 'center',
    },
    periodButtonActive: {
        backgroundColor: colors.primary.main,
        borderColor: colors.primary.main,
    },
    periodButtonText: {
        fontSize: typography.fontSize.xs,
        color: colors.text.primary,
        fontWeight: '600' as any,
    },
    periodButtonTextActive: {
        color: colors.text.inverse,
    },
    submitButton: {
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        marginTop: spacing.md,
    },
    submitGradient: {
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    submitButtonText: {
        fontSize: typography.fontSize.base,
        fontWeight: '700' as any,
        color: colors.text.inverse,
    },
});
