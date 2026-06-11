
import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Appointment must be linked to a valid Patient record']
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Appointment must be linked to a valid Doctor record']
  },
  date: {
    type: Date,
    required: [true, 'Execution date and time is required']
  },
  symptoms: {
    type: String,
    required: [true, 'Symptom description is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  }
}, {
  timestamps: true
});

export const Appointment = mongoose.model('Appointment', appointmentSchema);