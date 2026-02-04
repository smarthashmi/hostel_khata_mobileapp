import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../config/theme';
import apiMethods from '../services/apiMethods';

export default function AddFundScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { groupId, groupName, currencySymbol } = route.params;

    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('Contribution to pool');
    const [isLoading, setIsLoading] = useState(false);

    const handleAddFund = async () => {
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid positive amount.');
            return;
        }

        setIsLoading(true);
        try {
            // We use the generic transaction create for now, with type DEPOSIT or similar if backend supports it
            // Or we reuse createExpense but with specific flags.
            // Let's assume we post to /groups/:id/transactions with type='DEPOSIT'

            const payload = {
                groupId: groupId,
                amount: parseFloat(amount),
                description: description || 'Pool Deposit',
                type: 'DEPOSIT', // Important key for backend
                currencyId: null // Default
            };

            const response = await apiMethods.transaction.createDeposit(payload);

            if (response.data.success) {
                Alert.alert('Success', 'Funds added to pool successfully!', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            }
        } catch (error: any) {
            console.error('Add fund error:', error);
            const msg = error.response?.data?.message || 'Failed to add funds';
            Alert.alert('Error', msg);
        } finally {
            setIsLoading(false);
        }
    };

    // Cast colors for LinearGradient
    const gradientColors = colors.primary.gradient as unknown as readonly [string, string, ...string[]];

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
        >
            <LinearGradient
                colors={gradientColors}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Feather name="x" size={24} color={colors.text.inverse} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Add Funds</Text>
                    <View style={{ width: 24 }} />
                </View>
            </LinearGradient>

            <View style={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.label}>Amount to Deposit</Text>
                    <View style={styles.amountContainer}>
                        <Text style={styles.currencySymbol}>{currencySymbol || '$'}</Text>
                        <TextInput
                            style={styles.amountInput}
                            placeholder="0.00"
                            placeholderTextColor={colors.text.tertiary}
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                            autoFocus
                        />
                    </View>

                    <Text style={styles.label}>Description</Text>
                    <View style={styles.inputGroup}>
                        <Feather name="file-text" size={20} color={colors.text.secondary} style={styles.inputIcon} />
                        <TextInput
                            style={styles.textInput}
                            placeholder="e.g. Monthly Contribution"
                            placeholderTextColor={colors.text.tertiary}
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleAddFund}
                        disabled={isLoading}
                    >
                        <LinearGradient
                            colors={colors.accent.emerald_gradient || ['#10B981', '#059669']} // Fallback if not in theme
                            style={styles.gradientButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={colors.text.inverse} />
                            ) : (
                                <Text style={styles.buttonText}>Confirm Deposit</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
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
    },
    headerTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        color: colors.text.inverse,
    },
    backButton: {
        padding: spacing.xs,
    },
    content: {
        flex: 1,
        padding: spacing.lg,
        marginTop: -20,
    },
    card: {
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        ...shadows.md,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontWeight: 'bold',
        color: colors.text.secondary,
        marginBottom: spacing.sm,
        textTransform: 'uppercase',
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral.gray[300],
        paddingBottom: spacing.sm,
    },
    currencySymbol: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: 'bold',
        color: colors.text.primary,
        marginRight: spacing.xs,
    },
    amountInput: {
        flex: 1,
        fontSize: typography.fontSize['3xl'],
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.neutral.gray[100],
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        marginBottom: spacing.xl,
    },
    inputIcon: {
        marginRight: spacing.md,
    },
    textInput: {
        flex: 1,
        fontSize: typography.fontSize.base,
        color: colors.text.primary,
    },
    submitButton: {
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        marginTop: spacing.sm,
        ...shadows.md,
    },
    gradientButton: {
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: typography.fontSize.base,
        fontWeight: 'bold',
        color: colors.text.inverse,
    },
});
