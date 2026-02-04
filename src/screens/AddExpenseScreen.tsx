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

export default function AddExpenseScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { groupId, groupName, currencySymbol } = route.params;
    const { user } = useAuth();

    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [members, setMembers] = useState<any[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFromPool, setIsFromPool] = useState(false);
    const [isPoolGroup, setIsPoolGroup] = useState(false);

    useEffect(() => {
        fetchGroupMembers();
    }, []);

    const fetchGroupMembers = async () => {
        try {
            setIsLoading(true);
            const response = await apiMethods.group.getById(groupId);
            if (response.data.success) {
                const groupData = response.data.data;
                const groupMembers = groupData.members;
                setMembers(groupMembers);
                setSelectedMembers(groupMembers.map((m: any) => m.user.id));

                // Check if group is pool system
                if (groupData.type === 'POOL_SYSTEM') {
                    setIsPoolGroup(true);
                }
            }
        } catch (error) {
            console.error('Error fetching members:', error);
            Alert.alert('Error', 'Failed to load group members');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMemberSelection = (userId: number) => {
        if (selectedMembers.includes(userId)) {
            setSelectedMembers(selectedMembers.filter(id => id !== userId));
        } else {
            setSelectedMembers([...selectedMembers, userId]);
        }
    };

    const handleCreateExpense = async () => {
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount.');
            return;
        }
        if (!description.trim()) {
            Alert.alert('Missing Description', 'Please enter a description for the expense.');
            return;
        }
        if (selectedMembers.length === 0) {
            Alert.alert('No Participants', 'Please select at least one person to split with.');
            return;
        }

        try {
            setIsSubmitting(true);

            const expenseData = {
                groupId,
                amount: parseFloat(amount),
                description,
                participantIds: selectedMembers,
                splitType: 'equal', // Simplify for MVP
                isFromPoolFund: isFromPool,
                currencyId: null // Use default
            };

            const response = await apiMethods.transaction.createExpense(expenseData); // We need to ensure this method exists or use generic create

            if (response.data.success) {
                Alert.alert('Success', 'Expense added successfully!');
                navigation.goBack();
            }
        } catch (error: any) {
            console.error('Create expense error:', error);
            const msg = error.response?.data?.message || 'Failed to create expense';
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
                    <Text style={styles.headerTitle}>Add Expense</Text>
                    <TouchableOpacity
                        onPress={handleCreateExpense}
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

                {/* Description Input */}
                <View style={styles.inputGroup}>
                    <Feather name="file-text" size={20} color={colors.text.secondary} style={styles.inputIcon} />
                    <TextInput
                        style={styles.textInput}
                        placeholder="What is this for?"
                        placeholderTextColor={colors.text.tertiary}
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>

                {/* Split With Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Split with</Text>
                    {isLoading ? (
                        <ActivityIndicator color={colors.primary.main} />
                    ) : (
                        <View style={styles.membersGrid}>
                            {members.map((member: any) => {
                                const isSelected = selectedMembers.includes(member.user.id);
                                return (
                                    <TouchableOpacity
                                        key={member.id}
                                        style={[
                                            styles.memberChip,
                                            isSelected && styles.memberChipSelected
                                        ]}
                                        onPress={() => toggleMemberSelection(member.user.id)}
                                    >
                                        <View style={[
                                            styles.avatarSmall,
                                            isSelected && { backgroundColor: colors.neutral.white }
                                        ]}>
                                            <Text style={[
                                                styles.avatarText,
                                                isSelected && { color: colors.primary.main }
                                            ]}>
                                                {member.user.name.charAt(0)}
                                            </Text>
                                        </View>
                                        <Text style={[
                                            styles.memberName,
                                            isSelected && styles.memberNameSelected
                                        ]}>
                                            {member.user.id === user?.id ? 'You' : (member.user.name || 'Unknown').split(' ')[0]}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Paid by</Text>

                    {isPoolGroup && (
                        <TouchableOpacity
                            style={styles.checkboxContainer}
                            onPress={() => setIsFromPool(!isFromPool)}
                        >
                            <View style={[styles.checkbox, isFromPool && styles.checkboxChecked]}>
                                {isFromPool && <Feather name="check" size={16} color={colors.text.inverse} />}
                            </View>
                            <Text style={styles.checkboxLabel}>Pay from Pool Fund</Text>
                        </TouchableOpacity>
                    )}

                    {!isFromPool && (
                        <View style={styles.payerRow}>
                            <View style={styles.memberChipSelected}>
                                <View style={[styles.avatarSmall, { backgroundColor: colors.neutral.white }]}>
                                    <Text style={[styles.avatarText, { color: colors.primary.main }]}>
                                        {user?.name?.charAt(0) || 'U'}
                                    </Text>
                                </View>
                                <Text style={styles.memberNameSelected}>You</Text>
                            </View>
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
    amountContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: spacing.xl,
    },
    currencySymbol: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: 'bold',
        color: colors.text.primary,
        marginRight: spacing.xs,
    },
    amountInput: {
        fontSize: typography.fontSize['4xl'],
        fontWeight: 'bold',
        color: colors.text.primary,
        minWidth: 100,
        textAlign: 'center',
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.secondary,
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
        fontWeight: '500',
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: 'bold',
        color: colors.text.secondary,
        marginBottom: spacing.md,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    membersGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    memberChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: colors.background.secondary,
        borderWidth: 1,
        borderColor: colors.neutral.gray[200],
    },
    memberChipSelected: {
        backgroundColor: colors.primary.main,
        borderColor: colors.primary.main,
    },
    avatarSmall: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.primary.light,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    avatarText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.primary.main,
    },
    memberName: {
        fontSize: typography.fontSize.sm,
        color: colors.text.primary,
        fontWeight: '500',
    },
    memberNameSelected: {
        color: colors.text.inverse,
    },
    payerRow: {
        flexDirection: 'row',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: colors.primary.main,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    checkboxChecked: {
        backgroundColor: colors.primary.main,
    },
    checkboxLabel: {
        fontSize: typography.fontSize.base,
        color: colors.text.primary,
        fontWeight: '500',
    }
});
