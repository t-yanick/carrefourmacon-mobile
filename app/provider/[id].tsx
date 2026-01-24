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

export default function ProviderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: provider, isLoading } = useQuery({
    queryKey: ['provider', id],
    queryFn: () => providersApi.getProvider(id!),
    enabled: !!id,
  });

  const { data: reviews } = useQuery({
    queryKey: ['provider-reviews', id],
    queryFn: () => providersApi.getProviderReviews(id!),
    enabled: !!id,
  });

  const handleBookNow = () => {
    router.push({
      pathname: '/booking/create',
      params: { providerId: id },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!provider) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Provider not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>
        {/* Cover Image */}
        <View style={styles.coverContainer}>
          {provider.coverImage ? (
            <Image source={{ uri: provider.coverImage }} style={styles.coverImage} />
          ) : (
            <View style={[styles.coverImage, styles.coverPlaceholder]}>
              <Text style={styles.coverPlaceholderText}>
                {provider.businessName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        </View>

        {/* Provider Info */}
        <View style={styles.infoSection}>
          <View style={styles.profileContainer}>
            {provider.profileImage ? (
              <Image source={{ uri: provider.profileImage }} style={styles.profileImage} />
            ) : (
              <View style={[styles.profileImage, styles.profilePlaceholder]}>
                <Text style={styles.profilePlaceholderText}>
                  {provider.businessName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.nameRow}>
            <Text style={styles.businessName}>{provider.businessName}</Text>
            {provider.isVerified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Verified</Text>
              </View>
            )}
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>⭐ {provider.rating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>{provider.totalReviews} reviews</Text>
            </View>
            {provider.yearsOfExperience && (
              <View style={styles.stat}>
                <Text style={styles.statValue}>{provider.yearsOfExperience} years</Text>
                <Text style={styles.statLabel}>Experience</Text>
              </View>
            )}
          </View>

          {/* Categories */}
          <View style={styles.categoriesRow}>
            {provider.categories.map((cat) => (
              <View key={cat.id} style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{cat.name}</Text>
              </View>
            ))}
          </View>

          {/* Description */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{provider.description}</Text>
          </Card>

          {/* Location */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <Text style={styles.locationText}>📍 {provider.address}</Text>
            <Text style={styles.cityText}>{provider.city}</Text>
          </Card>

          {/* Price Range */}
          {provider.priceRange && (
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Price Range</Text>
              <Text style={styles.priceText}>{provider.priceRange}</Text>
            </Card>
          )}

          {/* Reviews */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>
              Reviews ({reviews?.length || 0})
            </Text>
            {reviews && reviews.length > 0 ? (
              reviews.slice(0, 3).map((review) => (
                <View key={review.id} style={styles.review}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>{review.customer?.fullName}</Text>
                    <Text style={styles.reviewRating}>⭐ {review.rating}</Text>
                  </View>
                  {review.comment && (
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.noReviews}>No reviews yet</Text>
            )}
          </Card>

          {/* Availability Status */}
          {!provider.isAvailable && (
            <Card style={[styles.section, styles.unavailableCard]}>
              <Text style={styles.unavailableTitle}>Currently Unavailable</Text>
              <Text style={styles.unavailableText}>
                This provider is not accepting bookings at the moment
              </Text>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* Book Now Button */}
      <View style={styles.footer}>
        <Button
          title={provider.isAvailable ? 'Book Now' : 'Unavailable'}
          onPress={handleBookNow}
          disabled={!provider.isAvailable}
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