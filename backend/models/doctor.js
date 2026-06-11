
import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Doctor name is required'],
    trim: true
  },
  specialty: {
    type: String,
    required: [true, 'Medical specialty area is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Doctor email address is required'],
    unique: true,
    lowercase: true,
    trim: true
  }
}, {
  timestamps: true 
});

export const Doctor = mongoose.model('Doctor', doctorSchema);