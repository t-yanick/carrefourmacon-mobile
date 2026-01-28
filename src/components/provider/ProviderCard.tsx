import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Card } from '@/components/common/Card';
import { Provider } from '@/types/provider';
import { Colors } from '@/constants/colors';

interface ProviderCardProps {
  provider: Provider;
  onPress: () => void;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({ provider, onPress }) => {
  return (
    <Card onPress={onPress} style={styles.container}>
      <View style={styles.content}>
        {/* Provider Image */}
        <View style={styles.imageContainer}>
          {provider.profileImage ? (
            <Image source={{ uri: provider.profileImage }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.placeholder]}>
              <Text style={styles.placeholderText}>
                {(provider.businessName?.charAt(0) || 'P').toUpperCase()}
              </Text>
            </View>
          )}
          {provider.isVerified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓</Text>
            </View>
          )}
        </View>

        {/* Provider Info */}
        <View style={styles.info}>
          <Text style={styles.businessName} numberOfLines={1}>
            {provider.businessName}
          </Text>
          
          <View style={styles.categoryRow}>
            {provider.categories.slice(0, 2).map((cat, index) => (
              <View key={cat.id} style={styles.categoryBadge}>
                <Text style={styles.categoryText} numberOfLines={1}>
                  {cat.name}
                </Text>
              </View>
            ))}
            {provider.categories.length > 2 && (
              <Text style={styles.moreCategories}>
                +{provider.categories.length - 2}
              </Text>
            )}
          </View>

          <View style={styles.details}>
             <View style={styles.ratingRow}>
              {/* Use Number() and || 0 to ensure toFixed(1) always has a value to work with */}
              <Text style={styles.rating}>
                ⭐ {(Number(provider.rating) || 0).toFixed(1)}
              </Text>
              <Text style={styles.reviews}>
                ({provider.totalReviews || 0})
              </Text>
            </View>
              {/* Add a fallback for city in case it is null */}
            <Text style={styles.location}>
              📍 {provider.city || 'Location not set'}
            </Text>
          </View>

          {provider.priceRange && (
            <Text style={styles.priceRange}>{provider.priceRange}</Text>
          )}

          {!provider.isAvailable && (
            <View style={styles.unavailableBadge}>
              <Text style={styles.unavailableText}>Currently Unavailable</Text>
            </View>
          )}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  content: {
    flexDirection: 'row',
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  placeholder: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text.white,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: Colors.secondary,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background.primary,
  },
  verifiedText: {
    color: Colors.text.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 6,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 4,
  },
  categoryBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    maxWidth: 100,
  },
  categoryText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
  moreCategories: {
    fontSize: 11,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  reviews: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  location: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  priceRange: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.secondary,
    marginTop: 4,
  },
  unavailableBadge: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.dangerLight,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  unavailableText: {
    fontSize: 11,
    color: Colors.danger,
    fontWeight: '600',
  },
});