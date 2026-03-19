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
    Platform,
    TextStyle
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
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

export default function EditTransactionScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { transaction, groupId, groupName, currencySymbol } = route.params;
    const { user } = useAuth();

    const [amount, setAmount] = useState(transaction?.amount?.toString() || '');
    const [description, setDescription] = useState(transaction?.description || '');
    const [isLoading, setIsLoading] = useState(false);
    const [members, setMembers] = useState<any[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial load logic
    useEffect(() => {
        fetchGroupMembers();
        if (transaction?.splits) {
            // Assuming splits contain user info or userIds
            const participantIds = transaction.splits.map((s: any) => s.userId || s.user?.id);
            setSelectedMembers(participantIds.filter((id: number) => id));
        }
    }, []);

    const fetchGroupMembers = async () => {
        try {
            setIsLoading(true);
            const response = await apiMethods.group.getById(groupId);
            if (response.data.success) {
                const groupData = response.data.data;
                setMembers(groupData.members);
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

    const handleUpdateTransaction = async () => {
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount.');
            return;
        }
        if (!description.trim()) {
            Alert.alert('Missing Description', 'Please enter a description.');
            return;
        }
        if (selectedMembers.length === 0) {
            Alert.alert('No Participants', 'Please select at least one person.');
            return;
        }

        try {
            setIsSubmitting(true);

            const updateData = {
                amount: parseFloat(amount),
                description,
                participantIds: selectedMembers,
                splitType: 'equal', // Keeping it simple for now
            };

            const response = await apiMethods.transaction.update(transaction.id, updateData);

            if (response.data.success) {
                Alert.alert('Success', 'Transaction updated successfully!', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            }
        } catch (error: any) {
            console.error('Update transaction error:', error);
            const msg = error.response?.data?.message || 'Failed to update transaction';
            Alert.alert('Error', msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTransaction = () => {
        Alert.alert(
            'Delete Transaction',
            'Are you sure you want to delete this transaction?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsSubmitting(true);
                            await apiMethods.transaction.delete(transaction.id);
                            navigation.goBack();
                        } catch (error) {
                            console.error('Delete error:', error);
                            Alert.alert('Error', 'Failed to delete transaction');
                            setIsSubmitting(false);
                        }
                    }
                }
            ]
        );
    };

    // Defensive gradient
    const primaryGradient = colors?.primary?.gradient || ['#8B5CF6', '#7C3AED'];

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <LinearGradient
                colors={primaryGradient as any}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Feather name="x" size={24} color={colors.text.inverse} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Transaction</Text>
                    <TouchableOpacity
                        onPress={handleUpdateTransaction}
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

                {/* Delete Button */}
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDeleteTransaction}
                    disabled={isSubmitting}
                >
                    <Feather name="trash-2" size={20} color={colors.error} style={{ marginRight: 8 }} />
                    <Text style={styles.deleteButtonText}>Delete Transaction</Text>
                </TouchableOpacity>

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
        paddingTop: Platform.OS === 'ios' ? 60 : 50,
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
        fontWeight: 'bold' as TextStyle['fontWeight'],
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
        fontWeight: 'bold' as TextStyle['fontWeight'],
        color: colors.text.primary,
        marginRight: spacing.xs,
    },
    amountInput: {
        fontSize: typography.fontSize['4xl'],
        fontWeight: 'bold' as TextStyle['fontWeight'],
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
        fontWeight: '500' as TextStyle['fontWeight'],
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: 'bold' as TextStyle['fontWeight'],
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
        fontWeight: 'bold' as TextStyle['fontWeight'],
        color: colors.primary.main,
    },
    memberName: {
        fontSize: typography.fontSize.sm,
        color: colors.text.primary,
        fontWeight: '500' as TextStyle['fontWeight'],
    },
    memberNameSelected: {
        color: colors.text.inverse,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: '#FEE2E2', // Light red
        marginTop: spacing.xl,
    },
    deleteButtonText: {
        color: colors.error,
        fontWeight: 'bold' as TextStyle['fontWeight'],
        fontSize: typography.fontSize.base,
    }
});
