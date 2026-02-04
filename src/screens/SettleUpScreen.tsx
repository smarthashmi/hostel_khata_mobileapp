import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../config/theme';
import apiMethods from '../services/apiMethods';
import { useAuth } from '../contexts/AuthContext';

export default function SettleUpScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { groupId, groupName, currencySymbol } = route.params;
    const { user } = useAuth();

    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [members, setMembers] = useState<any[]>([]);
    const [selectedReceiver, setSelectedReceiver] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchGroupMembers();
    }, []);

    const fetchGroupMembers = async () => {
        try {
            setIsLoading(true);
            const response = await apiMethods.group.getById(groupId);
            if (response.data.success) {
                // Filter out current user from potential receivers
                const others = response.data.data.members.filter((m: any) => m.user.id !== user?.id);
                setMembers(others);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
            Alert.alert('Error', 'Failed to load group members');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSettleUp = async () => {
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount.');
            return;
        }
        if (!selectedReceiver) {
            Alert.alert('Select Receiver', 'Please select who you are paying.');
            return;
        }

        try {
            setIsSubmitting(true);

            // To record a settlement using the expense API:
            // Payer: Current User
            // Participants: [Receiver]
            // Split: Equal (100% to receiver)
            // Description: Settlement

            const receiver = members.find(m => m.user.id === selectedReceiver);
            const receiverName = receiver ? receiver.user.name : 'Unknown';

            const expenseData = {
                groupId,
                amount: parseFloat(amount),
                description: `Settlement to ${receiverName}`,
                participantIds: [selectedReceiver],
                splitType: 'equal',
                isFromPoolFund: false,
                currencyId: null,
                tags: 'settlement' // Optional tag to identify it
            };

            const response = await apiMethods.transaction.createExpense(expenseData);

            if (response.data.success) {
                Alert.alert('Success', 'Payment recorded successfully!');
                navigation.goBack();
            }
        } catch (error: any) {
            console.error('Settle up error:', error);
            const msg = error.response?.data?.message || 'Failed to record payment';
            Alert.alert('Error', msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Cast colors for LinearGradient
    const gradientColors = colors.primary.gradient as unknown as readonly [string, string, ...string[]];

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                    <Text style={styles.headerTitle}>Settle Up</Text>
                    <TouchableOpacity
                        onPress={handleSettleUp}
                        disabled={isSubmitting}
                        style={styles.saveButton}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator size="small" color={colors.text.inverse} />
                        ) : (
                            <Feather name="check" size={24} color={colors.text.inverse} />
                        )}
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.centerContent}>
                    <Text style={styles.label}>You paid</Text>

                    {/* Amount Input */}
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

                    <Text style={[styles.label, { marginBottom: spacing.lg }]}>to</Text>
                </View>

                {/* Receiver Selection */}
                <View style={styles.section}>
                    {isLoading ? (
                        <ActivityIndicator color={colors.primary.main} />
                    ) : (
                        <View style={styles.membersList}>
                            {members.length === 0 ? (
                                <Text style={styles.emptyText}>No other members to pay.</Text>
                            ) : members.map((member: any) => {
                                const isSelected = selectedReceiver === member.user.id;
                                return (
                                    <TouchableOpacity
                                        key={member.id}
                                        style={[
                                            styles.memberRow,
                                            isSelected && styles.memberRowSelected
                                        ]}
                                        onPress={() => setSelectedReceiver(member.user.id)}
                                    >
                                        <View style={styles.memberInfo}>
                                            <View style={styles.avatar}>
                                                <Text style={styles.avatarText}>{member.user.name.charAt(0)}</Text>
                                            </View>
                                            <Text style={[
                                                styles.memberName,
                                                isSelected && { fontWeight: 'bold', color: colors.primary.main }
                                            ]}>
                                                {member.user.name}
                                            </Text>
                                        </View>
                                        {isSelected && (
                                            <Feather name="check-circle" size={24} color={colors.primary.main} />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </View>
            </ScrollView>
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
    saveButton: {
        padding: spacing.xs,
    },
    content: {
        padding: spacing.lg,
    },
    centerContent: {
        alignItems: 'center',
        marginTop: spacing.xl,
    },
    label: {
        fontSize: typography.fontSize.lg,
        color: colors.text.secondary,
        fontWeight: '500',
    },
    amountContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: spacing.md,
    },
    currencySymbol: {
        fontSize: typography.fontSize['4xl'],
        fontWeight: 'bold',
        color: colors.text.primary,
        marginRight: spacing.xs,
    },
    amountInput: {
        fontSize: typography.fontSize['5xl'],
        fontWeight: 'bold',
        color: colors.text.primary,
        minWidth: 100,
        textAlign: 'center',
        padding: 0,
    },
    section: {
        marginTop: spacing.lg,
    },
    membersList: {
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.lg,
        padding: spacing.sm,
    },
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.xs,
    },
    memberRowSelected: {
        backgroundColor: colors.primary.light + '20', // Light primary tint
        borderWidth: 1,
        borderColor: colors.primary.main,
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.neutral.gray[200],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    avatarText: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        color: colors.text.secondary,
    },
    memberName: {
        fontSize: typography.fontSize.base,
        color: colors.text.primary,
    },
    emptyText: {
        textAlign: 'center',
        padding: spacing.lg,
        color: colors.text.tertiary,
    }
});
