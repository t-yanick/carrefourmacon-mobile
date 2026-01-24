import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/common/Button';
import { Colors } from '@/constants/colors';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Icon Section */}
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>CM</Text>
          </View>
          <Text style={styles.appName}>CarrefourMacon</Text>
          <Text style={styles.tagline}>Connect with trusted service providers</Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <FeatureItem
            icon="🔍"
            title="Find Services"
            description="Browse hundreds of verified providers"
          />
          <FeatureItem
            icon="📅"
            title="Easy Booking"
            description="Book services in just a few taps"
          />
          <FeatureItem
            icon="💳"
            title="Secure Payment"
            description="Pay safely with FlutterWave"
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Get Started"
            onPress={() => router.push('/(auth)/login')}
            size="large"
          />
          <Text style={styles.footerText}>
            Join thousands of happy customers in Cameroon
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, description }) => (
  <View style={styles.feature}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <View style={styles.featureText}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.text.white,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  features: {
    gap: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureIcon: {
    fontSize: 32,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  actions: {
    gap: 16,
  },
  footerText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});