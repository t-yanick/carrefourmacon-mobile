import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '@/api/bookings';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import Toast from 'react-native-toast-message';

const STATUS_COLORS = {
  PENDING: Colors.warning,
  ACCEPTED: Colors.info,
  CONFIRMED: Colors.info,
  COMPLETED: Colors.success,
  REJECTED: Colors.danger,
  CANCELLED: Colors.text.light,
  PENDING_PAYMENT: Colors.warning,
};

const STATUS_LABELS = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
  PENDING_PAYMENT: 'Pending Payment',
};

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingsApi.getBooking(id!),
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: () => bookingsApi.cancelBooking(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      Toast.show({
        type: 'success',
        text1: 'Booking Cancelled',
        text2: 'Your booking has been cancelled',
      });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to cancel booking',
      });
    },
  });

  const handleCancel = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => cancelMutation.mutate(),
        },
      ]
    );
  };

  const handleCall = (phone: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('No Phone Number', 'Phone number not available');
    }
  };

  if (isLoading || !booking) {
    return (
      <View style={styles.loading}>
        <Text>Loading booking...</Text>
      </View>
    );
  }

  const canCancel = booking.status === 'PENDING' || booking.status === 'ACCEPTED';
  const isProvider = user?.role === 'PROVIDER';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header with Back Button */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Status Banner */}
        <View
          style={[
            styles.statusBanner,
            { backgroundColor: STATUS_COLORS[booking.status as keyof typeof STATUS_COLORS] || Colors.text.secondary },
          ]}
        >
          <Text style={styles.statusBannerText}>
            {STATUS_LABELS[booking.status as keyof typeof STATUS_LABELS] || booking.status}
          </Text>
          {booking.referenceNumber && (
            <Text style={styles.refText}>Ref: {booking.referenceNumber}</Text>
          )}
        </View>

        {/* Provider/Customer Info */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isProvider ? 'Customer' : 'Service Provider'}
          </Text>
          <View style={styles.personInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {isProvider
                  ? booking.customer?.name?.charAt(0) || 'C'
                  : booking.provider?.user?.name?.charAt(0) || 'P'}
              </Text>
            </View>
            <View style={styles.personDetails}>
              <Text style={styles.personName}>
                {isProvider 
                  ? booking.customer?.name || 'Customer' 
                  : booking.provider?.user?.name || 'Provider'}
              </Text>
              <Text style={styles.personPhone}>
                {isProvider 
                  ? booking.customer?.phone || 'N/A' 
                  : booking.provider?.user?.phone || 'N/A'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => handleCall(isProvider ? booking.customer?.phone : booking.provider?.user?.phone)}
            >
              <Text style={styles.callIcon}>📞</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Booking Details */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date & Time</Text>
            <Text style={styles.detailValue}>
              {booking.scheduledAt ? new Date(booking.scheduledAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }) : 'Not set'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Service</Text>
            <Text style={styles.detailValue}>
              {booking.category?.nameEn || booking.category?.name || 'Service'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>
              {booking.location?.address || 'Not provided'}
            </Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.descriptionContainer}>
            <Text style={styles.detailLabel}>Description</Text>
            <Text style={styles.description}>
              {booking.description || 'No description provided'}
            </Text>
          </View>
        </Card>

        {/* Price Information */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Price</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              {isProvider ? 'Your Payout' : 'Total Amount'}
            </Text>
            <Text style={styles.priceValue}>
              {isProvider 
                ? (booking.netAmount || booking.price || 0).toLocaleString()
                : (booking.price || 0).toLocaleString()
              } FCFA
            </Text>
          </View>
          {booking.finalPrice && booking.finalPrice !== booking.price && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Final Price</Text>
              <Text style={[styles.priceValue, styles.finalPrice]}>
                {booking.finalPrice.toLocaleString()} FCFA
              </Text>
            </View>
          )}
          {isProvider && booking.commission && (
            <Text style={styles.hint}>
              Commission: {booking.commission.toLocaleString()} FCFA deducted
            </Text>
          )}
          <View style={styles.separator} />
          <View style={styles.priceRow}>
            <Text style={styles.detailLabel}>Payment Status</Text>
            <Text
              style={[
                styles.paymentStatus,
                booking.paymentStatus === 'PAID' && styles.paymentPaid,
              ]}
            >
              {booking.paymentStatus || 'PENDING'}
            </Text>
          </View>
        </Card>

        {/* Timeline */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <View style={styles.timeline}>
            <TimelineItem
              title="Booking Created"
              date={booking.createdAt}
              isCompleted
            />
            {booking.acceptedAt && (
              <TimelineItem
                title="Booking Accepted"
                date={booking.acceptedAt}
                isCompleted
              />
            )}
            {booking.completedAt && (
              <TimelineItem
                title="Service Completed"
                date={booking.completedAt}
                isCompleted
              />
            )}
            {booking.cancelledAt && (
              <TimelineItem
                title="Booking Cancelled"
                date={booking.cancelledAt}
                isCompleted
                isCancelled
              />
            )}
          </View>
        </Card>

        {/* Status Messages */}
        {booking.status === 'PENDING' && (
          <Card style={[styles.section, styles.infoCard]}>
            <Text style={styles.infoText}>
              {isProvider
                ? 'Please review this booking request and accept or reject it.'
                : 'Waiting for the provider to accept your booking request.'}
            </Text>
          </Card>
        )}

        {booking.status === 'REJECTED' && booking.rejectionReason && (
          <Card style={[styles.section, styles.warningCard]}>
            <Text style={styles.warningTitle}>Rejection Reason</Text>
            <Text style={styles.warningText}>{booking.rejectionReason}</Text>
          </Card>
        )}
      </ScrollView>

      {/* Action Buttons */}
      {canCancel && !isProvider && (
        <View style={styles.footer}>
          <Button
            title="Cancel Booking"
            onPress={handleCancel}
            loading={cancelMutation.isPending}
            variant="danger"
            size="large"
          />
        </View>
      )}

      {booking.status === 'PENDING_PAYMENT' && !isProvider && (
        <View style={styles.footer}>
          <Button
            title="Pay Now"
            onPress={() => router.push(`/payment/${booking.id}`)}
            size="large"
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const TimelineItem = ({
  title,
  date,
  isCompleted,
  isCancelled,
}: {
  title: string;
  date: string;
  isCompleted: boolean;
  isCancelled?: boolean;
}) => (
  <View style={styles.timelineItem}>
    <View
      style={[
        styles.timelineDot,
        isCompleted && styles.timelineDotCompleted,
        isCancelled && styles.timelineDotCancelled,
      ]}
    />
    <View style={styles.timelineContent}>
      <Text style={styles.timelineTitle}>{title}</Text>
      <Text style={styles.timelineDate}>
        {new Date(date).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingBottom: 120,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: Colors.primary,
    marginRight: 4,
  },
  backText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  headerSpacer: {
    width: 80,
  },
  statusBanner: {
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBannerText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.white,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  refText: {
    fontSize: 12,
    color: Colors.text.white,
    opacity: 0.9,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  personInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.white,
  },
  personDetails: {
    flex: 1,
  },
  personName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  personPhone: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callIcon: {
    fontSize: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '600',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.text.primary,
    flex: 2,
    textAlign: 'right',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginVertical: 12,
  },
  descriptionContainer: {
    marginTop: 4,
  },
  description: {
    fontSize: 15,
    color: Colors.text.secondary,
    lineHeight: 22,
    marginTop: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  finalPrice: {
    fontSize: 18,
    color: Colors.secondary,
  },
  hint: {
    fontSize: 12,
    color: Colors.text.light,
    marginTop: 4,
    fontStyle: 'italic',
  },
  paymentStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.warning,
    textTransform: 'uppercase',
  },
  paymentPaid: {
    color: Colors.success,
  },
  timeline: {
    gap: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.border.light,
    marginRight: 12,
    marginTop: 4,
  },
  timelineDotCompleted: {
    backgroundColor: Colors.success,
  },
  timelineDotCancelled: {
    backgroundColor: Colors.danger,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  infoCard: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  warningCard: {
    backgroundColor: Colors.dangerLight,
    borderColor: Colors.danger,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.danger,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: Colors.danger,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: Colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});