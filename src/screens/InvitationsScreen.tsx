import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import apiMethods from '../services/apiMethods';
import theme from '../config/theme';

const colors = theme?.colors || {
    primary: { main: '#8B5CF6' },
    background: { primary: '#FFFFFF', secondary: '#F9FAFB' },
    text: { primary: '#000', secondary: '#4B5563', tertiary: '#9CA3AF', inverse: '#FFF' },
    neutral: { gray: { '200': '#E5E7EB', '300': '#D1D5DB' } },
    accent: { emerald: '#10B981', error: '#EF4444', warning: '#F59E0B' }
} as any;
const spacing = theme?.spacing || { sm: 8, md: 16, lg: 24, xl: 32 } as any;

export default function InvitationsScreen() {
    const navigation = useNavigation<any>();
    const [invitations, setInvitations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            fetchInvitations();
        }, [])
    );

    const fetchInvitations = async () => {
        setIsLoading(true);
        try {
            const res = await apiMethods.invitation.getPendingInvitations();
            if (res.data.success) {
                setInvitations(res.data.data || []);
            }
        } catch (error) {
            console.log('Error fetching invitations', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRespond = async (invId: number, action: 'ACCEPT' | 'REJECT', groupId?: number) => {
        try {
            const res = await apiMethods.invitation.respondToInvitation(invId, action);
            if (res.data.success) {
                Alert.alert('Success', res.data.message || `Invitation ${action.toLowerCase()}ed.`);
                if (action === 'ACCEPT' && groupId) {
                    navigation.replace('GroupDetails', { groupId });
                } else {
                    fetchInvitations();
                }
            }
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to respond to invitation');
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={colors.primary.main} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Group Invitations</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* List */}
            {invitations.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Feather name="users" size={48} color={colors.text.tertiary} />
                    <Text style={styles.emptyTitle}>All caught up!</Text>
                    <Text style={styles.emptyText}>You have no pending group invitations.</Text>
                </View>
            ) : (
                <FlatList
                    data={invitations}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ padding: spacing.lg }}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={styles.groupIcon}>
                                    <Text style={styles.groupIconText}>
                                        {item.group?.name?.charAt(0) || 'G'}
                                    </Text>
                                </View>
                                <View style={styles.groupInfo}>
                                    <Text style={styles.groupName}>{item.group?.name}</Text>
                                    <Text style={styles.groupType}>
                                        {item.group?.type === 'POOL_SYSTEM' ? 'Pool System' : 'Expense Tracking'}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.inviterInfo}>
                                <Text style={styles.inviterText}>
                                    Invited by <Text style={{ fontWeight: 'bold' }}>{item.invitedBy?.name}</Text>
                                </Text>
                            </View>

                            <View style={styles.actions}>
                                <TouchableOpacity
                                    style={[styles.btn, styles.btnReject]}
                                    onPress={() => handleRespond(item.id, 'REJECT')}
                                >
                                    <Text style={styles.btnRejectText}>Decline</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.btn, styles.btnAccept]}
                                    onPress={() => handleRespond(item.id, 'ACCEPT', item.group?.id)}
                                >
                                    <Text style={styles.btnAcceptText}>Accept</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.secondary },
    centered: { justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingTop: 60,
        paddingBottom: spacing.md,
        backgroundColor: colors.background.primary,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral.gray[200],
    },
    backButton: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: colors.text.primary },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: spacing.md, color: colors.text.primary },
    emptyText: { fontSize: 14, color: colors.text.secondary, marginTop: 4, textAlign: 'center' },
    card: {
        backgroundColor: colors.background.primary,
        borderRadius: 16,
        padding: spacing.md,
        marginBottom: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
    groupIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary.main + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    groupIconText: { fontSize: 20, fontWeight: 'bold', color: colors.primary.main },
    groupInfo: { flex: 1 },
    groupName: { fontSize: 16, fontWeight: 'bold', color: colors.text.primary, marginBottom: 2 },
    groupType: { fontSize: 12, color: colors.text.secondary },
    inviterInfo: { paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.neutral.gray[200] },
    inviterText: { fontSize: 13, color: colors.text.secondary },
    actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
    btn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    btnReject: { backgroundColor: colors.neutral.gray[200] },
    btnRejectText: { color: colors.text.primary, fontWeight: 'bold' },
    btnAccept: { backgroundColor: colors.primary.main },
    btnAcceptText: { color: '#FFF', fontWeight: 'bold' },
});
