import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Colors } from '@/constants/colors';
import { PHONE_CONFIG } from '@/constants/config';
import { authApi } from '@/api/auth';
import Toast from 'react-native-toast-message';

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validatePhoneNumber = (phone: string): boolean => {
    // Remove spaces and dashes
    const cleaned = phone.replace(/[\s-]/g, '');
    
    // Check if it's exactly 9 digits
    if (cleaned.length !== PHONE_CONFIG.minLength) {
      setError(`Phone number must be ${PHONE_CONFIG.minLength} digits`);
      return false;
    }

    // Check if it contains only digits
    if (!/^\d+$/.test(cleaned)) {
      setError('Phone number must contain only digits');
      return false;
    }

    return true;
  };

  const handleSendOTP = async () => {
    setError('');

    if (!validatePhoneNumber(phoneNumber)) {
      return;
    }

    setIsLoading(true);

    try {
      // Format phone number with country code
      const fullPhoneNumber = `${PHONE_CONFIG.countryCode}${phoneNumber.replace(/[\s-]/g, '')}`;

      const response = await authApi.sendOTP({ phoneNumber: fullPhoneNumber });

      Toast.show({
        type: 'success',
        text1: 'OTP Sent',
        text2: response.message || 'Check your phone for the verification code',
      });

      // Navigate to OTP verification screen
      router.push({
        pathname: '/(auth)/verify-otp',
        params: { phoneNumber: fullPhoneNumber },
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to send OTP. Please try again.';
      setError(errorMessage);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Enter your phone number to receive a verification code
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.phoneInputContainer}>
              <View style={styles.countryCode}>
                <Text style={styles.countryCodeText}>{PHONE_CONFIG.countryCode}</Text>
              </View>
              <Input
                label="Phone Number"
                placeholder="6XXXXXXXX"
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneNumber(text);
                  setError('');
                }}
                keyboardType="phone-pad"
                maxLength={PHONE_CONFIG.maxLength}
                error={error}
                containerStyle={styles.phoneInput}
              />
            </View>

            <Button
              title="Send Verification Code"
              onPress={handleSendOTP}
              loading={isLoading}
              disabled={phoneNumber.length !== PHONE_CONFIG.minLength}
              size="large"
            />

            {/* Info */}
            <View style={styles.info}>
              <Text style={styles.infoText}>
                We'll send you a 6-digit verification code via SMS to confirm your phone number.
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  form: {
    gap: 24,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  countryCode: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 12,
    backgroundColor: Colors.background.secondary,
    marginBottom: 16,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  phoneInput: {
    flex: 1,
  },
  info: {
    backgroundColor: Colors.primaryLight,
    padding: 16,
    borderRadius: 12,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 24,
  },
  footerText: {
    fontSize: 12,
    color: Colors.text.light,
    textAlign: 'center',
    lineHeight: 18,
  },
});