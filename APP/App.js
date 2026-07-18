import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import PatientForm from './components/PatientForm';
import PatientList from './components/PatientList';
import Recommendation from './components/Recommendation';
import Dashboard from './components/Dashboard';
import Login from './components/Login';

export default function App() {
  const [user, setUser] = useState(null); // { username: string, role: 'doctor' | 'tech' }
  const [currentTab, setCurrentTab] = useState('register');

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    // Set default tab based on role
    if (loggedInUser.role === 'tech') {
      setCurrentTab('register');
    } else {
      setCurrentTab('patients');
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  // If user is not logged in, render the login portal
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const renderScreen = () => {
    switch (currentTab) {
      case 'register':
        return user.role === 'tech' ? <PatientForm /> : null;
      case 'patients':
        return <PatientList />;
      case 'review':
        return user.role === 'doctor' ? <Recommendation /> : null;
      case 'dashboard':
        return user.role === 'doctor' ? <Dashboard /> : null;
      default:
        return <PatientList />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e40af" />
      
      {/* Header */}
      <LinearGradient
        colors={['#1e40af', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.logoAndTitle}>
            <Text style={styles.headerLogo}>🫁</Text>
            <View>
              <Text style={styles.headerTitle}>VentAI</Text>
              <Text style={styles.headerSubtitle}>
                {user.role === 'doctor' ? 'Physician Workspace' : 'Technician Intake Portal'}
              </Text>
            </View>
          </View>

          {/* User Info & Logout Button */}
          <View style={styles.userSection}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.username}</Text>
              <Text style={styles.userRoleBadge}>{user.role.toUpperCase()}</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>🚪</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Screen Content */}
      <View style={styles.contentContainer}>
        {renderScreen()}
      </View>

      {/* Dynamic Tab Navigation Bar based on Role */}
      <View style={styles.tabBar}>
        {user.role === 'tech' && (
          <TouchableOpacity
            style={[styles.tabItem, currentTab === 'register' && styles.tabItemActive]}
            onPress={() => setCurrentTab('register')}
          >
            <Text style={styles.tabIcon}>📝</Text>
            <Text style={[styles.tabLabel, currentTab === 'register' && styles.tabLabelActive]}>Register</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.tabItem, currentTab === 'patients' && styles.tabItemActive]}
          onPress={() => setCurrentTab('patients')}
        >
          <Text style={styles.tabIcon}>📋</Text>
          <Text style={[styles.tabLabel, currentTab === 'patients' && styles.tabLabelActive]}>Patients</Text>
        </TouchableOpacity>

        {user.role === 'doctor' && (
          <TouchableOpacity
            style={[styles.tabItem, currentTab === 'review' && styles.tabItemActive]}
            onPress={() => setCurrentTab('review')}
          >
            <Text style={styles.tabIcon}>🩺</Text>
            <Text style={[styles.tabLabel, currentTab === 'review' && styles.tabLabelActive]}>Review</Text>
          </TouchableOpacity>
        )}

        {user.role === 'doctor' && (
          <TouchableOpacity
            style={[styles.tabItem, currentTab === 'dashboard' && styles.tabItemActive]}
            onPress={() => setCurrentTab('dashboard')}
          >
            <Text style={styles.tabIcon}>📊</Text>
            <Text style={[styles.tabLabel, currentTab === 'dashboard' && styles.tabLabelActive]}>Dashboard</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoAndTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    fontSize: 32,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#dbeafe',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  userName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  userRoleBadge: {
    color: '#3b82f6',
    backgroundColor: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 9999,
    marginTop: 2,
  },
  logoutButton: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingVertical: 8,
    paddingBottom: 24, // extra padding for safe area
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 75,
  },
  tabItemActive: {
    backgroundColor: '#eff6ff',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabBarIconImg: {
    width: 20,
    height: 20,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#1e40af',
    fontWeight: '600',
  },
});
