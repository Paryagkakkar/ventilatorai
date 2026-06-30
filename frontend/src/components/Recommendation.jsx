import { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl } from '../config/api';

function Recommendation() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [doctorDecision, setDoctorDecision] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await axios.get(apiUrl('/api/patients'));
      setPatients(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const getRecommendation = async (patient) => {
    setSelectedPatient(patient);
    try {
      const res = await axios.post(apiUrl('/api/recommendation'), {
        condition: patient.condition,
        weight: patient.weight,
        height: patient.height
      });
      setRecommendation(res.data);
      setDoctorDecision({ ...res.data });
    } catch (error) {
      alert("Error getting recommendation");
    }
  };

  const handleDoctorChange = (field, value) => {
    setDoctorDecision(prev => ({ ...prev, [field]: parseInt(value) || value }));
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
      
      alert("✅ Doctor Decision Saved Successfully!");
      setSelectedPatient(null);
      setRecommendation(null);
      fetchPatients();
    } catch (error) {
      alert("❌ Error saving decision");
    }
    setSaving(false);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '42px', fontWeight: '700', marginBottom: '8px' }}>Doctor Review System</h1>
      <p style={{ color: '#64748b', fontSize: '19px', marginBottom: '40px' }}>
        Review AI recommendations and provide final clinical approval
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Left: Patient List */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '30px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '26px', marginBottom: '20px' }}>Recent Patients</h3>
          <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {patients.map((patient) => (
              <div
                key={patient._id}
                onClick={() => getRecommendation(patient)}
                style={{
                  padding: '20px',
                  marginBottom: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <strong>{patient.condition}</strong> — Age {patient.age} • {patient.gender}
                <div style={{ marginTop: '8px', color: '#64748b' }}>
                  SpO₂: {patient.spo2}% | RR: {patient.rr}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Review Panel */}
        {selectedPatient && recommendation ? (
          <div style={{ background: 'white', borderRadius: '24px', padding: '30px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '26px', marginBottom: '20px' }}>Clinical Review</h3>
            <p><strong>Patient:</strong> {selectedPatient.condition} • Age {selectedPatient.age}</p>

            <div style={{ margin: '25px 0', padding: '20px', background: '#eff6ff', borderRadius: '16px' }}>
              <h4 style={{ color: '#1e40af' }}>🤖 AI Recommendation</h4>
              <p>Mode: <strong>{recommendation.mode}</strong></p>
              <p>VT: <strong>{recommendation.vt} ml</strong></p>
              <p>RR: <strong>{recommendation.rr}</strong></p>
              <p>PEEP: <strong>{recommendation.peep}</strong></p>
              <p>FiO₂: <strong>{recommendation.fio2}%</strong></p>
            </div>

            <h4 style={{ marginBottom: '15px' }}>Doctor Override</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {['mode', 'vt', 'rr', 'peep', 'fio2'].map(field => (
                <div key={field}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                    {field.toUpperCase()}
                  </label>
                  <input
                    type={field === 'mode' ? 'text' : 'number'}
                    value={doctorDecision[field] || ''}
                    onChange={(e) => handleDoctorChange(field, e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              ))}
            </div>

            <div style={{ marginTop: '40px', display: 'flex', gap: '15px' }}>
              <button onClick={saveDoctorDecision} disabled={saving} style={{
                flex: 1, padding: '18px', background: '#10b981', color: 'white', border: 'none', borderRadius: '16px', fontSize: '18px'
              }}>
                {saving ? "Saving..." : "✅ Save Doctor Decision"}
              </button>
              <button onClick={() => setSelectedPatient(null)} style={{
                flex: 1, padding: '18px', background: '#64748b', color: 'white', border: 'none', borderRadius: '16px', fontSize: '18px'
              }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '24px', padding: '80px 40px', textAlign: 'center', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
            <h3>Select a patient from the left to begin review</h3>
          </div>
        )}
      </div>
    </div>
  );
}

export default Recommendation;