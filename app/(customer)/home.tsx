import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { providersApi } from '@/api/providers';
import { ProviderCard } from '@/components/provider/ProviderCard';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';

export default function HomeScreen() {
  // Added isAuthenticated to handle the guest flow
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 1. Fetch Categories
  const { data: categoriesResponse } = useQuery({
    queryKey: ['categories'],
    queryFn: () => providersApi.getCategories(),
  });
  const categories = categoriesResponse?.data || [];

  // 2. Fetch Providers
  const {
    data: providersResponse,
    isLoading,
    refetch,
    isRefreshing,
  } = useQuery({
    queryKey: ['providers', selectedCategory, searchQuery],
    queryFn: () =>
      providersApi.listProviders({
        category: selectedCategory || undefined,
        search: searchQuery || undefined,
        limit: 20,
      }),
  });
  
  const providers = providersResponse?.data?.providers || providersResponse?.data || [];

  useEffect(() => {
    if (providersResponse) {
      console.log(`[Home] Loaded ${providers.length} providers`);
    }
  }, [providersResponse]);

  const handleProviderPress = (providerId: string) => {
    router.push(`/provider/${providerId}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Sophisticated Header with Login Option for Guests */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.greeting}>
            {isAuthenticated ? `Hello, ${user?.name || 'Partner'}! 👋` : 'Welcome! 👋'}
          </Text>
          <Text style={styles.subtitle}>Find the perfect service provider</Text>
        </View>
        
        {!isAuthenticated && (
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search providers or services..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.text.light}
          />
        </View>
      </View>

      {/* Category Horizontal Filter */}
      <View style={styles.categoriesSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          <TouchableOpacity
            style={[
              styles.categoryChip,
              !selectedCategory && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text
              style={[
                styles.categoryChipText,
                !selectedCategory && styles.categoryChipTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          {Array.isArray(categories) && categories.map((category: any) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category.id &&
                    styles.categoryChipTextActive,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Providers List */}
      <View style={styles.providersSection}>
        <Text style={styles.sectionTitle}>
          {selectedCategory
            ? categories?.find((c: any) => c.id === selectedCategory)?.name
            : 'All Providers'}
        </Text>

        {isLoading && !providersResponse ? (
          <View style={styles.centerContent}>
            <ActivityIndicator color={Colors.primary} size="large" />
            <Text style={styles.loadingText}>Searching for professionals...</Text>
          </View>
        ) : providers.length === 0 ? (
          <View style={styles.centerContent}>
            <Text style={styles.emptyText}>No providers found</Text>
            <Text style={styles.emptySubtext}>Try a different search term or category</Text>
          </View>
        ) : (
          <FlatList
            data={providers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ProviderCard
                provider={item}
                onPress={() => handleProviderPress(item.id)}
              />
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing || false}
                onRefresh={refetch}
                tintColor={Colors.primary}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: Colors.primary,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.white,
    opacity: 0.9,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.primary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
  },
  categoriesSection: {
    backgroundColor: Colors.background.primary,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  categoryChipTextActive: {
    color: Colors.text.white,
  },
  providersSection: {
    flex: 1,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: 10,
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
  },
});
