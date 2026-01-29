import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { bookingsApi } from '@/api/bookings'; // Adjusted for your src structure
import { Colors } from '@/constants/colors';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Ionicons } from '@expo/vector-icons';

// Mapping Prisma Enums to sophisticated UI
const STATUS_MAP: Record<string, { label: string, color: string, icon: string }> = {
  PENDING_PAYMENT: { label: 'Pending Payment', color: '#F39C12', icon: 'time-outline' },
  CONFIRMED: { label: 'Confirmed', color: '#27AE60', icon: 'checkmark-circle-outline' },
  IN_PROGRESS: { label: 'In Progress', color: '#3498DB', icon: 'hammer-outline' },
  COMPLETED: { label: 'Completed', color: '#2C3E50', icon: 'archive-outline' },
  CANCELLED: { label: 'Cancelled', color: '#E74C3C', icon: 'close-circle-outline' },
  DISPUTED: { label: 'Disputed', color: '#8E44AD', icon: 'alert-circle-outline' },
};

export default function BookingDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: response, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingsApi.getBookingById(id!),
    enabled: !!id,
  });

  const booking = response?.booking || response?.data || response;
  const statusInfo = STATUS_MAP[booking?.status] || { label: booking?.status, color: '#666', icon: 'help-circle-outline' };

  if (isLoading) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        headerTitle: `Booking Details`,
        headerTintColor: '#FFF',
        headerStyle: { backgroundColor: statusInfo.color },
      }} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={[styles.statusHero, { backgroundColor: statusInfo.color }]}>
          <Ionicons name={statusInfo.icon as any} size={60} color="#FFF" />
          <Text style={styles.statusLabel}>{statusInfo.label}</Text>
          <Text style={styles.refNumber}>Ref: {booking?.referenceNumber}</Text>
        </View>

        <View style={styles.body}>
          {/* Professional Details */}
          <Card style={styles.infoCard}>
            <Text style={styles.sectionLabel}>Professional</Text>
            <Text style={styles.primaryText}>{booking?.provider?.name || 'Professional'}</Text>
            <View style={styles.row}>
                <Ionicons name="call-outline" size={14} color="#666" />
                <Text style={styles.secondaryText}> {booking?.provider?.phone}</Text>
            </View>
          </Card>

          {/* Location & Time */}
          <Card style={styles.infoCard}>
            <Text style={styles.sectionLabel}>Service Info</Text>
            <View style={styles.row}>
              <Ionicons name="location-outline" size={18} color={Colors.primary} />
              <Text style={styles.iconText}>{booking?.location?.address}</Text>
            </View>
            <View style={[styles.row, { marginTop: 10 }]}>
              <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
              <Text style={styles.iconText}>
                {new Date(booking?.scheduledAt).toLocaleString('en-CM', { 
                    weekday: 'short', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                })}
              </Text>
            </View>
          </Card>

          {/* Pricing Summary */}
          <Card style={styles.infoCard}>
            <Text style={styles.sectionLabel}>Pricing</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Service Price</Text>
              <Text style={styles.priceValue}>{Number(booking?.price).toLocaleString()} FCFA</Text>
            </View>
          </Card>

          {/* Job Description */}
          <Card style={styles.infoCard}>
            <Text style={styles.sectionLabel}>Instructions</Text>
            <Text style={styles.descriptionText}>{booking?.description}</Text>
          </Card>
        </View>
      </ScrollView>

      {/* Footer Actions based on Enum */}
      {booking?.status === 'PENDING_PAYMENT' && (
        <View style={styles.footer}>
          <Button title="Pay Securely" onPress={() => router.push(`/payment/${booking.id}`)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7F8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 120 },
  statusHero: { padding: 40, alignItems: 'center', justifyContent: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  statusLabel: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginTop: 10 },
  refNumber: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: 4, letterSpacing: 1 },
  body: { padding: 16, marginTop: -30 },
  infoCard: { padding: 16, marginBottom: 12, borderRadius: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  sectionLabel: { fontSize: 10, color: '#999', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 },
  primaryText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  secondaryText: { fontSize: 14, color: '#666' },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  iconText: { marginLeft: 8, fontSize: 15, color: '#444', flexShrink: 1 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  priceLabel: { fontSize: 16, color: '#444' },
  priceValue: { fontSize: 20, fontWeight: 'bold', color: Colors.primary },
  descriptionText: { fontSize: 15, color: '#555', lineHeight: 22 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE' }
});
