import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Platform, Alert, Linking } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { bookingsApi } from '@/api/bookings';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Colors } from '@/constants/colors';
import Toast from 'react-native-toast-message';

const STATUS_COLORS = {
  PENDING: Colors.warning,
  ACCEPTED: Colors.info,
  COMPLETED: Colors.success,
  REJECTED: Colors.error,
  CANCELLED: '#9E9E9E',
};

export default function ProviderBookingsScreen() {
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const queryClient = useQueryClient();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['provider-bookings', filter],
    queryFn: () => bookingsApi.listBookings({ status: filter }),
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => bookingsApi.acceptBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-bookings'] });
      Toast.show({ type: 'success', text1: 'Booking Accepted' });
    },
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, price }: { id: string; price?: number }) => bookingsApi.completeBooking(id, price),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-bookings'] });
      Toast.show({ type: 'success', text1: 'Job Completed Successfully' });
    },
  });

  const handleCall = (phone?: string) => {
    if (phone) Linking.openURL(`tel:${phone}`);
    else Alert.alert('Error', 'Phone number not available');
  };

  const handleAccept = (id: string) => {
    Alert.alert('Accept Request', 'Are you sure you want to accept this job?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Accept', onPress: () => acceptMutation.mutate(id) },
    ]);
  };

  const handleComplete = (id: string, estimatedPrice: number) => {
    if (Platform.OS === 'ios') {
      Alert.prompt('Job Finished', 'Enter final amount paid (XAF)', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: (val) => completeMutation.mutate({ id, price: parseInt(val || '0') || estimatedPrice }) }
      ], 'plain-text', estimatedPrice.toString(), 'numeric');
    } else {
      Alert.alert('Finish Job', `Confirm job completion for ${estimatedPrice.toLocaleString()} XAF?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => completeMutation.mutate({ id, price: estimatedPrice }) }
      ]);
    }
  };

  const renderBookingCard = ({ item }: any) => (
    <Card style={styles.bookingCard}>
      <TouchableOpacity onPress={() => router.push(`/(provider)/bookings/${item.id}`)}>
        <View style={styles.cardHeader}>
          <View style={styles.customerRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.customer?.name?.charAt(0) || 'C'}</Text>
            </View>
            <View>
              <Text style={styles.customerName}>{item.customer?.name}</Text>
              <Text style={styles.dateText}>{new Date(item.scheduledAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status as keyof typeof STATUS_COLORS] + '15' }]}>
            <Text style={[styles.statusText, { color: STATUS_COLORS[item.status as keyof typeof STATUS_COLORS] }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

        <View style={styles.infoRow}>
          <Text style={styles.priceText}>{item.price?.toLocaleString()} <Text style={styles.currency}>XAF</Text></Text>
          <View style={styles.locationContainer}>
             <Ionicons name="location-outline" size={14} color={Colors.text.secondary} />
             <Text style={styles.locationText} numberOfLines={1}>{item.locationName || 'Yaoundé'}</Text>
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.actionsContainer}>
        {item.status === 'PENDING' && (
          <>
            <Button title="Accept" onPress={() => handleAccept(item.id)} size="small" style={styles.flexButton} />
            <Button title="Decline" variant="outline" onPress={() => {}} size="small" style={styles.flexButton} />
          </>
        )}
        {item.status === 'ACCEPTED' && (
          <>
            <Button title="Complete" onPress={() => handleComplete(item.id, item.price)} variant="secondary" size="small" style={styles.flexButton} />
            <TouchableOpacity style={styles.callButton} onPress={() => handleCall(item.customer?.phone)}>
              <Ionicons name="call" size={20} color={Colors.secondary} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.filterBar}>
        <FlatList
          horizontal
          data={['ALL', 'PENDING', 'ACCEPTED', 'COMPLETED']}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.chip, (filter === item || (!filter && item === 'ALL')) && styles.activeChip]}
              onPress={() => setFilter(item === 'ALL' ? undefined : item)}
            >
              <Text style={[styles.chipText, (filter === item || (!filter && item === 'ALL')) && styles.activeChipText]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>

      <FlatList
        data={data?.bookings || []}
        keyExtractor={(item) => item.id}
        renderItem={renderBookingCard}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.secondary} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={64} color={Colors.border.light} />
              <Text style={styles.emptyText}>No bookings found</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background.secondary 
  },
  // Filters Section
  filtersContainer: { 
    backgroundColor: Colors.background.primary, 
    paddingVertical: 14, 
    borderBottomWidth: 1, 
    borderBottomColor: Colors.border.light,
    // Add a slight shadow to separate filter bar from list
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3 },
      android: { elevation: 2 }
    })
  },
  filtersList: { paddingHorizontal: 16 },
  filterChip: { 
    paddingHorizontal: 18, 
    paddingVertical: 8, 
    borderRadius: 25, 
    backgroundColor: Colors.background.secondary, 
    borderWidth: 1, 
    borderColor: Colors.border.light, 
    marginRight: 10 
  },
  filterChipActive: { 
    backgroundColor: Colors.secondary, 
    borderColor: Colors.secondary,
  },
  filterText: { fontSize: 13, fontWeight: '700', color: Colors.text.secondary, textTransform: 'uppercase' },
  filterTextActive: { color: Colors.text.white },

  // List & Cards
  listContent: { padding: 16, paddingBottom: 32 },
  bookingCard: { 
    marginBottom: 16, 
    padding: 16,
    borderRadius: 16,
    backgroundColor: Colors.background.primary,
    // Sophisticated Card Elevation
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 3 }
    })
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  customerInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { 
    width: 52, 
    height: 52, 
    borderRadius: 26, 
    backgroundColor: Colors.secondary, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 14 
  },
  avatarText: { fontSize: 22, fontWeight: '800', color: Colors.text.white },
  customerDetails: { flex: 1 },
  customerName: { fontSize: 17, fontWeight: '700', color: Colors.text.primary, marginBottom: 2 },
  date: { fontSize: 13, color: Colors.text.secondary, fontWeight: '500' },
  
  // Status Badges
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },

  description: { 
    fontSize: 14, 
    color: Colors.text.secondary, 
    lineHeight: 22, 
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-light'
  },

  // Footer Logic
  cardFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingTop: 14, 
    borderTopWidth: 1, 
    borderTopColor: Colors.border.light 
  },
  price: { fontSize: 18, fontWeight: '800', color: Colors.secondary },
  location: { fontSize: 13, color: Colors.text.secondary, fontWeight: '600' },

  // Actions Bar
  actions: { 
    flexDirection: 'row', 
    gap: 12, 
    marginTop: 16,
    justifyContent: 'space-between' 
  },
  actionButton: { 
    flex: 1,
    height: 45, // Standardized height for better touch targets
    borderRadius: 12
  },

  // Empty State
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 72, marginBottom: 20, opacity: 0.5 },
  emptyText: { fontSize: 18, fontWeight: '700', color: Colors.text.secondary, letterSpacing: -0.5 },
});