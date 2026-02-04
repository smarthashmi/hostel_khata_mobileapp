import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Platform,
    StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius, shadows } from '../config/theme';

export default function DashboardScreen() {
    const user = { name: 'Smart Hashmi' };
    const groups = [
        { id: 1, name: 'Hostel Room 201', balance: 1250.50, members: 4, color: colors.primary.main },
        { id: 2, name: 'Weekend Trip', balance: -320.00, members: 6, color: colors.accent.cyan },
        { id: 3, name: 'Office Lunch', balance: 0, members: 8, color: colors.accent.emerald },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header with Gradient */}
            <LinearGradient
                colors={colors.primary.gradient}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.greeting}>Welcome back,</Text>
                        <Text style={styles.userName}>{user.name}</Text>
                    </View>
                    <TouchableOpacity style={styles.profileButton}>
                        <View style={styles.profileCircle}>
                            <Text style={styles.profileInitial}>{user.name.charAt(0)}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.primary.main }]}>
                        <View style={styles.actionIcon}>
                            <Text style={styles.actionEmoji}>➕</Text>
                        </View>
                        <Text style={styles.actionText}>Create Group</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.accent.cyan }]}>
                        <View style={styles.actionIcon}>
                            <Text style={styles.actionEmoji}>🔗</Text>
                        </View>
                        <Text style={styles.actionText}>Join Group</Text>
                    </TouchableOpacity>
                </View>

                {/* Your Groups */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Your Groups</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAll}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {groups.map((group) => (
                        <TouchableOpacity key={group.id} style={styles.groupCard} activeOpacity={0.7}>
                            <View style={styles.groupCardContent}>
                                <View style={[styles.groupIcon, { backgroundColor: group.color + '20' }]}>
                                    <Text style={styles.groupEmoji}>🏠</Text>
                                </View>

                                <View style={styles.groupInfo}>
                                    <Text style={styles.groupName}>{group.name}</Text>
                                    <Text style={styles.groupMembers}>{group.members} members</Text>
                                </View>

                                <View style={styles.groupBalance}>
                                    <Text style={[
                                        styles.balanceAmount,
                                        { color: group.balance >= 0 ? colors.success : colors.error }
                                    ]}>
                                        {group.balance >= 0 ? '+' : ''}₹{Math.abs(group.balance).toFixed(2)}
                                    </Text>
                                    <Text style={styles.balanceLabel}>
                                        {group.balance >= 0 ? 'You get' : 'You owe'}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Recent Activity */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>

                    <View style={styles.activityCard}>
                        <View style={[styles.activityIcon, { backgroundColor: colors.error + '20' }]}>
                            <Text style={styles.activityEmoji}>💸</Text>
                        </View>
                        <View style={styles.activityInfo}>
                            <Text style={styles.activityTitle}>Dinner at Restaurant</Text>
                            <Text style={styles.activitySubtitle}>Hostel Room 201 • 2 hours ago</Text>
                        </View>
                        <Text style={[styles.activityAmount, { color: colors.error }]}>-₹450</Text>
                    </View>

                    <View style={styles.activityCard}>
                        <View style={[styles.activityIcon, { backgroundColor: colors.success + '20' }]}>
                            <Text style={styles.activityEmoji}>💰</Text>
                        </View>
                        <View style={styles.activityInfo}>
                            <Text style={styles.activityTitle}>Pool Deposit</Text>
                            <Text style={styles.activitySubtitle}>Weekend Trip • Yesterday</Text>
                        </View>
                        <Text style={[styles.activityAmount, { color: colors.success }]}>+₹1000</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity style={styles.fab} activeOpacity={0.9}>
                <LinearGradient
                    colors={colors.primary.gradient}
                    style={styles.fabGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Text style={styles.fabIcon}>+</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.secondary,
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight! + 10,
        paddingBottom: spacing.xl,
        paddingHorizontal: spacing.lg,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greeting: {
        fontSize: typography.fontSize.sm,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: typography.fontWeight.medium,
    },
    userName: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.black,
        color: colors.text.inverse,
        marginTop: spacing.xs,
    },
    profileButton: {
        padding: spacing.xs,
    },
    profileCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    profileInitial: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.inverse,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    quickActions: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        gap: spacing.md,
    },
    actionCard: {
        flex: 1,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        alignItems: 'center',
        ...shadows.md,
    },
    actionIcon: {
        marginBottom: spacing.sm,
    },
    actionEmoji: {
        fontSize: 32,
    },
    actionText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.inverse,
    },
    section: {
        paddingHorizontal: spacing.lg,
        marginTop: spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.black,
        color: colors.text.primary,
    },
    seeAll: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.primary.main,
    },
    groupCard: {
        backgroundColor: colors.background.primary,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    groupCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    groupIcon: {
        width: 56,
        height: 56,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    groupEmoji: {
        fontSize: 28,
    },
    groupInfo: {
        flex: 1,
    },
    groupName: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        marginBottom: spacing.xs / 2,
    },
    groupMembers: {
        fontSize: typography.fontSize.xs,
        color: colors.text.tertiary,
        fontWeight: typography.fontWeight.medium,
    },
    groupBalance: {
        alignItems: 'flex-end',
    },
    balanceAmount: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.black,
        marginBottom: spacing.xs / 2,
    },
    balanceLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.text.tertiary,
        fontWeight: typography.fontWeight.medium,
    },
    activityCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.primary,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
        ...shadows.sm,
    },
    activityIcon: {
        width: 44,
        height: 44,
        borderRadius: borderRadius.sm,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    activityEmoji: {
        fontSize: 20,
    },
    activityInfo: {
        flex: 1,
    },
    activityTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text.primary,
        marginBottom: spacing.xs / 2,
    },
    activitySubtitle: {
        fontSize: typography.fontSize.xs,
        color: colors.text.tertiary,
    },
    activityAmount: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.black,
    },
    fab: {
        position: 'absolute',
        bottom: spacing.xl,
        right: spacing.lg,
        borderRadius: 32,
        ...shadows.xl,
    },
    fabGradient: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fabIcon: {
        fontSize: 32,
        color: colors.text.inverse,
        fontWeight: typography.fontWeight.bold,
    },
});
