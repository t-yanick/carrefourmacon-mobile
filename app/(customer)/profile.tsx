import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, logout, isAuthenticated } = useAuth();

  // Guest mode - Sophisticated empty state
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.guestContainer}>
          <View style={styles.guestIconCircle}>
            <Ionicons name="person-circle-outline" size={80} color={Colors.primary} />
          </View>
          <Text style={styles.guestTitle}>Your Profile</Text>
          <Text style={styles.guestText}>
            Join CarrefourMacon to track your bookings, save your favorite pros, and manage your payments securely.
          </Text>
          <Button
            title="Login / Register"
            onPress={() => router.push('/(auth)/login')}
            size="large"
            style={styles.guestButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/welcome');
          },
        },
      ],
      { cancelable: true }
    );
  };

  const MenuItem = ({
    icon,
    title,
    onPress,
    subtitle,
    color = Colors.text.primary,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    color?: string;
  }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIconContainer, { backgroundColor: color + '10' }]}>
            <Text style={styles.menuIcon}>{icon}</Text>
        </View>
        <View>
            <Text style={[styles.menuTitle, { color }]}>{title}</Text>
            {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.text.light} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* User Info Card */}
        <Card style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
            <TouchableOpacity style={styles.editAvatarBadge}>
                <Ionicons name="camera" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.name || 'Partner'}</Text>
          <View style={styles.locationRow}>
             <Ionicons name="location-sharp" size={14} color={Colors.primary} />
             <Text style={styles.userPhone}> {user?.location?.address || 'Bastos, Yaoundé'}</Text>
          </View>
          <Text style={styles.userEmail}>{user?.phone}</Text>
        </Card>

        {/* Business Mode Switch - SOPHISTICATED ADDITION */}
        <View style={styles.section}>
            <TouchableOpacity 
                style={styles.providerPromoCard}
                onPress={() => router.push('/(auth)/role-selection')}
            >
                <View style={styles.promoTextContainer}>
                    <Text style={styles.promoTitle}>Earn Money as a Pro</Text>
                    <Text style={styles.promoSubtitle}>Join our network of verified experts</Text>
                </View>
                <View style={styles.promoBadge}>
                    <Text style={styles.promoBadgeText}>Register</Text>
                </View>
            </TouchableOpacity>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <Card style={styles.menuCard}>
            <MenuItem
              icon="👤"
              title="Personal Information"
              onPress={() => Alert.alert('Coming Soon', 'Profile editing is coming in the next update!')}
            />
            <View style={styles.divider} />
            <MenuItem
              icon="📍"
              title="Saved Addresses"
              onPress={() => {}}
            />
            <View style={styles.divider} />
            <MenuItem
              icon="💳"
              title="Payment Methods"
              subtitle="FlutterWave, Mobile Money"
              onPress={() => {}}
            />
          </Card>
        </View>

        {/* Support & Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <Card style={styles.menuCard}>
            <MenuItem
              icon="💬"
              title="Help & Support"
              onPress={() => Alert.alert('Support', 'Contact us: support@carrefourmacon.com')}
            />
            <View style={styles.divider} />
            <MenuItem
              icon="🛡️"
              title="Privacy Policy"
              onPress={() => {}}
            />
          </Card>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
            <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.0 (MVP)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { padding: 20 },
  guestContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  guestIconCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: Colors.primary + '10', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  guestTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.text.primary, marginBottom: 12 },
  guestText: { fontSize: 16, color: Colors.text.secondary, textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  guestButton: { width: '100%' },
  userCard: { alignItems: 'center', paddingVertical: 30, borderRadius: 24, marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: '#FFF' },
  editAvatarBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: Colors.secondary, width: 32, height: 32, borderRadius: 16, borderOuterWidth: 3, borderColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  userName: { fontSize: 22, fontWeight: 'bold', color: Colors.text.primary },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  userPhone: { fontSize: 14, color: Colors.text.secondary },
  userEmail: { fontSize: 14, color: Colors.text.light },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#AAA', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1 },
  menuCard: { padding: 0, overflow: 'hidden', borderRadius: 18 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  menuIconContainer: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  menuIcon: { fontSize: 20 },
  menuTitle: { fontSize: 16, fontWeight: '600' },
  menuSubtitle: { fontSize: 12, color: '#999', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginLeft: 70 },
  providerPromoCard: { flexDirection: 'row', backgroundColor: Colors.primary, padding: 20, borderRadius: 20, alignItems: 'center', justifyContent: 'space-between' },
  promoTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  promoSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  promoBadge: { backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  promoBadgeText: { color: Colors.primary, fontWeight: 'bold', fontSize: 12 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 15, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#FEE2E2' },
  logoutText: { marginLeft: 10, color: Colors.danger, fontWeight: 'bold', fontSize: 16 },
  versionText: { textAlign: 'center', color: '#CCC', fontSize: 12, marginTop: 30, marginBottom: 20 }
});