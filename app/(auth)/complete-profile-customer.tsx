
import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/api/client';
import Toast from 'react-native-toast-message';

export default function CompleteProfileCustomerScreen() {
  const { phoneNumber, token } = useLocalSearchParams<{ phoneNumber: string; token: string }>();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
  });

  const completeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/auth/complete-profile', {
        ...data,
        role: 'CUSTOMER',
        location: {
          address: data.address,
          lat: 3.8480, // Default Yaoundé
          lng: 11.5021,
        },
      });
      return response.data;
    },
    onSuccess: async (data) => {
      // 1. Log the user in to set the global isAuthenticated state
      await login(token!, data.user);
      
      Toast.show({ 
        type: 'success', 
        text1: 'Account Ready! 🚀', 
        text2: 'Now you can book your first service.' 
      });

      // 2. Sophisticated Routing: 
      // Instead of just 'home', take them back to their discovery path
      router.replace('/(customer)/home');
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: error.response?.data?.message || 'Something went wrong',
      });
    },
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      return Toast.show({ type: 'error', text1: 'Name Required' });
    }
    if (!formData.address.trim()) {
      return Toast.show({ type: 'error', text1: 'Address Required', text2: 'We need this to find nearby providers' });
    }

    completeMutation.mutate(formData);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.flex}
      >
        <ScrollView 
          contentContainerStyle={styles.content} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>👤</Text>
            </View>
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>Last step! Just a few details to get you started on CarrefourMacon.</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Full Name *"
              placeholder="Ex: Jean Paul"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              autoCapitalize="words"
            />

            <Input
              label="Address / Neighborhood *"
              placeholder="Ex: Bastos, Yaoundé"
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
            />

            <Input
              label="Email (Optional)"
              placeholder="your@email.com"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.footer}>
              <Button
                title="Create My Account"
                onPress={handleSubmit}
                loading={completeMutation.isPending}
                size="large"
              />
              <Text style={styles.privacyNote}>
                By continuing, you agree to our Terms of Service.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  content: { padding: 24, paddingBottom: 60 },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: { fontSize: 40 },
  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: Colors.text.primary, 
    textAlign: 'center',
    marginBottom: 8 
  },
  subtitle: { 
    fontSize: 15, 
    color: Colors.text.secondary, 
    textAlign: 'center', 
    lineHeight: 22,
    paddingHorizontal: 10
  },
  form: { gap: 20 },
  footer: { marginTop: 20, gap: 16 },
  privacyNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 20,
  }
});