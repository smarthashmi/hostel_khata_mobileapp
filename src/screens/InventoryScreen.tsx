import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    RefreshControl,
    TextInput,
    Modal
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import theme from '../config/theme';
import apiMethods from '../services/apiMethods';
import { LinearGradient } from 'expo-linear-gradient';

const safeTheme = theme || {};
const colors = safeTheme.colors || {
    primary: { main: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED'], light: '#F3E8FF' },
    background: { primary: '#FFFFFF', secondary: '#F9FAFB' },
    text: { primary: '#000', secondary: '#4B5563', tertiary: '#9CA3AF', inverse: '#FFF' },
    neutral: { gray: { '200': '#E5E7EB', '300': '#D1D5DB' } },
    accent: { emerald: '#10B981', error: '#EF4444', warning: '#F59E0B' }
} as any;
const { spacing, typography, borderRadius, shadows } = safeTheme as any;

export default function InventoryScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { groupId, groupName } = route.params;

    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal State - Add Item
    const [showAddModal, setShowAddModal] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [newItemStock, setNewItemStock] = useState('1');
    const [newItemUnit, setNewItemUnit] = useState('pcs');
    const [newItemMinStock, setNewItemMinStock] = useState('2');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useFocusEffect(
        useCallback(() => {
            fetchItems();
        }, [groupId])
    );

    const fetchItems = async () => {
        try {
            const res = await apiMethods.inventory.getItems(groupId);
            if (res.data.success) {
                setItems(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch inventory:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const handleCreateItem = async () => {
        if (!newItemName.trim()) {
            Alert.alert('Error', 'Item name is required');
            return;
        }

        try {
            setIsSubmitting(true);
            const data = {
                name: newItemName,
                stock: parseFloat(newItemStock),
                unit: newItemUnit,
                minStock: parseFloat(newItemMinStock)
            };
            const res = await apiMethods.inventory.create(groupId, data);
            if (res.data.success) {
                setShowAddModal(false);
                setNewItemName('');
                setNewItemStock('1');
                fetchItems(); // Refresh list
            }
        } catch (error) {
            console.error('Create error:', error);
            Alert.alert('Error', 'Failed to create item');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateStock = async (itemId: number, change: number) => {
        try {
            // Optimistic update
            setItems(prev => prev.map(item =>
                item.id === itemId
                    ? { ...item, stock: (parseFloat(item.stock) + change).toString() }
                    : item
            ));

            await apiMethods.inventory.updateStock(itemId, {
                changeAmount: change,
                reason: change > 0 ? 'Quick Add' : 'Quick Consume'
            });

            // Background refresh to sync perfectly
            fetchItems();
        } catch (error) {
            console.error('Update stock error:', error);
            Alert.alert('Error', 'Failed to update stock');
            fetchItems(); // Revert on error
        }
    };

    const handleDelete = (itemId: number) => {
        Alert.alert(
            'Delete Item',
            'Are you sure you want to delete this inventory item?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await apiMethods.inventory.delete(itemId);
                            fetchItems();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete item');
                        }
                    }
                }
            ]
        );
    };

    const getStockStatusColor = (item: any) => {
        const stock = parseFloat(item.stock);
        const min = parseFloat(item.minStock || '0');
        if (stock <= 0) return colors.accent.error;
        if (stock <= min) return colors.accent.warning;
        return colors.accent.emerald;
    };

    const filteredItems = items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={colors.primary.gradient}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color={colors.text.inverse} />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Inventory</Text>
                        <Text style={styles.headerSubtitle}>{groupName}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.logButton}
                        onPress={() => Alert.alert('Coming Soon', 'Logs view will be added in next update')}
                    >
                        <Feather name="clock" size={24} color={colors.text.inverse} />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <View style={styles.searchContainer}>
                <Feather name="search" size={20} color={colors.text.tertiary} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search items..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={colors.text.tertiary}
                />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchItems} tintColor={colors.primary.main} />}
            >
                {isLoading ? (
                    <ActivityIndicator size="large" color={colors.primary.main} style={{ marginTop: 20 }} />
                ) : filteredItems.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Feather name="box" size={48} color={colors.neutral.gray[300]} />
                        <Text style={styles.emptyText}>No items found</Text>
                        <TouchableOpacity style={styles.emptyButton} onPress={() => setShowAddModal(true)}>
                            <Text style={styles.emptyButtonText}>Add First Item</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    filteredItems.map(item => (
                        <View key={item.id} style={styles.itemCard}>
                            <View style={[styles.statusIndicator, { backgroundColor: getStockStatusColor(item) }]} />

                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemStock}>
                                    {parseFloat(item.stock).toFixed(item.unit === 'pcs' ? 0 : 2)} {item.unit}
                                    {parseFloat(item.stock) <= parseFloat(item.minStock) && (
                                        <Text style={{ color: colors.accent.warning }}> • Low Stock</Text>
                                    )}
                                </Text>
                            </View>

                            <View style={styles.actions}>
                                <TouchableOpacity
                                    style={styles.actionBtn}
                                    onPress={() => handleUpdateStock(item.id, -1)}
                                >
                                    <Feather name="minus" size={18} color={colors.text.primary} />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.actionBtn}
                                    onPress={() => handleUpdateStock(item.id, 1)}
                                >
                                    <Feather name="plus" size={18} color={colors.text.primary} />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.actionBtn, { borderColor: 'transparent' }]}
                                    onPress={() => handleDelete(item.id)}
                                >
                                    <Feather name="trash-2" size={18} color={colors.text.tertiary} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)}>
                <LinearGradient
                    colors={colors.primary.gradient}
                    style={styles.fabGradient}
                >
                    <Feather name="plus" size={32} color="#FFF" />
                </LinearGradient>
            </TouchableOpacity>

            {/* Add Item Modal */}
            <Modal visible={showAddModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add New Item</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Item Name (e.g. Rice, Milk)"
                            value={newItemName}
                            onChangeText={setNewItemName}
                        />

                        <View style={styles.row}>
                            <TextInput
                                style={[styles.input, { flex: 1, marginRight: 8 }]}
                                placeholder="Stock (e.g. 5)"
                                value={newItemStock}
                                onChangeText={setNewItemStock}
                                keyboardType="numeric"
                            />
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="Unit (e.g. kg)"
                                value={newItemUnit}
                                onChangeText={setNewItemUnit}
                            />
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="Min Stock Alert Level"
                            value={newItemMinStock}
                            onChangeText={setNewItemMinStock}
                            keyboardType="numeric"
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.cancelBtn]}
                                onPress={() => setShowAddModal(false)}
                            >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.saveBtn]}
                                onPress={handleCreateItem}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.saveBtnText}>Save</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.secondary },
    header: {
        paddingTop: Platform.OS === 'ios' ? 50 : 40,
        paddingBottom: 20,
        paddingHorizontal: spacing.lg,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    backButton: { marginRight: 15 },
    logButton: { padding: 4 },
    headerTitle: { fontSize: typography.fontSize.xl, fontWeight: 'bold', color: '#FFF' },
    headerSubtitle: { fontSize: typography.fontSize.sm, color: 'rgba(255,255,255,0.8)' },

    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', margin: spacing.lg, paddingHorizontal: spacing.md, paddingVertical: 12, borderRadius: borderRadius.lg, ...shadows.sm },
    searchInput: { flex: 1, marginLeft: spacing.md, fontSize: typography.fontSize.base, color: colors.text.primary },

    content: { paddingHorizontal: spacing.lg, paddingBottom: 100 },

    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        overflow: 'hidden'
    },
    statusIndicator: { width: 6, height: '140%', position: 'absolute', left: 0 },
    itemInfo: { flex: 1, marginLeft: spacing.sm },
    itemName: { fontSize: typography.fontSize.base, fontWeight: '600', color: colors.text.primary, marginBottom: 2 },
    itemStock: { fontSize: typography.fontSize.sm, color: colors.text.secondary },

    actions: { flexDirection: 'row', gap: 8 },
    actionBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.neutral.gray[200],
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background.secondary
    },

    emptyState: { alignItems: 'center', marginTop: 50 },
    emptyText: { marginTop: spacing.md, fontSize: typography.fontSize.base, color: colors.text.tertiary },
    emptyButton: { marginTop: spacing.md, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: colors.primary.light, borderRadius: borderRadius.full },
    emptyButtonText: { color: colors.primary.main, fontWeight: 'bold' },

    fab: {
        position: 'absolute',
        bottom: spacing.xl,
        right: spacing.lg,
        borderRadius: 32,
        ...shadows.xl
    },
    fabGradient: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center'
    },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.lg },
    modalContent: { backgroundColor: '#FFF', borderRadius: borderRadius.xl, padding: spacing.xl },
    modalTitle: { fontSize: typography.fontSize.xl, fontWeight: 'bold', marginBottom: spacing.lg, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: colors.neutral.gray[200], borderRadius: borderRadius.md, padding: 12, marginBottom: spacing.md, fontSize: 16 },
    row: { flexDirection: 'row' },
    modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
    modalBtn: { flex: 1, padding: 14, borderRadius: borderRadius.lg, alignItems: 'center' },
    cancelBtn: { backgroundColor: colors.neutral.gray[200] },
    cancelBtnText: { color: colors.text.primary, fontWeight: '600' },
    saveBtn: { backgroundColor: colors.primary.main },
    saveBtnText: { color: '#FFF', fontWeight: 'bold' }
});
