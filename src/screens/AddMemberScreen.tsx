import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Share,
    ActivityIndicator,
    Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../config/theme';
import apiMethods from '../services/apiMethods';

export default function AddMemberScreen() {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { groupId, groupName, groupCode } = route.params;

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleShareCode = async () => {
        try {
            await Share.share({
                message: `Join my group "${groupName}" on Hostel Khata! Use code: ${groupCode}`,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleAddVirtualMember = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter a name');
            return;
        }

        setIsLoading(true);
        try {
            // Assuming apiMethods.group.addVirtualMember exists or we use a generic post
            // Since it wasn't in apiMethods.ts, I'll add it to the file next or direct call
            // But for now let's assume I'll add it.
            // Wait, I should verify if I added it. I didn't add it to apiMethods.ts yet.
            // I will use apiClient directly or update apiMethods.
            // Let's use a placeholder call for now and I will update apiMethods.ts immediately after.
            // Actually, the previous task updated apiMethods.ts but didn't add addVirtualMember.
            // I'll assume I will add apiMethods.group.addVirtualMember
            await apiMethods.group.addVirtualMember(groupId, { name, email });

            Alert.alert('Success', 'Member added successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to add member');
        } finally {
            setIsLoading(false);
        }
    };

    const gradientColors = colors.primary.gradient as unknown as readonly [string, string, ...string[]];

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <LinearGradient
                colors={gradientColors}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color={colors.text.inverse} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Member</Text>
            </LinearGradient>

            <View style={styles.content}>

                {/* Invite Code Section */}
                {groupCode && (
                    <View style={styles.card}>
                        <View style={styles.iconCircle}>
                            <Feather name="share-2" size={24} color={colors.primary.main} />
                        </View>
                        <Text style={styles.cardTitle}>Invite via Code</Text>
                        <Text style={styles.cardDesc}>
                            Share this code with friends to let them join themselves.
                        </Text>
                        <TouchableOpacity style={styles.codeBox} onPress={handleShareCode}>
                            <Text style={styles.codeText}>{groupCode}</Text>
                            <Feather name="copy" size={20} color={colors.text.primary} />
                        </TouchableOpacity>
                    </View>
                )}

                <Text style={styles.sectionTitle}>OR ADD MANUALLY</Text>

                {/* Add Virtual Member Form */}
                <View style={styles.formCard}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. John Doe"
                            placeholderTextColor={colors.text.tertiary}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email (Optional)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. john@example.com"
                            placeholderTextColor={colors.text.tertiary}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={handleAddVirtualMember}
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
                                <Text style={styles.buttonText}>Add Member</Text>
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
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: spacing.lg,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        ...shadows.md,
    },
    backButton: {
        marginRight: spacing.md,
    },
    headerTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: 'bold',
        color: colors.text.inverse,
    },
    content: {
        flex: 1,
        padding: spacing.lg,
    },
    card: {
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.lg,
        padding: spacing.xl,
        alignItems: 'center',
        marginBottom: spacing.xl,
        ...shadows.sm,
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.primary.light + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    cardTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    cardDesc: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    codeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.primary,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.neutral.gray[300],
        gap: spacing.md,
    },
    codeText: {
        fontSize: typography.fontSize.xl,
        fontWeight: 'bold',
        color: colors.primary.main,
        letterSpacing: 2,
    },
    sectionTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: 'bold',
        color: colors.text.tertiary,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    formCard: {
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.lg,
        padding: spacing.xl,
        ...shadows.sm,
    },
    inputGroup: {
        marginBottom: spacing.lg,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.text.secondary,
        marginBottom: spacing.xs,
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral.gray[300],
        paddingVertical: spacing.sm,
        fontSize: typography.fontSize.md,
        color: colors.text.primary,
    },
    addButton: {
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        marginTop: spacing.md,
        ...shadows.md,
    },
    gradientButton: {
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: typography.fontSize.md,
        fontWeight: 'bold',
        color: colors.text.inverse,
    },
});
