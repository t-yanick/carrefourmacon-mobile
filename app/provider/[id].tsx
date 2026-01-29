
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { providersApi } from '@/api/providers';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext'; // 1. Import Auth context

export default function ProviderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAuthenticated } = useAuth(); // 2. Get auth state

  const { data: response, isLoading } = useQuery({
    queryKey: ['provider', id],
    queryFn: () => providersApi.getProvider(id!),
    enabled: !!id,
  });

  // 3. Sophisticated data unpacking (Matches your previous logs)
  const providerData = response?.provider || response?.data?.provider || response?.data || response;

  const { data: reviewsResponse } = useQuery({
    queryKey: ['provider-reviews', id],
    queryFn: () => providersApi.getProviderReviews(id!),
    enabled: !!id,
  });
  
  const reviews = reviewsResponse?.data || reviewsResponse || [];

  // 4. "The Hook": Redirect guests to login, registered users to booking
  const handleBookNow = () => {
    if (!isAuthenticated) {
      router.push({
        pathname: '/(auth)/login',
        params: { returnTo: `/provider/${id}` } // Optional: helps return user after login
      });
    } else {
      router.push({
        pathname: '/booking/create',
        params: { providerId: id },
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!providerData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Provider not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Image Section */}
        <View style={styles.coverContainer}>
          {providerData.coverImage ? (
            <Image source={{ uri: providerData.coverImage }} style={styles.coverImage} />
          ) : (
            <View style={[styles.coverImage, styles.coverPlaceholder]}>
              <Text style={styles.coverPlaceholderText}>
                {(providerData.name?.charAt(0) || 'P').toUpperCase()}
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          {/* Profile Image Section */}
          <View style={styles.profileContainer}>
            {providerData.profilePhoto ? (
              <Image source={{ uri: providerData.profilePhoto }} style={styles.profileImage} />
            ) : (
              <View style={[styles.profileImage, styles.profilePlaceholder]}>
                <Text style={styles.profilePlaceholderText}>
                  {(providerData.name?.charAt(0) || 'P').toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Name and Verification */}
          <View style={styles.nameRow}>
            <Text style={styles.businessName}>{providerData.name || 'Professional Provider'}</Text>
            {providerData.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Verified</Text>
              </View>
            )}
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>⭐ {(Number(providerData.rating) || 0).toFixed(1)}</Text>
              <Text style={styles.statLabel}>{reviews?.length || 0} reviews</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{providerData.experience || 0} years</Text>
              <Text style={styles.statLabel}>Experience</Text>
            </View>
          </View>

          {/* About Section */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{providerData.bio || 'No description available.'}</Text>
          </Card>

          {/* Price Section */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing</Text>
            <Text style={styles.priceText}>
              {Number(providerData.hourlyRate || 0).toLocaleString()} FCFA / hour
            </Text>
          </Card>

          {/* Location Section */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <Text style={styles.locationText}>
              📍 {providerData.location?.address || 'Location not specified'}
            </Text>
          </Card>
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <Button
          title={!isAuthenticated ? "Login to Book" : "Book Now"}
          onPress={handleBookNow}
          size="large"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  coverContainer: {
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.gray[200],
  },
  coverPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  coverPlaceholderText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: Colors.text.white,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: Colors.text.white,
  },
  infoSection: {
    padding: 20,
  },
  profileContainer: {
    marginTop: -40,
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: Colors.background.primary,
  },
  profilePlaceholder: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePlaceholderText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Colors.text.white,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  verifiedBadge: {
    backgroundColor: Colors.secondaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
  },
  stat: {},
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  categoryBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  locationText: {
    fontSize: 15,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  cityText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.secondary,
  },
  review: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  reviewRating: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  reviewComment: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  noReviews: {
    fontSize: 14,
    color: Colors.text.light,
    fontStyle: 'italic',
  },
  unavailableCard: {
    backgroundColor: Colors.dangerLight,
    borderColor: Colors.danger,
  },
  unavailableTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.danger,
    marginBottom: 4,
  },
  unavailableText: {
    fontSize: 14,
    color: Colors.danger,
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
});