import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);

  const handleLogin = (userVal, passVal) => {
    const finalUser = (userVal || username).trim().toLowerCase();
    const finalPass = passVal || password;

    if (!finalUser || !finalPass) {
      Alert.alert("Error", "Please fill in all credential fields.");
      return;
    }

    if (finalUser === 'doctor' && finalPass === 'doctor') {
      onLoginSuccess({ username: 'Dr. Harrison', role: 'doctor' });
    } else if (finalUser === 'tech' && finalPass === 'tech') {
      onLoginSuccess({ username: 'Tech Specialist', role: 'tech' });
    } else {
      Alert.alert("Access Denied", "Invalid username or password.\n\nUse 'doctor/doctor' or 'tech/tech' for testing.");
    }
  };

  const quickLogin = (role) => {
    if (role === 'doctor') {
      setUsername('doctor');
      setPassword('doctor');
      handleLogin('doctor', 'doctor');
    } else {
      setUsername('tech');
      setPassword('tech');
      handleLogin('tech', 'tech');
    }
  };

  return (
    <LinearGradient
      colors={['#eff6ff', '#dbeafe']}
      style={styles.gradientContainer}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Logo and Brand */}
          <View style={styles.brandContainer}>
            <Text style={styles.logo}>🫁</Text>
            <Text style={styles.appName}>VentAI</Text>
            <Text style={styles.appTagline}>Clinical Ventilator recommendation Portal</Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Portal Sign-In</Text>

            {/* Username Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter username"
                placeholderTextColor="#94a3b8"
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter password"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="none"
                  secureTextEntry={secureText}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={styles.toggleText}
                  onPress={() => setSecureText(!secureText)}
                >
                  <Text style={styles.toggleTextVal}>{secureText ? "👁️" : "🙈"}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Action Button */}
            <TouchableOpacity style={styles.loginButton} onPress={() => handleLogin()}>
              <Text style={styles.loginButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Login Shortcuts */}
          <View style={styles.shortcutCard}>
            <Text style={styles.shortcutTitle}>🔬 Prototype Quick Logins</Text>
            <Text style={styles.shortcutDesc}>Tap below to log in instantly with preset role settings:</Text>
            
            <View style={styles.shortcutRow}>
              <TouchableOpacity
                style={[styles.shortcutBtn, { backgroundColor: '#eff6ff', borderColor: '#3b82f6' }]}
                onPress={() => quickLogin('doctor')}
              >
                <Text style={[styles.shortcutBtnText, { color: '#1e40af' }]}>🩺 Login as Doctor</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.shortcutBtn, { backgroundColor: '#f0fdf4', borderColor: '#22c55e' }]}
                onPress={() => quickLogin('tech')}
              >
                <Text style={[styles.shortcutBtnText, { color: '#15803d' }]}>🔬 Login as Tech</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 35,
  },
  logo: {
    fontSize: 50,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginTop: 10,
    letterSpacing: 0.5,
  },
  appTagline: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    backgroundColor: '#f8fafc',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#0f172a',
  },
  toggleText: {
    paddingHorizontal: 14,
  },
  toggleTextVal: {
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#1e40af',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shortcutCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  shortcutTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 6,
  },
  shortcutDesc: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 12,
  },
  shortcutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  shortcutBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  shortcutBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
