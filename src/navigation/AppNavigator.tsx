import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import GroupListScreen from '../screens/GroupListScreen';
import CreateGroupScreen from '../screens/CreateGroupScreen';
import JoinGroupScreen from '../screens/JoinGroupScreen';
import GroupDetailsScreen from '../screens/GroupDetailsScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import AddFundScreen from '../screens/AddFundScreen';
import SettleUpScreen from '../screens/SettleUpScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import BalancesScreen from '../screens/BalancesScreen';
import ActivityLogScreen from '../screens/ActivityLogScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddMemberScreen from '../screens/AddMemberScreen';
import LedgerScreen from '../screens/LedgerScreen';
import BudgetManagementScreen from '../screens/BudgetManagementScreen';
import GroupSettingsScreen from '../screens/GroupSettingsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import EditTransactionScreen from '../screens/EditTransactionScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import ReportsScreen from '../screens/ReportsScreen';
import InventoryScreen from '../screens/InventoryScreen';
import InvitationsScreen from '../screens/InvitationsScreen';

// Icons
import { Feather } from '@expo/vector-icons';
import theme from '../config/theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Defensive theme
const themeColors = theme?.colors || {
    primary: { main: '#8B5CF6' },
    text: { tertiary: '#9CA3AF' },
    background: { primary: '#FFFFFF' },
    neutral: { gray: { 200: '#E5E7EB' } }
};

// Bottom Tab Navigator for authenticated users
function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: themeColors.primary.main,
                tabBarInactiveTintColor: themeColors.text.tertiary,
                tabBarStyle: {
                    backgroundColor: themeColors.background.primary,
                    borderTopWidth: 1,
                    borderTopColor: themeColors.neutral.gray[200],
                    paddingBottom: 8,
                    paddingTop: 8,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="home" size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Groups"
                component={GroupListScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="users" size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="user" size={24} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

// Main navigation
export default function AppNavigator() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        // TODO: Add a proper loading screen
        return null;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!isAuthenticated ? (
                    // Auth Stack
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
                    </>
                ) : (
                    // Main App Stack
                    <>
                        <Stack.Screen name="Main" component={MainTabs} />
                        <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
                        <Stack.Screen name="JoinGroup" component={JoinGroupScreen} />
                        <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} />
                        <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
                        <Stack.Screen name="AddFund" component={AddFundScreen} />
                        <Stack.Screen name="SettleUp" component={SettleUpScreen} />
                        <Stack.Screen name="Analytics" component={AnalyticsScreen} />
                        <Stack.Screen name="Balances" component={BalancesScreen} />
                        <Stack.Screen name="ActivityLog" component={ActivityLogScreen} />
                        <Stack.Screen name="Notifications" component={NotificationsScreen} />
                        <Stack.Screen name="AddMember" component={AddMemberScreen} />
                        <Stack.Screen name="Ledger" component={LedgerScreen} />
                        <Stack.Screen name="BudgetManagement" component={BudgetManagementScreen} />
                        <Stack.Screen name="GroupSettings" component={GroupSettingsScreen} />
                        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
                        <Stack.Screen name="EditTransaction" component={EditTransactionScreen} />
                        <Stack.Screen name="Reports" component={ReportsScreen} />
                        <Stack.Screen name="Inventory" component={InventoryScreen} />
                        <Stack.Screen name="Invitations" component={InvitationsScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

