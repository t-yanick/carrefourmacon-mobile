import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { bookingsApi } from '@/api/bookings';
import { Card } from '@/components/common/Card';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';

const { width } = Dimensions.get('window');

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(true); // Essential for Cameroon MVP

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['provider-bookings'],
    queryFn: () => bookingsApi.listBookings({}),
  });

  const bookings = data?.bookings || [];

  // Robust Filtering logic
  const pending = bookings.filter((b: any) => b.status === 'PENDING');
  const active = bookings.filter((b: any) => ['ACCEPTED', 'IN_PROGRESS', 'ARRIVED'].includes(b.status));
  const completed = bookings.filter((b: any) => b.status === 'COMPLETED');

  // XAF Currency Formatter
  const formatXAF = (amount: number) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      maximumFractionDigits: 0,
    }).format(amount).replace('FCFA', 'CFA');
  };

  const totalEarnings = completed.reduce((sum: number, b: any) => sum + (b.finalPrice || b.price || 0), 0);

  if (isLoading && !isRefetching) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.secondary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.secondary} />}
      >
        {/* Header with Availability Toggle */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Bonjour,</Text>
            <Text style={styles.name}>{user?.name || 'Artisan'} 👋</Text>
          </View>
          <TouchableOpacity 
            style={[styles.statusToggle, { backgroundColor: isOnline ? '#E8F5E9' : '#FFEBEE' }]}
            onPress={() => setIsOnline(!isOnline)}
          >
            <View style={[styles.statusDot, { backgroundColor: isOnline ? Colors.success : Colors.error }]} />
            <Text style={[styles.statusText, { color: isOnline ? Colors.success : Colors.error }]}>
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard title="En attente" value={pending.length} icon="time" color={Colors.warning} />
          <StatCard title="En cours" value={active.length} icon="hammer" color={Colors.info} />
          <StatCard title="Gains" value={formatXAF(totalEarnings)} icon="wallet" color={Colors.secondary} isFullWidth />
        </View>

        {/* Pending Requests Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nouvelles Demandes</Text>
            <TouchableOpacity onPress={() => router.push('/(provider)/bookings')}>
              <Text style={styles.seeAll}>Voir tout →</Text>
            </TouchableOpacity>
          </View>
          {pending.length > 0 ? (
            pending.slice(0, 3).map((booking: any) => (
              <BookingRequestCard key={booking.id} booking={booking} />
            ))
          ) : (
            <Text style={styles.emptyText}>Aucune nouvelle demande pour le moment.</Text>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Raccourcis</Text>
          <View style={styles.actionsGrid}>
            <ActionCard icon="calendar" title="Planning" onPress={() => router.push('/(provider)/bookings')} />
            <ActionCard icon="cash" title="Revenus" onPress={() => router.push('/(provider)/earnings')} />
            <ActionCard icon="person-circle" title="Profil" onPress={() => router.push('/(provider)/profile')} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const StatCard = ({ title, value, icon, color, isFullWidth }: any) => (
  <Card style={[styles.statCard, isFullWidth && styles.fullWidthCard]}>
    <Ionicons name={icon} size={20} color={color} />
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </Card>
);

const BookingRequestCard = ({ booking }: any) => (
  <Card style={styles.requestCard} onPress={() => router.push(`/(provider)/bookings?id=${booking.id}`)}>
    <View style={styles.requestHeader}>
      <View style={styles.customerInfo}>
        <View style={styles.smallAvatar}>
          <Text style={styles.smallAvatarText}>{booking.customer?.name?.charAt(0) || 'C'}</Text>
        </View>
        <View>
          <Text style={styles.customerName}>{booking.customer?.name}</Text>
          <Text style={styles.locationText}><Ionicons name="location" size={12}/> {booking.locationName || 'Yaoundé'}</Text>
        </View>
      </View>
      <View style={styles.newBadge}><Text style={styles.newText}>NOUVEAU</Text></View>
    </View>
    <Text style={styles.requestDescription} numberOfLines={1}>{booking.description || 'Travaux de maçonnerie'}</Text>
  </Card>
);

const ActionCard = ({ icon, title, onPress }: any) => (
  <TouchableOpacity style={styles.actionCard} onPress={onPress}>
    <View style={styles.actionIconContainer}>
      <Ionicons name={icon} size={24} color={Colors.secondary} />
    </View>
    <Text style={styles.actionTitle}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background.secondary 
  },
  content: { 
    padding: 16,
    paddingBottom: 40 // Extra space for the last card
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 28 
  },
  welcome: { 
    fontSize: 16, 
    color: Colors.text.secondary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-light' 
  },
  name: { 
    fontSize: 26, 
    fontWeight: '800', 
    color: Colors.text.primary, 
    marginTop: 2,
    letterSpacing: -0.5
  },
  // Stat Cards: Using 48% to ensure 2 columns work on narrow screens
  statsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    rowGap: 12, 
    marginBottom: 24 
  },
  statCard: { 
    width: '48%', 
    alignItems: 'center', 
    paddingVertical: 24,
    borderRadius: 16,
    // Sophisticated Elevation
    backgroundColor: Colors.background.primary,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statIcon: { fontSize: 32, marginBottom: 8 },
  statValue: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 2, 
    color: Colors.text.primary 
  },
  statTitle: { 
    fontSize: 11, 
    color: Colors.text.secondary, 
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600'
  },
  section: { marginBottom: 32 },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  sectionTitle: { 
    fontSize: 19, 
    fontWeight: '700', 
    color: Colors.text.primary 
  },
  seeAll: { 
    fontSize: 14, 
    color: Colors.secondary, 
    fontWeight: '700' 
  },
  // Request Card: Better visual hierarchy
  requestCard: { 
    marginBottom: 12, 
    padding: 16, 
    borderRadius: 16,
    borderLeftWidth: 4, 
    borderLeftColor: Colors.secondary // Visual indicator for "Action Required"
  },
  requestHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  customerInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  smallAvatar: { 
    width: 42, 
    height: 42, 
    borderRadius: 21, 
    backgroundColor: Colors.secondary, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  smallAvatarText: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
  customerName: { fontSize: 16, fontWeight: '700', color: Colors.text.primary },
  requestTime: { fontSize: 12, color: Colors.text.secondary, marginTop: 2 },
  newBadge: { 
    backgroundColor: Colors.error, 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 20 
  },
  newText: { fontSize: 10, fontWeight: '800', color: '#FFF' },
  requestDescription: { 
    fontSize: 14, 
    color: Colors.text.secondary, 
    marginBottom: 12, 
    lineHeight: 20 
  },
  viewDetails: { 
    fontSize: 13, 
    color: Colors.secondary, 
    fontWeight: '700', 
    textDecorationLine: 'underline' 
  },
  // Action Cards: Grid for easy access
  actionsGrid: { 
    flexDirection: 'row', 
    gap: 12 
  },
  actionCard: { 
    flex: 1, 
    backgroundColor: Colors.background.primary, 
    borderRadius: 16, 
    padding: 16, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1, 
    borderColor: Colors.border.light,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 5,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  actionIcon: { fontSize: 28, marginBottom: 8 },
  actionTitle: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: Colors.text.primary, 
    textAlign: 'center' 
  },
});
