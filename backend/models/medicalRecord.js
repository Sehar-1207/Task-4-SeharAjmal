
import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Record must be linked to a specific patient']
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Record must be linked to the treating physician']
  },
  diagnosis: {
    type: String,
    required: [true, 'Clinical diagnosis statement is required'],
    trim: true
  },
  prescription: [{
    medication: { type: String, required: true },
    dosage: { type: String, required: true },   
    frequency: { type: String, required: true } 
  }],
  vitals: {
    bloodPressure: { type: String }, 
    heartRate: { type: Number },     
    temperature: { type: Number }    
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

export const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);