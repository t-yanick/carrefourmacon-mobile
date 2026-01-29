import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/api/client';
import { providersApi } from '@/api/providers';
import Toast from 'react-native-toast-message';

export default function CompleteProfileProviderScreen() {
  const { phoneNumber, token } = useLocalSearchParams<{ phoneNumber: string; token: string }>();
  const { login } = useAuth();
  
  const [idImage, setIdImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    address: '',
    experience: '',
    hourlyRate: '',
    services: '',
    selectedCategories: [] as string[],
  });

  const { data: categoriesResponse } = useQuery({
    queryKey: ['categories'],
    queryFn: () => providersApi.getCategories(),
  });
  
  // Drilling into response structure
  const categories = categoriesResponse?.data || categoriesResponse || [];

  const completeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/auth/complete-profile', {
        name: data.name,
        email: data.email,
        role: 'PROVIDER',
        location: {
          address: data.address,
          lat: 3.8480,
          lng: 11.5021,
        },
        providerData: {
          bio: data.bio,
          experience: parseInt(data.experience) || 0,
          hourlyRate: parseInt(data.hourlyRate) || 0,
          services: data.services.split(',').map((s: string) => s.trim()).filter(Boolean),
          categoryIds: data.selectedCategories,
          idDocument: idImage, // Sending URI (Backend should handle as File or Base64)
        },
      });
      return response.data;
    },
    onSuccess: async (data) => {
      await login(token!, data.user);
      Toast.show({ 
        type: 'success', 
        text1: 'Registration Submitted!', 
        text2: 'Your profile is pending admin approval' 
      });
      router.replace('/(provider)/dashboard');
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to create profile',
      });
    },
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({ type: 'error', text1: 'Permission Denied', text2: 'We need access to your gallery to upload ID' });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      setIdImage(result.assets[0].uri);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter(id => id !== categoryId)
        : [...prev.selectedCategories, categoryId]
    }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return Toast.show({ type: 'error', text1: 'Name Required' });
    if (!idImage) return Toast.show({ type: 'error', text1: 'ID Verification Required', text2: 'Please upload your CNI/Passport' });
    if (formData.selectedCategories.length === 0) return Toast.show({ type: 'error', text1: 'Select a Category' });
    
    completeMutation.mutate(formData);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Become a Professional</Text>
          <Text style={styles.subtitle}>Fill in your details to start earning on CarrefourMacon</Text>

          <View style={styles.form}>
            <Input
              label="Full Name *"
              placeholder="John Doe"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              autoCapitalize="words"
            />

            <Input
              label="Professional Bio *"
              placeholder="Ex: Expert mason with 10 years experience in tiling..."
              value={formData.bio}
              onChangeText={(text) => setFormData({ ...formData, bio: text })}
              multiline
              numberOfLines={4}
              style={styles.textArea}
            />

            {/* KYC SECTION */}
            <Text style={styles.label}>Identity Verification (CNI / Passport) *</Text>
            <TouchableOpacity style={[styles.imageUpload, idImage && styles.imageUploadActive]} onPress={pickImage}>
              {idImage ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: idImage }} style={styles.imagePreview} />
                  <Text style={styles.imageChangeText}>Change Photo</Text>
                </View>
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Text style={styles.uploadPlaceholderIcon}>📸</Text>
                  <Text style={styles.uploadPlaceholderText}>Upload ID Card Photo</Text>
                </View>
              )}
            </TouchableOpacity>

            <Input
              label="Business Address *"
              placeholder="Bastos, Yaoundé"
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
            />

            <View style={styles.row}>
              <Input
                label="Experience (Years) *"
                placeholder="5"
                value={formData.experience}
                onChangeText={(text) => setFormData({ ...formData, experience: text })}
                keyboardType="numeric"
                containerStyle={styles.halfInput}
              />
              <Input
                label="Hourly Rate (XAF) *"
                placeholder="5000"
                value={formData.hourlyRate}
                onChangeText={(text) => setFormData({ ...formData, hourlyRate: text })}
                keyboardType="numeric"
                containerStyle={styles.halfInput}
              />
            </View>

            <View>
              <Text style={styles.label}>Service Categories *</Text>
              <View style={styles.categoriesGrid}>
                {categories.map((cat: any) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      formData.selectedCategories.includes(cat.id) && styles.categoryChipSelected
                    ]}
                    onPress={() => toggleCategory(cat.id)}
                  >
                    <Text style={[styles.categoryText, formData.selectedCategories.includes(cat.id) && styles.categoryTextSelected]}>
                      {cat.nameEn || cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Card style={styles.infoCard}>
              <Text style={styles.infoTitle}>📋 Verification Process</Text>
              <Text style={styles.infoText}>
                Your profile is submitted as **PENDING**. Our admins will verify your ID and bio. You'll be notified once **APPROVED**.
              </Text>
            </Card>

            <Button
              title="Submit Application"
              onPress={handleSubmit}
              loading={completeMutation.isPending}
              size="large"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  flex: { flex: 1 },
  content: { padding: 24, paddingTop: 40, paddingBottom: 100 },
  title: { fontSize: 28, fontWeight: 'bold', color: Colors.text.primary, marginBottom: 8 },
  subtitle: { fontSize: 16, color: Colors.text.secondary, marginBottom: 32 },
  form: { gap: 18 },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  label: { fontSize: 14, fontWeight: '700', color: Colors.text.primary, marginBottom: 4 },
  imageUpload: { height: 160, backgroundColor: '#F5F5F5', borderRadius: 12, borderStyle: 'dashed', borderWidth: 2, borderColor: '#DDD', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  imageUploadActive: { borderStyle: 'solid', borderColor: Colors.primary },
  imagePreviewContainer: { width: '100%', height: '100%' },
  imagePreview: { width: '100%', height: '100%', opacity: 0.8 },
  imageChangeText: { position: 'absolute', bottom: 10, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.6)', color: '#FFF', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, fontSize: 12 },
  uploadPlaceholder: { alignItems: 'center' },
  uploadPlaceholderIcon: { fontSize: 32, marginBottom: 8 },
  uploadPlaceholderText: { color: '#888', fontWeight: '500' },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F0F0F0', borderWidth: 1, borderColor: '#EEE' },
  categoryChipSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryText: { fontSize: 13, color: '#666', fontWeight: '600' },
  categoryTextSelected: { color: '#FFF' },
  infoCard: { padding: 16, backgroundColor: Colors.primary + '05', borderLeftWidth: 4, borderLeftColor: Colors.primary },
  infoTitle: { fontWeight: 'bold', marginBottom: 4 },
  infoText: { fontSize: 13, color: '#666', lineHeight: 18 },
});