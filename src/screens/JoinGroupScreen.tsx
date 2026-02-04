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

export default function JoinGroupScreen() {
    const navigation = useNavigation();
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleJoin = async () => {
        if (!code.trim()) {
            Alert.alert('Error', 'Please enter a group code');
            return;
        }

        setIsLoading(true);
        try {
            const response = await apiMethods.group.join(code);
            if (response.data.success) {
                Alert.alert('Success', 'Joined group successfully!', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            }
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to join group');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <LinearGradient
                colors={colors.secondary.gradient}
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
                <Text style={styles.headerTitle}>Join a Group</Text>
            </LinearGradient>

            <View style={styles.content}>
                <View style={styles.formCard}>
                    <View style={styles.iconContainer}>
                        <Feather name="users" size={40} color={colors.secondary.main} />
                    </View>
                    <Text style={styles.description}>
                        Enter the 6-character code provided by your group admin to join the group.
                    </Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Group Code</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. A1B2C3"
                            placeholderTextColor={colors.text.tertiary}
                            value={code}
                            onChangeText={(text) => setCode(text.toUpperCase())}
                            autoFocus
                            maxLength={6}
                            autoCapitalize="characters"
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.joinButton}
                        onPress={handleJoin}
                        disabled={isLoading}
                    >
                        <LinearGradient
                            colors={colors.secondary.gradient}
                            style={styles.gradientButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={colors.text.inverse} />
                            ) : (
                                <Text style={styles.buttonText}>Join Group</Text>
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
        alignItems: 'center',
        ...shadows.md,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.secondary.light,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    description: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
        paddingHorizontal: spacing.md,
    },
    inputGroup: {
        width: '100%',
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
        borderBottomWidth: 2,
        borderBottomColor: colors.secondary.main,
        paddingVertical: spacing.sm,
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.text.primary,
        textAlign: 'center',
        letterSpacing: 8,
    },
    joinButton: {
        width: '100%',
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
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
});
