import { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl } from '../config/api';

function PatientList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await axios.get(apiUrl('/api/patients'));
      setPatients(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '10px' }}>Patient Records</h1>
      <p style={{ color: '#64748b', marginBottom: '30px' }}>All registered patients • Total: {patients.length}</p>

      <button onClick={fetchPatients} style={{
        padding: '12px 24px',
        background: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        marginBottom: '30px',
        cursor: 'pointer'
      }}>
        🔄 Refresh
      </button>

      {loading ? (
        <p>Loading patients...</p>
      ) : patients.length === 0 ? (
        <p>No patients registered yet.</p>
      ) : (
        <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th style={{ padding: '20px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '20px', textAlign: 'left' }}>Patient</th>
                <th style={{ padding: '20px', textAlign: 'left' }}>Vitals</th>
                <th style={{ padding: '20px', textAlign: 'left' }}>Condition</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p._id} style={{ borderTop: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '20px' }}>{new Date(p.timestamp).toLocaleDateString()}</td>
                  <td style={{ padding: '20px' }}>
                    <strong>{p.age}y • {p.gender}</strong><br />
                    {p.height}cm • {p.weight}kg
                  </td>
                  <td style={{ padding: '20px' }}>
                    SpO₂: <strong>{p.spo2}%</strong> | HR: <strong>{p.hr}</strong> | RR: <strong>{p.rr}</strong>
                  </td>
                  <td style={{ padding: '20px' }}>
                    <span style={{ background: '#dbeafe', color: '#1e40af', padding: '6px 14px', borderRadius: '9999px', fontSize: '14px' }}>
                      {p.condition}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PatientList;