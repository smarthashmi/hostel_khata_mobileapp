import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import apiMethods from '../services/apiMethods';
import theme from '../config/theme';
import { Feather } from '@expo/vector-icons';

const safeTheme = theme || {};
const colors = safeTheme.colors || {
    primary: { main: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED'], light: '#F3E8FF' },
    secondary: { main: '#06B6D4', gradient: ['#06B6D4', '#0891B2'], light: '#CFFAFE' },
    background: { primary: '#FFFFFF', secondary: '#F9FAFB' },
    text: { primary: '#000', secondary: '#4B5563', tertiary: '#9CA3AF', inverse: '#FFF' },
    neutral: { gray: { '100': '#F3F4F6', '200': '#E5E7EB', '300': '#D1D5DB' } },
    accent: { emerald: '#10B981', error: '#EF4444' },
    error: '#EF4444', info: '#3B82F6', warning: '#F59E0B'
} as any;
const { spacing, typography, borderRadius, shadows } = safeTheme as any;

// Types
interface Group {
    id: number;
    name: string;
    code: string;
    role: string;
    type?: string;
    totalPoolBalance?: string;
    defaultCurrency?: {
        symbol: string;
        code: string;
    };
    _count?: {
        members: number;
    };
}

export default function GroupListScreen() {
    const navigation = useNavigation<any>();
    const [groups, setGroups] = useState<Group[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchGroups = async () => {
        try {
            const response = await apiMethods.group.getAll();
            if (response.data.success) {
                setGroups(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
            // Don't alert on initial load to avoid spamming if offline
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchGroups();
    };

    const renderGroupItem = ({ item }: { item: Group }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('GroupDetails', { groupId: item.id, groupName: item.name })}
            activeOpacity={0.7}
        >
            <View style={styles.cardHeader}>
                <View style={[
                    styles.iconContainer,
                    { backgroundColor: item.type === 'POOL_SYSTEM' ? colors.primary.light : colors.secondary.light }
                ]}>
                    <Feather
                        name={item.type === 'POOL_SYSTEM' ? 'layers' : 'list'}
                        size={24}
                        color={item.type === 'POOL_SYSTEM' ? colors.primary.main : colors.secondary.main}
                    />
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.groupName}>{item.name}</Text>
                    <Text style={styles.groupCode}>Code: {item.code}</Text>
                </View>
                <View style={styles.chevron}>
                    <Feather name="chevron-right" size={20} color={colors.text.tertiary} />
                </View>
            </View>
            <View style={styles.cardFooter}>
                <View style={styles.badge}>
                    <Feather name="users" size={12} color={colors.primary.main} style={{ marginRight: 4 }} />
                    <Text style={styles.badgeText}>{item._count?.members || 1} Members</Text>
                </View>
                <View style={[styles.badge, styles.roleBadge]}>
                    <Text style={[styles.badgeText, { color: colors.secondary.main }]}>{item.role}</Text>
                </View>
                {/* Balance Badge */}
                <View style={[styles.badge, { backgroundColor: colors.accent.emerald + '15', marginLeft: 'auto', marginRight: 0 }]}>
                    <Feather name="briefcase" size={12} color={colors.accent.emerald} style={{ marginRight: 4 }} />
                    <Text style={[styles.badgeText, { color: colors.accent.emerald, fontWeight: 'bold' }]}>
                        {item.defaultCurrency?.symbol || '$'}{parseFloat(item.totalPoolBalance || '0').toFixed(2)}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>No Groups Yet</Text>
            <Text style={styles.emptySubtitle}>Create a group or join one to get started!</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={colors.primary.gradient as any}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>My Groups</Text>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => navigation.navigate('JoinGroup')}
                        >
                            <Feather name="log-in" size={20} color={colors.text.inverse} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => navigation.navigate('CreateGroup')}
                        >
                            <Feather name="plus" size={20} color={colors.text.inverse} />
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>

            {/* Content */}
            {isLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                </View>
            ) : (
                <FlatList
                    data={groups}
                    renderItem={renderGroupItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.main} />
                    }
                    ListEmptyComponent={renderEmptyState}
                />
            )}
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
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.text.inverse,
    },
    headerActions: {
        flexDirection: 'row',
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: spacing.sm,
    },
    listContent: {
        padding: spacing.md,
        paddingTop: spacing.lg,
        flexGrow: 1,
    },
    card: {
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary.light,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    iconText: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.primary.main,
    },
    cardContent: {
        flex: 1,
    },
    groupName: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text.primary,
        marginBottom: 2,
    },
    groupCode: {
        fontSize: typography.fontSize.xs,
        color: colors.text.tertiary,
    },
    chevron: {
        marginLeft: spacing.sm,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: colors.neutral.gray[100],
        paddingTop: spacing.sm,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.neutral.gray[100],
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: spacing.sm,
    },
    roleBadge: {
        backgroundColor: colors.secondary.light,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: typography.fontWeight.medium,
        color: colors.text.secondary,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    emptyTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    emptySubtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        textAlign: 'center',
        paddingHorizontal: spacing.xl,
    },
});
