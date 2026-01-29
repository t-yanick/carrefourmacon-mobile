import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/common/Card';
import { Colors } from '@/constants/colors';

export default function RoleSelectionScreen() {
  const { phoneNumber, token } = useLocalSearchParams<{ phoneNumber: string; token: string }>();

  const handleRoleSelect = (role: 'CUSTOMER' | 'PROVIDER') => {
    router.push({
      pathname: role === 'CUSTOMER' ? '/(auth)/complete-profile-customer' : '/(auth)/complete-profile-provider',
      params: { phoneNumber, token },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to CarrefourMacon!</Text>
          <Text style={styles.subtitle}>Choose how you want to interact with our community</Text>
        </View>

        <View style={styles.cards}>
          <TouchableOpacity 
            activeOpacity={0.8}
            style={styles.roleCard} 
            onPress={() => handleRoleSelect('CUSTOMER')}
          >
            <Card style={styles.card}>
              <View style={styles.iconContainer}>
                <Text style={styles.roleIcon}>🙋‍♂️</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.roleTitle}>I'm a Customer</Text>
                <Text style={styles.roleDescription}>
                  Find and book trusted professionals for home repairs, cleaning, and more.
                </Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>GET SERVICES</Text>
              </View>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.8}
            style={styles.roleCard} 
            onPress={() => handleRoleSelect('PROVIDER')}
          >
            <Card style={styles.card}>
              <View style={[styles.iconContainer, styles.iconContainerProvider]}>
                <Text style={styles.roleIcon}>🔧</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.roleTitle}>I'm a Professional</Text>
                <Text style={styles.roleDescription}>
                  List your skills, reach thousands of clients, and manage your business.
                </Text>
              </View>
              <View style={[styles.badge, styles.badgeProvider]}>
                <Text style={[styles.badgeText, styles.badgeTextProvider]}>EARN MONEY</Text>
              </View>
            </Card>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background?.primary || '#FFFFFF' 
  },
  content: { 
    flex: 1, 
    padding: 24, 
    justifyContent: 'center' 
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: Colors.text?.primary || '#333', 
    textAlign: 'center', 
    marginBottom: 10 
  },
  subtitle: { 
    fontSize: 16, 
    color: Colors.text?.secondary || '#666', 
    textAlign: 'center', 
    lineHeight: 22,
    paddingHorizontal: 20
  },
  cards: { 
    gap: 20 
  },
  roleCard: {
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  card: { 
    padding: 24, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    backgroundColor: '#FFF',
    overflow: 'hidden'
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: (Colors.primary || '#007AFF') + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  iconContainerProvider: {
    backgroundColor: (Colors.secondary || '#5856D6') + '10',
  },
  roleIcon: { 
    fontSize: 32 
  },
  textContainer: {
    alignItems: 'flex-start'
  },
  roleTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: Colors.text?.primary || '#333', 
    marginBottom: 8 
  },
  roleDescription: { 
    fontSize: 14, 
    color: Colors.text?.secondary || '#666', 
    lineHeight: 20,
    textAlign: 'left'
  },
  badge: { 
    position: 'absolute', 
    top: 24, 
    right: 24, 
    backgroundColor: (Colors.primary || '#007AFF') + '15', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 8 
  },
  badgeProvider: { 
    backgroundColor: (Colors.secondary || '#5856D6') + '15' 
  },
  badgeText: { 
    fontSize: 10, 
    fontWeight: '800', 
    color: Colors.primary || '#007AFF',
    letterSpacing: 0.5
  },
  badgeTextProvider: {
    color: Colors.secondary || '#5856D6'
  }
});