const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

console.log('VentAI backend starting...');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001/predict';

// Rules are loaded from local JSON so non-AI recommendation mode can run offline.
const rulesPath = path.join(__dirname, 'rules.json');
const rules = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));

// In-memory collections are fine for demo mode.
let patients = [];
let decisions = [];

function toNumber(value, fallback = null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizePatientPayload(payload = {}) {
  const normalized = {
    age: toNumber(payload.age),
    gender: payload.gender || 'Unknown',
    height: toNumber(payload.height, 170),
    weight: toNumber(payload.weight),
    spo2: toNumber(payload.spo2, 92),
    hr: toNumber(payload.hr, 90),
    bp: payload.bp || '120/80',
    condition: payload.condition || 'ARDS'
  };

  if (!Number.isFinite(normalized.age) || normalized.age < 0 || normalized.age > 120) {
    return { error: 'Invalid age. Expected 0-120.' };
  }
  if (!Number.isFinite(normalized.weight) || normalized.weight <= 0 || normalized.weight > 300) {
    return { error: 'Invalid weight. Expected > 0 and <= 300 kg.' };
  }
  if (!Number.isFinite(normalized.height) || normalized.height < 80 || normalized.height > 250) {
    return { error: 'Invalid height. Expected 80-250 cm.' };
  }

  return { data: normalized };
}

function computeRuleRecommendation(condition, weight) {
  const rule = rules[condition];
  if (!rule) return null;

  const safeWeight = Math.max(20, Math.min(300, Number(weight)));
  const vt = Math.round(rule.vt_per_kg * safeWeight);

  return {
    mode: rule.mode,
    vt,
    rr: rule.rr,
    peep: rule.peep,
    fio2: rule.fio2
  };
}

app.post('/api/patient', (req, res) => {
  const { data, error } = normalizePatientPayload(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const patient = {
    _id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    ...data,
    timestamp: new Date().toISOString()
  };
  patients.unshift(patient);
  res.status(201).json(patient);
});

app.get('/api/patients', (_req, res) => {
  res.json(patients);
});

app.post('/api/recommendation', (req, res) => {
  const condition = req.body?.condition;
  const weight = toNumber(req.body?.weight);

  if (!condition || !Number.isFinite(weight)) {
    return res.status(400).json({ error: 'condition and numeric weight are required.' });
  }

  const recommendation = computeRuleRecommendation(condition, weight);
  if (!recommendation) {
    return res.status(400).json({ error: `Unknown condition: ${condition}` });
  }

  res.json(recommendation);
});

app.post('/api/decision', (req, res) => {
  const payload = req.body || {};
  if (!payload.patientId || !payload.aiRecommendation || !payload.doctorDecision) {
    return res.status(400).json({
      error: 'patientId, aiRecommendation, and doctorDecision are required.'
    });
  }

  const decision = {
    _id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    ...payload,
    timestamp: new Date().toISOString()
  };

  decisions.unshift(decision);
  res.status(201).json({ success: true, message: 'Decision saved', decision });
});

app.get('/api/decisions', (_req, res) => {
  res.json(decisions);
});

app.post('/api/predict', async (req, res) => {
  const payload = req.body || {};

  try {
    const response = await axios.post(AI_SERVICE_URL, payload, {
      timeout: 5000
    });
    return res.json(response.data);
  } catch (error) {
    const fallback = computeRuleRecommendation(
      payload.condition || 'ARDS',
      toNumber(payload.weight, 70)
    ) || { mode: 'VCV', vt: 420, rr: 18, peep: 10, fio2: 60 };

    return res.status(200).json({
      predicted_rr: fallback.rr,
      predicted_bpm: toNumber(payload.hr, 90),
      ie_ratio: fallback.rr > 20 ? '1:3' : '1:2',
      source: 'fallback-rule-engine',
      message: 'AI service unavailable. Returned rules-based recommendation.'
    });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'OK',
    aiServiceUrl: AI_SERVICE_URL,
    patients: patients.length,
    decisions: decisions.length
  });
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled backend error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});