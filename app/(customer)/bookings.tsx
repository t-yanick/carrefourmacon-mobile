
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { bookingsApi } from '@/api/bookings';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button'; // Assuming you have a custom Button
import { Colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

// 1. Prisma Enum Source of Truth
const STATUS_COLORS = {
  PENDING_PAYMENT: Colors.warning || '#F39C12',
  CONFIRMED: Colors.info || '#3498DB',
  IN_PROGRESS: '#8E44AD',
  COMPLETED: Colors.success || '#27AE60',
  DISPUTED: Colors.danger || '#E74C3C',
  CANCELLED: Colors.text.light || '#95A5A6',
};

const STATUS_LABELS = {
  PENDING_PAYMENT: 'Pending',
  CONFIRMED: 'Accepted',
  IN_PROGRESS: 'Ongoing',
  COMPLETED: 'Done',
  DISPUTED: 'Disputed',
  CANCELLED: 'Cancelled',
};

export default function BookingsScreen() {
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const { isAuthenticated } = useAuth();

  // 2. GUEST GATE: Protects private data while remaining sophisticated
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <View style={styles.iconCircle}>
            <Ionicons name="calendar-outline" size={60} color={Colors.primary} />
            <View style={styles.lockBadge}>
               <Ionicons name="lock-closed" size={14} color="#FFF" />
            </View>
          </View>
          <Text style={styles.emptyText}>Sign in to view bookings</Text>
          <Text style={styles.emptySubtext}>Track your service history and manage upcoming appointments safely.</Text>
          <TouchableOpacity
            style={styles.authButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.authButtonText}>Login / Register</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { data: response, isLoading, refetch, isRefreshing } = useQuery({
    queryKey: ['bookings', filter],
    queryFn: () => bookingsApi.listBookings({ status: filter }),
  });

  const bookings = response?.bookings || response?.data?.bookings || response?.data || [];
  const filters = ['ALL', 'PENDING_PAYMENT', 'CONFIRMED', 'COMPLETED'];

  const renderBookingCard = ({ item }: any) => {
    const providerName = item.provider?.user?.name || item.provider?.name || 'Professional';
    const displayPrice = item.price || item.estimatedPrice;
    const displayDate = item.scheduledAt || item.scheduledDate;

    return (
      <Card
        style={styles.bookingCard}
        // FIXED: Absolute path to top-level booking folder
        onPress={() => router.push({ pathname: "/booking/[id]", params: { id: item.id } })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.providerInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{providerName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.providerDetails}>
              <Text style={styles.providerName}>{providerName}</Text>
              <Text style={styles.date}>
                {displayDate ? new Date(displayDate).toLocaleDateString('en-CM', {
                  weekday: 'short', month: 'short', day: 'numeric',
                }) : 'No date set'}
              </Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[item.status as keyof typeof STATUS_COLORS] || '#666') + '15' }]}>
            <Text style={[styles.statusText, { color: STATUS_COLORS[item.status as keyof typeof STATUS_COLORS] || '#666' }]}>
              {STATUS_LABELS[item.status as keyof typeof STATUS_LABELS] || item.status}
            </Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.description || 'No description provided'}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.price}>
            {displayPrice ? `${Number(displayPrice).toLocaleString()} FCFA` : 'Price TBD'}
          </Text>
          <View style={styles.detailsBtn}>
            <Text style={styles.viewDetails}>Details</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={filters}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, (item === 'ALL' ? !filter : filter === item) && styles.filterChipActive]}
              onPress={() => setFilter(item === 'ALL' ? undefined : item)}
            >
              <Text style={[styles.filterText, (item === 'ALL' ? !filter : filter === item) && styles.filterTextActive]}>
                {STATUS_LABELS[item as keyof typeof STATUS_LABELS] || item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filtersList}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {isLoading && !isRefreshing ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Fetching your history...</Text>
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.emptyTitle}>No bookings found</Text>
          <Text style={styles.emptySubtext}>Find a professional and get your work started.</Text>
          <Button
            title="Browse Services"
            onPress={() => router.push('/(customer)/home')}
            size="large"
          />
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBookingCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refetch} tintColor={Colors.primary} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  filtersContainer: {
    backgroundColor: Colors.background.primary,
    paddingVertical: 14, // Slightly more room for fingers
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  filtersList: {
    paddingHorizontal: 16,
    // Gap 8 is good, keep it
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginRight: 8,
    minWidth: 70, // Ensures small words like "ALL" are easy to tap
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '700', // Thicker for better readability
    color: Colors.text.secondary,
  },
  filterTextActive: {
    color: Colors.text.white,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Room for the TabBar
  },
  bookingCard: {
    marginBottom: 16,
    padding: 16, // Cards need internal padding if the Card component doesn't have it
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6 },
      android: { elevation: 3 },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Changed from flex-start for better alignment with badges
    marginBottom: 12,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44, // Slightly smaller for a tighter look
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.white,
    textAlign: 'center',
    textAlignVertical: 'center',
    ...Platform.select({ android: { includeFontPadding: false } }),
  },
  providerDetails: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase', // Looks more "official" for statuses
  },
  description: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0', // Explicit light gray
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.secondary || '#E67E22',
  },
  viewDetails: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '700',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.white,
  },
});