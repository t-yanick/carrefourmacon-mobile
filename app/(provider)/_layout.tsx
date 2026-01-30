import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Standard Expo icons
import { Colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext'; // Assuming you have an Auth provider
import { ActivityIndicator, View } from 'react-native';

export default function ProviderLayout() {
  const { user, isLoading } = useAuth();

  // 1. Loading State
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: Colors.background.primary }}>
        <ActivityIndicator color={Colors.secondary} size="large" />
      </View>
    );
  }

  // 2. Role Protection: Redirect if not a Provider
  // Match this with your Backend Prisma Enum: role !== 'PROVIDER'
  if (!user || user.role !== 'PROVIDER') {
    return <Redirect href="/auth/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.secondary,
        tabBarInactiveTintColor: Colors.text.secondary,
        tabBarStyle: {
          backgroundColor: Colors.background.primary,
          borderTopWidth: 1,
          borderTopColor: Colors.border.light,
          height: 65,
          paddingBottom: 10,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: Colors.background.primary, // More modern than solid secondary
          elevation: 0, // Remove shadow on Android
          shadowOpacity: 0, // Remove shadow on iOS
        },
        headerTintColor: Colors.text.primary,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "grid" : "grid-outline"} size={24} color={color} />
          ),
          headerTitle: 'Dashboard',
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "calendar" : "calendar-outline"} size={24} color={color} />
          ),
          headerTitle: 'Manage Jobs',
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: 'Earnings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "wallet" : "wallet-outline"} size={24} color={color} />
          ),
          headerTitle: 'Financials',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
          ),
          headerTitle: 'Profile Settings',
        }}
      />
    </Tabs>
  );
}