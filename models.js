const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'professor'], required: true },
});

// Availability Schema
const availabilitySchema = new mongoose.Schema({
    professor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    time_slot: { type: Date, required: true },
    is_available: { type: Boolean, default: true },
});

// Appointment Schema
const appointmentSchema = new mongoose.Schema({
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    professor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    time_slot: { type: Date, required: true },
    status: { type: String, enum: ['booked', 'cancelled'], default: 'booked' },
});

// Models
const User = mongoose.model('User', userSchema);
const Availability = mongoose.model('Availability', availabilitySchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = { User, Availability, Appointment };
