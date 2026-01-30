import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, Linking, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';

export default function ProviderProfileScreen() {
  const { user, logout } = useAuth();
  const [isAvailable, setIsAvailable] = React.useState(true);

  // Robust Status Logic matching Prisma Enum: ProviderStatus
  const status = user?.providerProfile?.status || 'PENDING'; 
  
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'APPROVED': return { label: 'Verified Provider', color: Colors.success, icon: 'checkmark-circle' };
      case 'PENDING': return { label: 'Verification Pending', color: Colors.warning, icon: 'time' };
      case 'REJECTED': return { label: 'Verification Failed', color: Colors.error, icon: 'close-circle' };
      case 'SUSPENDED': return { label: 'Account Suspended', color: Colors.text.primary, icon: 'alert-circle' };
      default: return { label: 'Guest', color: Colors.text.secondary, icon: 'person' };
    }
  };

  const statusConfig = getStatusConfig(status);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { 
          await logout(); 
          router.replace('/(auth)/login'); 
      }},
    ]);
  };

  const contactSupport = () => {
    // Cameroon MVP strategy: WhatsApp support is more effective than Email
    const whatsappUrl = `whatsapp://send?phone=2376XXXXXXXX`; // Add your CM support number
    Linking.canOpenURL(whatsappUrl).then(supported => {
      if (supported) Linking.openURL(whatsappUrl);
      else Alert.alert('Support', 'Please email support@carrefourmacon.com');
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Modern Profile Header */}
        <Card style={styles.headerCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'P'}</Text>
            </View>
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Ionicons name="camera" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.phone}>{user?.phone || '+237 ...'}</Text>
          
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '15' }]}>
            <Ionicons name={statusConfig.icon as any} size={14} color={statusConfig.color} />
            <Text style={[styles.statusBadgeText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </Card>

        {/* Availability Section */}
        <Card style={styles.sectionCard}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.sectionTitle}>Online Status</Text>
              <Text style={styles.toggleSub}>When off, you won't receive new jobs in Yaoundé/Douala.</Text>
            </View>
            <Switch 
              value={isAvailable} 
              onValueChange={setIsAvailable} 
              trackColor={{ false: '#D1D1D1', true: Colors.secondary }}
              thumbColor={Platform.OS === 'android' ? '#FFF' : ''}
            />
          </View>
        </Card>

        {/* Menu Options */}
        <Text style={styles.groupLabel}>Account Settings</Text>
        <Card style={styles.menuCard}>
          <MenuItem icon="person-outline" title="Edit Personal Info" onPress={() => {}} />
          <Divider />
          <MenuItem icon="construct-outline" title="Service Specialization" onPress={() => {}} />
          <Divider />
          <MenuItem icon="star-outline" title="My Ratings & Reviews" onPress={() => {}} />
        </Card>

        <Text style={styles.groupLabel}>Help & Support</Text>
        <Card style={styles.menuCard}>
          <MenuItem icon="logo-whatsapp" title="Chat with Support" color="#25D366" onPress={contactSupport} />
          <Divider />
          <MenuItem icon="document-text-outline" title="Terms of Service" onPress={() => {}} />
        </Card>

        <View style={styles.footer}>
          <Button title="Logout" onPress={handleLogout} variant="outline" style={styles.logoutBtn} />
          <Text style={styles.version}>CarrefourMacon v1.0.2 - MVP</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const MenuItem = ({ icon, title, onPress, color }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuLeft}>
      <View style={[styles.iconWrapper, color ? { backgroundColor: color + '10' } : {}]}>
        <Ionicons name={icon} size={22} color={color || Colors.text.primary} />
      </View>
      <Text style={styles.menuTitle}>{title}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={Colors.text.light} />
  </TouchableOpacity>
);

const Divider = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.secondary },
  content: { padding: 16, paddingBottom: 40 },
  headerCard: { alignItems: 'center', paddingVertical: 24, borderRadius: 24, marginBottom: 20 },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
  editAvatarBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: Colors.text.primary, width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' },
  name: { fontSize: 22, fontWeight: '800', color: Colors.text.primary, marginBottom: 4 },
  phone: { fontSize: 15, color: Colors.text.secondary, marginBottom: 12 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
  statusBadgeText: { fontSize: 12, fontWeight: '700' },
  sectionCard: { padding: 16, borderRadius: 20, marginBottom: 20 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleInfo: { flex: 1, paddingRight: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text.primary, marginBottom: 4 },
  toggleSub: { fontSize: 12, color: Colors.text.secondary, lineHeight: 18 },
  groupLabel: { fontSize: 13, fontWeight: '700', color: Colors.text.light, textTransform: 'uppercase', marginLeft: 4, marginBottom: 8, letterSpacing: 1 },
  menuCard: { padding: 0, borderRadius: 20, marginBottom: 24, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrapper: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.background.secondary, alignItems: 'center', justifyContent: 'center' },
  menuTitle: { fontSize: 15, fontWeight: '600', color: Colors.text.primary },
  divider: { height: 1, backgroundColor: Colors.border.light, marginLeft: 60 },
  footer: { marginTop: 10, alignItems: 'center', gap: 16 },
  logoutBtn: { width: '100%', borderRadius: 16, borderColor: Colors.error },
  version: { fontSize: 12, color: Colors.text.light, marginBottom: 20 }
});