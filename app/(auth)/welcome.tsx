import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
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

        {/* Features - Modernized with better spacing */}
        <View style={styles.features}>
          <FeatureItem
            icon="🔍"
            title="Find Services"
            description="Browse hundreds of verified providers in Cameroon"
          />
          <FeatureItem
            icon="📅"
            title="Easy Booking"
            description="Book professionals for your home in just a few taps"
          />
          <FeatureItem
            icon="💳"
            title="Secure Payment"
            description="Safe transactions powered by FlutterWave"
          />
        </View>

        {/* Actions - Now supports Guest Discovery Flow */}
        <View style={styles.actions}>
          <Button
            title="Get Started"
            onPress={() => router.replace('/(customer)/home')} // Direct to Discovery
            size="large"
          />
          
          <TouchableOpacity 
            style={styles.loginContainer} 
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.footerText}>
              Already have an account? <Text style={styles.loginText}>Log In</Text>
            </Text>
          </TouchableOpacity>

          <Text style={styles.subFooterText}>
            Join thousands of happy customers across the country
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
    <View style={styles.iconWrapper}>
      <Text style={styles.featureIcon}>{icon}</Text>
    </View>
    <View style={styles.featureText}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background?.primary || '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    // Native shadow for sophistication
    ...Platform.select({
      ios: { shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 10 },
      android: { elevation: 8 },
    }),
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  appName: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.text?.primary || '#1A1A1A',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: Colors.text?.secondary || '#666666',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  features: {
    gap: 24,
    marginVertical: 40,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    backgroundColor: '#F5F7FA',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIcon: {
    fontSize: 26,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text?.primary || '#1A1A1A',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.text?.secondary || '#777777',
    lineHeight: 20,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  loginContainer: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
    color: Colors.text?.secondary || '#666666',
  },
  loginText: {
    color: Colors.primary,
    fontWeight: '800',
  },
  subFooterText: {
    fontSize: 12,
    color: Colors.text?.secondary || '#999999',
    textAlign: 'center',
    marginTop: 4,
  },
});