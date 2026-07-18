import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import axios from 'axios';
import { apiUrl } from '../config';

export default function Recommendation() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [doctorDecision, setDoctorDecision] = useState({});
  const [loadingList, setLoadingList] = useState(true);
  const [loadingRec, setLoadingRec] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchPatients = async () => {
    try {
      const res = await axios.get(apiUrl('/api/patients'));
      // Sort to show newest patients first
      const sorted = res.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setPatients(sorted);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not fetch patients for review.");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const getRecommendation = async (patient) => {
    setSelectedPatient(patient);
    setLoadingRec(true);
    try {
      const res = await axios.post(apiUrl('/api/recommendation'), {
        condition: patient.condition,
        weight: patient.weight,
        height: patient.height
      });
      setRecommendation(res.data);
      setDoctorDecision({ ...res.data });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Error getting ventilator recommendation for this patient.");
      setSelectedPatient(null);
    } finally {
      setLoadingRec(false);
    }
  };

  const handleDoctorChange = (field, value) => {
    // Convert numeric fields properly
    let parsedValue = value;
    if (field !== 'mode' && value !== '') {
      parsedValue = parseInt(value) || 0;
    }
    setDoctorDecision(prev => ({ ...prev, [field]: parsedValue }));
  };

  const saveDoctorDecision = async () => {
    setSaving(true);
    try {
      await axios.post(apiUrl('/api/decision'), {
        patientId: selectedPatient._id,
        aiRecommendation: recommendation,
        doctorDecision: doctorDecision,
        age: selectedPatient.age,
        condition: selectedPatient.condition,
        spo2: selectedPatient.spo2
      });
      
      Alert.alert("Success ✅", "Doctor Decision Saved Successfully!");
      setSelectedPatient(null);
      setRecommendation(null);
      fetchPatients();
    } catch (error) {
      console.error(error);
      Alert.alert("Error ❌", "Error saving decision");
    } finally {
      setSaving(false);
    }
  };

  // Render recent patient item in list view
  const renderPatientItem = ({ item }) => (
    <TouchableOpacity style={styles.patientItem} onPress={() => getRecommendation(item)}>
      <View style={styles.patientMain}>
        <Text style={styles.patientCondition}>{item.condition}</Text>
        <Text style={styles.patientMeta}>Age {item.age} • {item.gender}</Text>
        <Text style={styles.patientSub}>SpO₂: {item.spo2}% | HR: {item.hr} bpm | RR: {item.rr || 'N/A'}</Text>
      </View>
      <Text style={styles.chevron}>➡️</Text>
    </TouchableOpacity>
  );

  // If a patient is selected, display the detailed clinical review interface
  if (selectedPatient) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => { setSelectedPatient(null); setRecommendation(null); }}>
            <Text style={styles.backButtonText}>⬅️ Back to Patient Selection</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Clinical Review</Text>
          <Text style={styles.subtitle}>
            Review AI recommendation and customize settings before submitting final clinical approval.
          </Text>

          {/* Vitals Summary */}
          <View style={styles.patientSummaryCard}>
            <Text style={styles.summaryTitle}>Selected Patient Vitals</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>Condition</Text>
                <Text style={styles.summaryVal}>{selectedPatient.condition}</Text>
              </View>
              <View style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>Demographics</Text>
                <Text style={styles.summaryVal}>{selectedPatient.age}y • {selectedPatient.gender}</Text>
              </View>
              <View style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>SpO₂</Text>
                <Text style={[styles.summaryVal, { color: selectedPatient.spo2 < 90 ? '#ef4444' : '#10b981' }]}>
                  {selectedPatient.spo2}%
                </Text>
              </View>
            </View>
          </View>

          {loadingRec ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.loaderText}>Analyzing and fetching recommendation...</Text>
            </View>
          ) : (
            recommendation && (
              <>
                {/* AI recommendation Card */}
                <View style={styles.aiCard}>
                  <View style={styles.aiCardHeader}>
                    <Text style={styles.aiCardIcon}>🤖</Text>
                    <Text style={styles.aiCardTitle}>AI Recommended Settings</Text>
                  </View>
                  
                  <View style={styles.aiGrid}>
                    <View style={styles.aiCol}>
                      <Text style={styles.aiLabel}>Mode</Text>
                      <Text style={styles.aiVal}>{recommendation.mode}</Text>
                    </View>
                    <View style={styles.aiCol}>
                      <Text style={styles.aiLabel}>VT (Tidal Vol)</Text>
                      <Text style={styles.aiVal}>{recommendation.vt} ml</Text>
                    </View>
                    <View style={styles.aiCol}>
                      <Text style={styles.aiLabel}>PEEP</Text>
                      <Text style={styles.aiVal}>{recommendation.peep}</Text>
                    </View>
                  </View>

                  <View style={[styles.aiGrid, { marginTop: 12 }]}>
                    <View style={styles.aiCol}>
                      <Text style={styles.aiLabel}>Resp Rate (RR)</Text>
                      <Text style={styles.aiVal}>{recommendation.rr}</Text>
                    </View>
                    <View style={styles.aiCol}>
                      <Text style={styles.aiLabel}>FiO₂</Text>
                      <Text style={styles.aiVal}>{recommendation.fio2}%</Text>
                    </View>
                    <View style={styles.aiCol}></View>
                  </View>
                </View>

                {/* Doctor Override Inputs */}
                <View style={styles.doctorCard}>
                  <Text style={styles.doctorTitle}>Doctor Settings Overrides</Text>
                  
                  {/* Mode input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Ventilator Mode</Text>
                    <TextInput
                      style={styles.input}
                      value={doctorDecision.mode || ''}
                      onChangeText={(val) => handleDoctorChange('mode', val)}
                    />
                  </View>

                  {/* VT and PEEP (Row) */}
                  <View style={styles.row}>
                    <View style={[styles.inputGroup, { marginRight: 8 }]}>
                      <Text style={styles.label}>VT (Tidal Volume - ml)</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={doctorDecision.vt?.toString() || ''}
                        onChangeText={(val) => handleDoctorChange('vt', val)}
                      />
                    </View>
                    <View style={[styles.inputGroup, { marginLeft: 8 }]}>
                      <Text style={styles.label}>PEEP (cmH₂O)</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={doctorDecision.peep?.toString() || ''}
                        onChangeText={(val) => handleDoctorChange('peep', val)}
                      />
                    </View>
                  </View>

                  {/* RR and FiO2 (Row) */}
                  <View style={styles.row}>
                    <View style={[styles.inputGroup, { marginRight: 8 }]}>
                      <Text style={styles.label}>Respiratory Rate (RR)</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={doctorDecision.rr?.toString() || ''}
                        onChangeText={(val) => handleDoctorChange('rr', val)}
                      />
                    </View>
                    <View style={[styles.inputGroup, { marginLeft: 8 }]}>
                      <Text style={styles.label}>FiO₂ (%)</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={doctorDecision.fio2?.toString() || ''}
                        onChangeText={(val) => handleDoctorChange('fio2', val)}
                      />
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <TouchableOpacity
                    style={[styles.saveButton, saving && styles.buttonDisabled]}
                    onPress={saveDoctorDecision}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <Text style={styles.saveButtonText}>✅ Confirm & Save Settings</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => { setSelectedPatient(null); setRecommendation(null); }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            )
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // List View: Selection Screen
  return (
    <View style={styles.container}>
      <View style={styles.listHeader}>
        <Text style={styles.title}>Doctor Review System</Text>
        <Text style={styles.subtitle}>Select a patient from the list below to review and approve ventilator configurations.</Text>
      </View>

      {loadingList ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1e40af" />
          <Text style={styles.loadingText}>Fetching case queue...</Text>
        </View>
      ) : patients.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>📭 No patients registered yet.</Text>
          <TouchableOpacity style={styles.refreshBtn} onPress={fetchPatients}>
            <Text style={styles.refreshBtnText}>🔄 Refresh List</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={patients}
          keyExtractor={(item) => item._id || item.timestamp}
          renderItem={renderPatientItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={fetchPatients}
          refreshing={loadingList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  listHeader: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 18,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  patientItem: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  patientMain: {
    flex: 1,
  },
  patientCondition: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  patientMeta: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 3,
  },
  patientSub: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 5,
  },
  chevron: {
    fontSize: 16,
    marginLeft: 10,
  },
  backButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  patientSummaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryCol: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 2,
  },
  aiCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  aiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiCardIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  aiCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1d4ed8',
  },
  aiGrid: {
    flexDirection: 'row',
  },
  aiCol: {
    flex: 1,
  },
  aiLabel: {
    fontSize: 11,
    color: '#1e40af',
    textTransform: 'uppercase',
  },
  aiVal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginTop: 2,
  },
  doctorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  doctorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputGroup: {
    flex: 1,
    marginBottom: 15,
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
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  saveButton: {
    backgroundColor: '#10b981',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#6ee7b7',
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 5,
  },
  cancelButtonText: {
    color: '#64748b',
    fontWeight: '500',
    fontSize: 14,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#64748b',
  },
  loaderContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 13,
    color: '#64748b',
  },
  emptyText: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 15,
  },
  refreshBtn: {
    backgroundColor: '#1e40af',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  refreshBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
