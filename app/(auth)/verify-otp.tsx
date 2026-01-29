import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/common/Button';
import { Colors } from '@/constants/colors';
import { OTP_CONFIG } from '@/constants/config';
import { authApi } from '@/api/auth';
import { useAuth } from '@/context/AuthContext';
import Toast from 'react-native-toast-message';
import { UserRole } from '@/types/user';

export default function VerifyOTPScreen() {
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>();
  const { login } = useAuth();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(OTP_CONFIG.expiryMinutes * 60);
  
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOTPChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < OTP_CONFIG.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits entered
    if (newOtp.every((digit) => digit !== '') && !isLoading) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    
    if (code.length !== OTP_CONFIG.length) {
      Toast.show({ type: 'error', text1: 'Invalid OTP', text2: 'Please enter all 6 digits' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.verifyOTP({
        phone: phoneNumber!,
        code: code,
      });

      // Data extraction based on your API structure
      const userData = response.data?.user || response.user;
      const token = response.data?.token || response.token;
      const isNewUser = response.data?.isNewUser || response.isNewUser;

      // Persist session
      await login(token, userData);

      Toast.show({
        type: 'success',
        text1: isNewUser ? 'Phone Verified! 🇰🇲' : 'Welcome Back!',
        text2: isNewUser ? 'Please set up your profile' : 'Logging you in...',
      });

      // 🚀 SOPHISTICATED ROUTING: Handle New vs Returning Users
      if (isNewUser) {
        // Send to Role Selection and pass the token for profile completion
        router.replace({
          pathname: '/(auth)/role-selection',
          params: { phoneNumber, token },
        });
      } else if (userData?.role === UserRole.PROVIDER) {
        router.replace('/(provider)/dashboard');
      } else {
        router.replace('/(customer)/home');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Invalid OTP. Please try again.';
      Toast.show({ type: 'error', text1: 'Verification Failed', text2: errorMessage });
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      await authApi.sendOTP({ phone: phoneNumber! });
      Toast.show({ type: 'success', text1: 'OTP Resent', text2: 'Check your phone' });
      setTimer(OTP_CONFIG.expiryMinutes * 60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not resend OTP' });
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Verify Phone</Text>
          <Text style={styles.subtitle}>
            Enter the code sent to <Text style={styles.phoneNumber}>{phoneNumber}</Text>
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.changeNumber}>Change number</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[styles.otpInput, digit && styles.otpInputFilled]}
              value={digit}
              onChangeText={(value) => handleOTPChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              autoFocus={index === 0}
            />
          ))}
        </View>

        <View style={styles.timerContainer}>
          <Text style={timer > 0 ? styles.timerText : styles.expiredText}>
            {timer > 0 ? `Expires in ${formatTime(timer)}` : 'Code expired'}
          </Text>
        </View>

        <Button
          title="Confirm Code"
          onPress={() => handleVerifyOTP()}
          loading={isLoading}
          disabled={otp.some((digit) => !digit)}
          size="large"
        />

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't get it?</Text>
          <TouchableOpacity onPress={handleResendOTP} disabled={isResending || timer > 0}>
            <Text style={[styles.resendButton, (isResending || timer > 0) && styles.resendDisabled]}>
              {isResending ? 'Sending...' : 'Resend OTP'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { flex: 1, paddingHorizontal: 24, paddingVertical: 40 },
  header: { marginBottom: 40 },
  title: { fontSize: 32, fontWeight: 'bold', color: Colors.text.primary, marginBottom: 8 },
  subtitle: { fontSize: 16, color: Colors.text.secondary, lineHeight: 22 },
  phoneNumber: { fontWeight: 'bold', color: Colors.text.primary },
  changeNumber: { color: Colors.primary, fontWeight: '700', marginTop: 10 },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 20 },
  otpInput: {
    width: 48,
    height: 60,
    borderWidth: 2,
    borderColor: '#EEE',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    backgroundColor: '#F9F9F9'
  },
  otpInputFilled: { borderColor: Colors.primary, backgroundColor: '#FFF' },
  timerContainer: { alignItems: 'center', marginBottom: 30 },
  timerText: { color: '#666' },
  expiredText: { color: Colors.danger, fontWeight: 'bold' },
  resendContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30, gap: 5 },
  resendText: { color: '#666' },
  resendButton: { color: Colors.primary, fontWeight: 'bold' },
  resendDisabled: { opacity: 0.5 }
});