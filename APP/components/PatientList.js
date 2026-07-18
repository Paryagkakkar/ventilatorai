import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl
} from 'react-native';
import axios from 'axios';
import { apiUrl } from '../config';

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchPatients = async () => {
    try {
      const res = await axios.get(apiUrl('/api/patients'));
      // Sort patients by newest first
      const sorted = res.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setPatients(sorted);
      filterList(sorted, search);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPatients();
  };

  const filterList = (list, query) => {
    if (!query) {
      setFilteredPatients(list);
      return;
    }
    const lowerQuery = query.toLowerCase();
    const filtered = list.filter(p => 
      p.condition.toLowerCase().includes(lowerQuery) || 
      p.gender.toLowerCase().includes(lowerQuery) ||
      p.age.toString().includes(lowerQuery)
    );
    setFilteredPatients(filtered);
  };

  const handleSearchChange = (text) => {
    setSearch(text);
    filterList(patients, text);
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Unknown Date';
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderPatientCard = ({ item }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{item.condition}</Text>
          </View>
          <Text style={styles.dateText}>{formatDate(item.timestamp)}</Text>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Patient Details</Text>
            <Text style={styles.infoValue}>{item.age} years • {item.gender}</Text>
            <Text style={styles.subInfo}>{item.height} cm • {item.weight} kg</Text>
          </View>
          
          <View style={styles.vitalsCol}>
            <Text style={styles.infoLabel}>Current Vitals</Text>
            <Text style={styles.vitalsText}>
              SpO₂: <Text style={styles.vitalsHighlight}>{item.spo2}%</Text>
            </Text>
            <Text style={styles.vitalsText}>
              HR: <Text style={styles.vitalsHighlight}>{item.hr} bpm</Text>
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search by condition, age, or gender..."
          value={search}
          onChangeText={handleSearchChange}
        />
        <TouchableOpacity style={styles.refreshButton} onPress={fetchPatients}>
          <Text style={styles.refreshButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Info Header */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Patient Directory</Text>
        <Text style={styles.listSubtitle}>Total Records: {filteredPatients.length}</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Fetching patient logs...</Text>
        </View>
      ) : filteredPatients.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>📭 No matching patient records found.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Refresh Directory</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredPatients}
          keyExtractor={(item) => item._id || item.timestamp}
          renderItem={renderPatientCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#3b82f6"]}
            />
          }
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  refreshButton: {
    width: 44,
    height: 44,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  refreshButtonText: {
    fontSize: 16,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  listSubtitle: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 10,
    marginBottom: 10,
  },
  badgeContainer: {
    backgroundColor: '#dbeafe',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 9999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  dateText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoCol: {
    flex: 1,
  },
  vitalsCol: {
    width: 120,
    alignItems: 'flex-end',
  },
  infoLabel: {
    fontSize: 11,
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  subInfo: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  vitalsText: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  vitalsHighlight: {
    fontWeight: 'bold',
    color: '#0f172a',
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
  emptyText: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
