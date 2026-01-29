import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@tanstack/react-query';
import DateTimePicker from '@react-native-community/datetimepicker';
import { providersApi } from '@/api/providers';
import { bookingsApi } from '@/api/bookings';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Colors } from '@/constants/colors';
import Toast from 'react-native-toast-message';

export default function CreateBookingScreen() {
  const { providerId } = useLocalSearchParams<{ providerId: string }>();
  const insets = useSafeAreaInsets();
  
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [description, setDescription] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // 1. Fetching Data
  const { data: providerResponse, isLoading } = useQuery({
    queryKey: ['provider', providerId],
    queryFn: () => providersApi.getProvider(providerId!),
    enabled: !!providerId,
  });

  /**
   * 2. DATA UNPACKING (The Key Fix)
   * This handles the {"provider": {...}} nesting from your logs 
   * so both the UI and handleSubmit use the same object.
   */
    const providerData = providerResponse?.provider || providerResponse?.data?.provider || providerResponse?.data;
  const createMutation = useMutation({
    mutationFn: bookingsApi.createBooking,
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Booking Created',
        text2: 'Your booking request has been sent',
      });
      router.push('/(customer)/bookings');
    },
    onError: (error: any) => {
      console.error('BACKEND VALIDATION ERROR:', error.response?.data);
      Toast.show({
        type: 'error',
        text1: 'Booking Failed',
        text2: error.response?.data?.message || 'Check validation errors in logs',
      });
    },
  });

  const handleSubmit = () => {
    if (!description.trim()) {
      Toast.show({ type: 'error', text1: 'Missing Description' });
      return;
    }

    // 1. Sophisticated Category Extraction
    // This looks through double-nested arrays [[Object]] seen in your logs
    const catId = 
      providerData?.categories?.[0]?.[0]?.id || 
      providerData?.categories?.[0]?.id || 
      providerData?.categoryId;

    if (!catId) {
      Toast.show({ 
        type: 'error', 
        text1: 'Category Missing', 
        text2: 'Could not link this booking to a service category.' 
      });
      return;
    }

    // 2. Precise Payload Mapping
    createMutation.mutate({
      providerId: providerId as string,
      categoryId: catId, 
      scheduledAt: scheduledDate.toISOString(),
      description: description.trim(),
      price: Number(providerData?.hourlyRate) || 0,
      location: {
        address: providerData?.location?.address || "Akwa, Douala",
        lat: Number(providerData?.location?.lat) || 4.0511,
        lng: Number(providerData?.location?.lng) || 9.7679,
      },
    });
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) setScheduledDate(selectedDate);
  };

  if (isLoading || !providerData) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 10 }}>Loading professional details...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        {/* Header Fix: Uses safe area insets */}
        <View style={[styles.customHeader, { paddingTop: Math.max(insets.top, 20) }]}>
           <Text style={styles.headerTitle}>Create Booking</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Provider Info Card: Correctly mapped from providerData */}
          <Card style={styles.providerCard}>
            <Text style={styles.label}>Booking with</Text>
            <Text style={styles.providerName}>{providerData?.name || 'Professional'}</Text>
            <Text style={styles.providerBio} numberOfLines={2}>
              {providerData?.bio || 'No bio available'}
            </Text>
            <View style={styles.rateRow}>
              <Text style={styles.rate}>
                {Number(providerData?.hourlyRate).toLocaleString()} FCFA/hour
              </Text>
              <Text style={styles.rating}>⭐ {providerData?.rating || '4.0'}</Text>
            </View>
          </Card>

          {/* Date Selection */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>When do you need the service?</Text>
            <Button
              title={scheduledDate.toLocaleString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
              onPress={() => setShowDatePicker(true)}
              variant="outline"
            />
            {showDatePicker && (
              <DateTimePicker
                value={scheduledDate}
                mode="datetime"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}
          </Card>

          {/* Description */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Service Details</Text>
            <Input
              value={description}
              onChangeText={setDescription}
              placeholder="Tell the provider what you need..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={styles.textArea}
            />
          </Card>

          <View style={styles.spacer} />
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <Button
            title="Send Booking Request"
            onPress={handleSubmit}
            loading={createMutation.isPending}
            size="large"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  flex: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  providerCard: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  providerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  providerBio: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rate: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.secondary,
  },
  rating: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  inputContainer: {
    marginBottom: 0,
  },
  estimate: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.secondary,
    marginBottom: 8,
  },
  note: {
    fontSize: 12,
    color: Colors.text.light,
    fontStyle: 'italic',
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
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
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