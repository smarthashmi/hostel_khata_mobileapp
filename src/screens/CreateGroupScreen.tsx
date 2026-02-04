import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import apiMethods from '../services/apiMethods';
import { colors, spacing, typography, borderRadius, shadows } from '../config/theme';
import { Feather } from '@expo/vector-icons';

export default function CreateGroupScreen() {
    const navigation = useNavigation();
    const [name, setName] = useState('');
    const [type, setType] = useState('EXPENSE_TRACKING'); // Default type
    const [currencies, setCurrencies] = useState<any[]>([]);
    const [selectedCurrency, setSelectedCurrency] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    React.useEffect(() => {
        fetchCurrencies();
    }, []);

    const fetchCurrencies = async () => {
        try {
            const res = await apiMethods.currency.getAll();
            if (res.data.success) {
                setCurrencies(res.data.data);
                // Select USD or first available by default
                const usd = res.data.data.find((c: any) => c.code === 'USD');
                if (usd) setSelectedCurrency(usd.id);
                else if (res.data.data.length > 0) setSelectedCurrency(res.data.data[0].id);
            }
        } catch (error) {
            console.error('Error fetching currencies:', error);
        }
    };

    const handleCreate = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter a group name');
            return;
        }

        setIsLoading(true);
        try {
            const response = await apiMethods.group.create({
                name,
                type,
                currencyId: selectedCurrency || undefined
            });
            if (response.data.success) {
                Alert.alert('Success', 'Group created successfully!', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            }
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to create group');
        } finally {
            setIsLoading(false);
        }
    };

    // Cast colors for LinearGradient
    const gradientColors = colors.primary.gradient as unknown as readonly [string, string, ...string[]];

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={gradientColors}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Feather name="arrow-left" size={24} color={colors.text.inverse} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create New Group</Text>
            </LinearGradient>

            <View style={styles.content}>
                <View style={styles.formCard}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Group Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Apartment 404"
                            placeholderTextColor={colors.text.tertiary}
                            value={name}
                            onChangeText={setName}
                            autoFocus
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Group Type</Text>
                        <View style={styles.typeContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.typeCard,
                                    type === 'EXPENSE_TRACKING' && styles.typeCardActive
                                ]}
                                onPress={() => setType('EXPENSE_TRACKING')}
                            >
                                <View style={[styles.iconCircle, type === 'EXPENSE_TRACKING' && styles.iconCircleActive]}>
                                    <Feather name="file-text" size={20} color={type === 'EXPENSE_TRACKING' ? colors.text.inverse : colors.primary.main} />
                                </View>
                                <View style={styles.typeContent}>
                                    <Text style={[styles.typeTitle, type === 'EXPENSE_TRACKING' && styles.typeTitleActive]}>
                                        Expense Tracking
                                    </Text>
                                    <Text style={styles.typeDesc}>
                                        Split bills and settle up later. Best for trips and daily expenses.
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.typeCard,
                                    type === 'POOL_SYSTEM' && styles.typeCardActive
                                ]}
                                onPress={() => setType('POOL_SYSTEM')}
                            >
                                <View style={[styles.iconCircle, type === 'POOL_SYSTEM' && styles.iconCircleActive]}>
                                    <Feather name="layers" size={20} color={type === 'POOL_SYSTEM' ? colors.text.inverse : colors.secondary.main} />
                                </View>
                                <View style={styles.typeContent}>
                                    <Text style={[styles.typeTitle, type === 'POOL_SYSTEM' && styles.typeTitleActive]}>
                                        Pool Group
                                    </Text>
                                    <Text style={styles.typeDesc}>
                                        Collect money first, then spend. Best for events and shared budgets.
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Currency</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                            {currencies.map((currency) => (
                                <TouchableOpacity
                                    key={currency.id}
                                    style={[
                                        styles.currencyChip,
                                        selectedCurrency === currency.id && styles.currencyChipActive
                                    ]}
                                    onPress={() => setSelectedCurrency(currency.id)}
                                >
                                    <Text style={[styles.currencySymbol, selectedCurrency === currency.id && { color: colors.text.inverse }]}>
                                        {currency.symbol}
                                    </Text>
                                    <Text style={[styles.currencyCode, selectedCurrency === currency.id && { color: colors.text.inverse }]}>
                                        {currency.code}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={handleCreate}
                        disabled={isLoading}
                    >
                        <LinearGradient
                            colors={gradientColors}
                            style={styles.gradientButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={colors.text.inverse} />
                            ) : (
                                <Text style={styles.buttonText}>Create Group</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: spacing.lg,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: spacing.md,
    },
    headerTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.inverse,
    },
    content: {
        flex: 1,
        padding: spacing.lg,
        marginTop: -20,
    },
    formCard: {
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        ...shadows.md,
    },
    inputGroup: {
        marginBottom: spacing.xl,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text.secondary,
        marginBottom: spacing.sm,
        textTransform: 'uppercase',
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral.gray[300],
        paddingVertical: spacing.sm,
        fontSize: typography.fontSize.lg,
        color: colors.text.primary,
    },
    typeContainer: {
        flexDirection: 'column',
        gap: spacing.md,
    },
    typeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: colors.background.primary,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.neutral.gray[200],
    },
    typeCardActive: {
        borderColor: colors.primary.main,
        backgroundColor: colors.primary.light + '20', // 20% opacity
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary.light,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    iconCircleActive: {
        backgroundColor: colors.primary.main,
    },
    typeContent: {
        flex: 1,
    },
    typeTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: '700',
        color: colors.text.primary,
        marginBottom: 2,
    },
    typeTitleActive: {
        color: colors.primary.main,
    },
    typeDesc: {
        fontSize: typography.fontSize.xs,
        color: colors.text.tertiary,
    },
    createButton: {
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
        fontWeight: typography.fontWeight.bold,
        color: colors.text.inverse,
    },
    currencyChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: colors.background.primary,
        borderWidth: 1,
        borderColor: colors.neutral.gray[300],
        marginRight: 8,
    },
    currencyChipActive: {
        backgroundColor: colors.primary.main,
        borderColor: colors.primary.main,
    },
    currencySymbol: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginRight: 6,
    },
    currencyCode: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.text.secondary,
    },
});
