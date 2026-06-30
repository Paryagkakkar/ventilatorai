const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema({
  age: Number,
  condition: String,
  spo2: Number,
  ai_peep: Number,
  doctor_peep: Number,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TrainingData', trainingSchema);