const mongoose = require('mongoose');

const decisionSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  aiRecommendation: {
    mode: String,
    vt: Number,
    rr: Number,
    peep: Number,
    fio2: Number
  },
  doctorDecision: {
    mode: String,
    vt: Number,
    rr: Number,
    peep: Number,
    fio2: Number
  },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Decision', decisionSchema);