import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
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
      Toast.show({
        type: 'error',
        text1: 'Invalid OTP',
        text2: 'Please enter all 6 digits',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.verifyOTP({
        phone: phoneNumber!,
        code: code,
      });

      // Correctly extract token and user from the response.data wrapper
      if (response.success && response.data) {
        await login(response.data.token, response.data.user);
      } else {
        // Fallback for different API structures
        await login(response.token, response.user);
      }

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: response.isNewUser ? 'Account created successfully' : 'Welcome back!',
      });

      // Navigate based on role
      if (response.user?.role === UserRole.PROVIDER) {
        router.replace('/(provider)/dashboard');
      } else {
        router.replace('/(customer)/home');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Invalid OTP. Please try again.';
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: errorMessage,
      });
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
      
      Toast.show({
        type: 'success',
        text1: 'OTP Resent',
        text2: 'Check your phone for the new code',
      });

      setTimer(OTP_CONFIG.expiryMinutes * 60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to resend OTP. Please try again.',
      });
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Verify Your Phone</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to{'\n'}
            <Text style={styles.phoneNumber}>{phoneNumber}</Text>
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.changeNumber}>Change number</Text>
          </TouchableOpacity>
        </View>

        {/* OTP Inputs */}
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

        {/* Timer */}
        <View style={styles.timerContainer}>
          {timer > 0 ? (
            <Text style={styles.timerText}>Code expires in {formatTime(timer)}</Text>
          ) : (
            <Text style={styles.expiredText}>Code expired</Text>
          )}
        </View>

        {/* Verify Button */}
        <Button
          title="Verify Code"
          onPress={() => handleVerifyOTP()}
          loading={isLoading}
          disabled={otp.some((digit) => !digit)}
          size="large"
        />

        {/* Resend */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code?</Text>
          <TouchableOpacity onPress={handleResendOTP} disabled={isResending || timer > 0}>
            <Text style={[styles.resendButton, (isResending || timer > 0) && styles.resendDisabled]}>
              {isResending ? 'Sending...' : 'Resend Code'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 24,
    marginBottom: 8,
  },
  phoneNumber: {
    fontWeight: '600',
    color: Colors.text.primary,
  },
  changeNumber: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 8,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: Colors.border.light,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  otpInputFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  timerText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  expiredText: {
    fontSize: 14,
    color: Colors.danger,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
  },
  resendText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  resendButton: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  resendDisabled: {
    color: Colors.text.light,
  },
});