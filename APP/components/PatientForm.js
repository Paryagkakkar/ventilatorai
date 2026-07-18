import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import axios from 'axios';
import { apiUrl } from '../config';

const conditions = ["ARDS", "COPD", "Asthma", "Trauma", "Medical Emergency"];
const genders = ["Male", "Female", "Unknown"];

export default function PatientForm() {
  const [form, setForm] = useState({
    age: '',
    gender: 'Unknown',
    height: '170',
    weight: '',
    spo2: '92',
    hr: '90',
    bp: '120/80',
    condition: 'ARDS'
  });
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);

  const handleInputChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.age || !form.weight || !form.height || !form.spo2 || !form.hr) {
      Alert.alert("Missing Information", "Please fill out all required vitals fields.");
      return;
    }

    setLoading(true);
    try {
      // 1. Register Patient
      await axios.post(apiUrl('/api/patient'), {
        ...form,
        age: parseInt(form.age),
        weight: parseFloat(form.weight),
        height: parseFloat(form.height),
        spo2: parseFloat(form.spo2),
        hr: parseFloat(form.hr)
      });

      // 2. Get prediction
      const aiRes = await axios.post(apiUrl('/api/predict'), {
        age: parseInt(form.age),
        height: parseFloat(form.height),
        weight: parseFloat(form.weight),
        spo2: parseFloat(form.spo2),
        hr: parseFloat(form.hr),
        condition: form.condition
      });

      setRecommendation(aiRes.data);
      Alert.alert("Success ✅", "AI Generated Smart Recommendations!");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.response?.data?.error || error.message || "Failed to submit patient data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardContainer}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Register New Patient</Text>
        <Text style={styles.subtitle}>Fill in demographics and current vitals to fetch AI recommendations</Text>

        <View style={styles.card}>
          {/* Age & Weight (Row) */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { marginRight: 10 }]}>
              <Text style={styles.label}>Age (years) *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 45"
                keyboardType="numeric"
                value={form.age}
                onChangeText={(val) => handleInputChange('age', val)}
              />
            </View>
            <View style={[styles.inputGroup, { marginLeft: 10 }]}>
              <Text style={styles.label}>Weight (kg) *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 70"
                keyboardType="numeric"
                value={form.weight}
                onChangeText={(val) => handleInputChange('weight', val)}
              />
            </View>
          </View>

          {/* Height & BP (Row) */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { marginRight: 10 }]}>
              <Text style={styles.label}>Height (cm) *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 175"
                keyboardType="numeric"
                value={form.height}
                onChangeText={(val) => handleInputChange('height', val)}
              />
            </View>
            <View style={[styles.inputGroup, { marginLeft: 10 }]}>
              <Text style={styles.label}>Blood Pressure</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 120/80"
                value={form.bp}
                onChangeText={(val) => handleInputChange('bp', val)}
              />
            </View>
          </View>

          {/* SpO2 & HR (Row) */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { marginRight: 10 }]}>
              <Text style={styles.label}>SpO₂ (%) *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 95"
                keyboardType="numeric"
                value={form.spo2}
                onChangeText={(val) => handleInputChange('spo2', val)}
              />
            </View>
            <View style={[styles.inputGroup, { marginLeft: 10 }]}>
              <Text style={styles.label}>Heart Rate (/min) *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 88"
                keyboardType="numeric"
                value={form.hr}
                onChangeText={(val) => handleInputChange('hr', val)}
              />
            </View>
          </View>

          {/* Gender Segmented Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderContainer}>
              {genders.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.genderButton, form.gender === g && styles.genderButtonActive]}
                  onPress={() => handleInputChange('gender', g)}
                >
                  <Text style={[styles.genderButtonText, form.gender === g && styles.genderButtonTextActive]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Condition Select (Toggles) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Primary Clinical Condition</Text>
            <View style={styles.conditionGrid}>
              {conditions.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.conditionChip, form.condition === c && styles.conditionChipActive]}
                  onPress={() => handleInputChange('condition', c)}
                >
                  <Text style={[styles.conditionChipText, form.condition === c && styles.conditionChipTextActive]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Generate AI Ventilator Recommendation</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* AI Recommendations Output Card */}
        {recommendation && (
          <View style={styles.recCard}>
            <View style={styles.recHeader}>
              <Text style={styles.recHeaderIcon}>🤖</Text>
              <Text style={styles.recHeaderTitle}>AI Intelligent Recommendation</Text>
            </View>
            
            <View style={styles.recRow}>
              <Text style={styles.recLabel}>Respiratory Rate (RR):</Text>
              <Text style={styles.recValue}>{recommendation.predicted_rr} /min</Text>
            </View>
            
            <View style={styles.recRow}>
              <Text style={styles.recLabel}>I:E Ratio:</Text>
              <Text style={styles.recValue}>{recommendation.ie_ratio || '1:2'}</Text>
            </View>

            <View style={styles.recRow}>
              <Text style={styles.recLabel}>Predicted BPM:</Text>
              <Text style={styles.recValue}>{recommendation.predicted_bpm} /min</Text>
            </View>
            
            <Text style={styles.recFooter}>
              Please review these predictions in the 'Review' tab to edit details and save settings.
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  inputGroup: {
    flex: 1,
    marginBottom: 15,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
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
  genderContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 4,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  genderButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  genderButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  genderButtonTextActive: {
    color: '#1e40af',
    fontWeight: '600',
  },
  conditionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  conditionChip: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    margin: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  conditionChipActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  conditionChipText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  conditionChipTextActive: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#1e40af',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recCard: {
    backgroundColor: '#ecfdf5',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  recHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  recHeaderIcon: {
    fontSize: 22,
    marginRight: 8,
  },
  recHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#065f46',
  },
  recRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#d1fae5',
  },
  recLabel: {
    fontSize: 14,
    color: '#047857',
    fontWeight: '500',
  },
  recValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#065f46',
  },
  recFooter: {
    fontSize: 12,
    color: '#065f46',
    fontStyle: 'italic',
    marginTop: 15,
    textAlign: 'center',
  },
});
