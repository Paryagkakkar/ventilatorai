const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  age: { type: Number, required: true },
  gender: String,
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  spo2: Number,
  hr: Number,
  rr: Number,
  bp: String,
  condition: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Patient', patientSchema);