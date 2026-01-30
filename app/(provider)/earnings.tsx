import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { bookingsApi } from '@/api/bookings';
import { Card } from '@/components/common/Card';
import { Colors } from '@/constants/colors';

export default function ProviderEarningsScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['provider-earnings'],
    queryFn: () => bookingsApi.listBookings({ status: 'COMPLETED' }),
  });

  const completedBookings = data?.bookings || [];

  // Logic: Calculate totals aligned with Prisma Schema
  const totalEarnings = completedBookings.reduce((sum: number, b: any) => sum + (b.finalPrice || b.price || 0), 0);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const thisMonthBookings = completedBookings.filter((b: any) => {
    const date = new Date(b.updatedAt || b.createdAt); // Fallback if completedAt is missing
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const monthlyEarnings = thisMonthBookings.reduce((sum: number, b: any) => sum + (b.finalPrice || b.price || 0), 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.secondary} />}
      >
        {/* Modern Total Earnings Card */}
        <View style={styles.heroCard}>
          <Text style={styles.totalLabel}>Wallet Balance</Text>
          <Text style={styles.totalAmount}>{totalEarnings.toLocaleString()} <Text style={styles.currency}>XAF</Text></Text>
          <View style={styles.badge}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.text.white} />
            <Text style={styles.badgeText}>{completedBookings.length} Jobs Completed</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{monthlyEarnings.toLocaleString()}</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{thisMonthBookings.length}</Text>
            <Text style={styles.statLabel}>Jobs Done</Text>
          </Card>
        </View>

        {/* Transaction History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Payouts</Text>
            <Ionicons name="options-outline" size={20} color={Colors.text.secondary} />
          </View>

          {completedBookings.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="wallet-outline" size={48} color={Colors.border.main} />
              <Text style={styles.emptyText}>No earnings yet</Text>
              <Text style={styles.emptySub}>Finish your first job to see money here.</Text>
            </Card>
          ) : (
            completedBookings.map((booking: any) => (
              <Card key={booking.id} style={styles.transactionCard}>
                <View style={styles.transactionRow}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="hammer" size={18} color={Colors.secondary} />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionCustomer}>{booking.customer?.name || 'Client'}</Text>
                    <Text style={styles.transactionDate}>
                      {new Date(booking.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </Text>
                  </View>
                  <Text style={styles.transactionAmount}>+{(booking.finalPrice || booking.price)?.toLocaleString()}</Text>
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.secondary },
  content: { padding: 16 },
  
  // Hero Wallet Section
  heroCard: { 
    backgroundColor: Colors.secondary, 
    padding: 30, 
    borderRadius: 24, 
    alignItems: 'center', 
    marginBottom: 20,
    ...Platform.select({
      ios: { shadowColor: Colors.secondary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15 },
      android: { elevation: 8 }
    })
  },
  totalLabel: { fontSize: 13, color: Colors.text.white, opacity: 0.8, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  totalAmount: { fontSize: 36, fontWeight: '800', color: Colors.text.white, marginVertical: 8 },
  currency: { fontSize: 16, fontWeight: '400' },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
  badgeText: { color: Colors.text.white, fontSize: 12, fontWeight: '600' },

  // Stats Grid
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 20, borderRadius: 16 },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.text.primary, marginBottom: 4 },
  statLabel: { fontSize: 11, color: Colors.text.secondary, fontWeight: '700', textTransform: 'uppercase' },

  // Transactions Section
  section: { marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.text.primary },
  
  transactionCard: { marginBottom: 10, padding: 14, borderRadius: 16 },
  transactionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.background.secondary, justifyContent: 'center', alignItems: 'center' },
  transactionInfo: { flex: 1 },
  transactionCustomer: { fontSize: 15, fontWeight: '700', color: Colors.text.primary },
  transactionDate: { fontSize: 12, color: Colors.text.secondary, marginTop: 2 },
  transactionAmount: { fontSize: 16, fontWeight: '800', color: Colors.success },

  emptyCard: { alignItems: 'center', paddingVertical: 60, borderRadius: 24 },
  emptyText: { fontSize: 18, fontWeight: '700', color: Colors.text.primary, marginTop: 16 },
  emptySub: { fontSize: 14, color: Colors.text.secondary, marginTop: 4, textAlign: 'center' }
});