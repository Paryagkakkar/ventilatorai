import { useState } from 'react';
import axios from 'axios';
import { apiUrl } from '../config/api';

const conditions = ["ARDS", "COPD", "Asthma", "Trauma", "Medical Emergency"];

function PatientForm() {
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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(apiUrl('/api/patient'), form);

      const aiRes = await axios.post(apiUrl('/api/predict'), {
        age: parseInt(form.age),
        height: parseFloat(form.height),
        weight: parseFloat(form.weight),
        spo2: parseFloat(form.spo2),
        hr: parseFloat(form.hr),
        condition: form.condition
      });

      setRecommendation(aiRes.data);
      alert("✅ AI Generated Smart Recommendations!");
    } catch (error) {
      alert("Error: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', fontSize: '40px' }}>🫁 New Patient Registration</h1>

      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '50px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '20px' }}>
          <label>Age (years)</label>
          <input name="age" type="number" value={form.age} onChange={handleChange} required style={{ width: '100%', padding: '15px', marginTop: '8px', borderRadius: '12px' }} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Weight (kg)</label>
          <input name="weight" type="number" value={form.weight} onChange={handleChange} required style={{ width: '100%', padding: '15px', marginTop: '8px', borderRadius: '12px' }} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Height (cm)</label>
          <input name="height" type="number" value={form.height} onChange={handleChange} required style={{ width: '100%', padding: '15px', marginTop: '8px', borderRadius: '12px' }} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>SpO₂ (%)</label>
          <input name="spo2" type="number" value={form.spo2} onChange={handleChange} required style={{ width: '100%', padding: '15px', marginTop: '8px', borderRadius: '12px' }} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Heart Rate (/min)</label>
          <input name="hr" type="number" value={form.hr} onChange={handleChange} required style={{ width: '100%', padding: '15px', marginTop: '8px', borderRadius: '12px' }} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Gender</label>
          <select name="gender" value={form.gender} onChange={handleChange} style={{ width: '100%', padding: '15px', marginTop: '8px', borderRadius: '12px' }}>
            <option value="Unknown">Unknown</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div>
          <label>Condition</label>
          <select name="condition" value={form.condition} onChange={handleChange} style={{ width: '100%', padding: '15px', marginTop: '8px', borderRadius: '12px' }}>
            {conditions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', marginTop: '40px', padding: '20px', background: '#1e40af', color: 'white', borderRadius: '16px', fontSize: '20px' }}>
          {loading ? "AI Analyzing..." : "Get AI Smart Ventilator Settings"}
        </button>
      </form>

      {recommendation && (
        <div style={{ marginTop: '40px', padding: '30px', background: '#ecfdf5', borderRadius: '20px' }}>
          <h3>🤖 AI Intelligent Recommendations</h3>
          <p><strong>Respiratory Rate (RR):</strong> {recommendation.predicted_rr} /min</p>
          <p><strong>I:E Ratio:</strong> {recommendation.ie_ratio}</p>
          <p><strong>Predicted BPM:</strong> {recommendation.predicted_bpm} /min</p>
        </div>
      )}
    </div>
  );
}

export default PatientForm;