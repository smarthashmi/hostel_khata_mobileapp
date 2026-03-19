import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
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

export default function GroupSettingsScreen() {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { groupId, groupName: initialName, currentCurrencyId } = route.params || {};

    const [name, setName] = useState(initialName || '');
    const [isLoading, setIsLoading] = useState(false);

    // Future: Add Currency Dropdown logic here if needed
    // const [currencies, setCurrencies] = useState([]);
    // const [selectedCurrency, setSelectedCurrency] = useState(currentCurrencyId);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Group name is required');
            return;
        }

        try {
            setIsLoading(true);
            const response = await apiMethods.group.update(groupId, {
                name,
                // currencyId: selectedCurrency // Uncomment when ready
            });

            if (response.data.success) {
                Alert.alert('Success', 'Group updated successfully', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert('Error', response.data.message || 'Failed to update group');
            }
        } catch (error: any) {
            console.error('Update group error:', error);
            const msg = error.response?.data?.message || 'An error occurred';
            Alert.alert('Error', msg);
        } finally {
            setIsLoading(false);
        }
    };

    // Defensive gradient
    const primaryGradient = colors?.primary?.gradient || ['#8B5CF6', '#7C3AED'];

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={primaryGradient as any}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color={colors.text.inverse} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Group Settings</Text>
                    <View style={{ width: 24 }} />
                </View>
            </LinearGradient>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.formCard}>

                        {/* Group Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Group Name</Text>
                            <View style={styles.inputContainer}>
                                <Feather name="users" size={20} color={colors.text.tertiary} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Enter group name"
                                    placeholderTextColor={colors.text.tertiary}
                                />
                            </View>
                        </View>

                        {/* Future: Currency Selector */}

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoSection}>
                        <Feather name="info" size={16} color={colors.text.tertiary} style={{ marginTop: 2, marginRight: 8 }} />
                        <Text style={styles.infoText}>
                            Only admins can edit group settings. changing the currency will affect how new transactions are displayed, but will not convert existing historical data.
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.secondary,
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
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold as any,
        color: colors.text.inverse,
    },
    backButton: {
        padding: 4,
    },
    content: {
        padding: spacing.lg,
    },
    formCard: {
        backgroundColor: colors.background.primary,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        ...shadows.md,
    },
    inputGroup: {
        marginBottom: spacing.lg,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold as any,
        color: colors.text.primary,
        marginBottom: spacing.xs,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.neutral.gray[200],
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        height: 50,
        backgroundColor: colors.background.primary,
    },
    inputIcon: {
        marginRight: spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: typography.fontSize.base,
        color: colors.text.primary,
    },
    saveButton: {
        backgroundColor: colors.primary.main,
        borderRadius: borderRadius.md,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.sm,
        ...shadows.sm,
    },
    saveButtonText: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold as any,
        color: colors.text.inverse,
    },
    infoSection: {
        flexDirection: 'row',
        marginTop: spacing.lg,
        paddingHorizontal: spacing.sm,
    },
    infoText: {
        fontSize: 12,
        color: colors.text.tertiary,
        flex: 1,
        lineHeight: 18,
    }
});
