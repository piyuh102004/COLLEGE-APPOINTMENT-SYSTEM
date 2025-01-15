const express = require('express');
const { User, Availability, Appointment } = require('./models');
const Joi = require('joi'); // Import Joi for validation
const router = express.Router();

// Validation schemas
const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

const availabilitySchema = Joi.object({
    professor_id: Joi.string().required(),
    time_slot: Joi.date().required(),
});

const appointmentSchema = Joi.object({
    student_id: Joi.string().required(),
    professor_id: Joi.string().required(),
    time_slot: Joi.date().required(),
});

// Student Login
router.post('/auth/student/login', async (req, res) => {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, password } = req.body;
    const student = await User.findOne({ email, password, role: 'student' });
    if (!student) return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ message: 'Student logged in successfully', student });
});

// Professor Login
router.post('/auth/professor/login', async (req, res) => {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, password } = req.body;
    const professor = await User.findOne({ email, password, role: 'professor' });
    if (!professor) return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ message: 'Professor logged in successfully', professor });
});

// Professor Specifies Availability
router.post('/professor/availability', async (req, res) => {
    const { error } = availabilitySchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { professor_id, time_slot } = req.body;
    const availability = new Availability({ professor_id, time_slot });
    await availability.save();
    res.json({ message: 'Availability added successfully', availability });
});

// View Available Slots for Professor
router.get('/professor/:id/availability', async (req, res) => {
    const { id } = req.params;
    const availability = await Availability.find({ professor_id: id, is_available: true });
    res.json({ availability });
});

// Book Appointment
router.post('/appointment/book', async (req, res) => {
    const { error } = appointmentSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { student_id, professor_id, time_slot } = req.body;
    const appointment = new Appointment({ student_id, professor_id, time_slot });
    await appointment.save();
    await Availability.updateOne({ professor_id, time_slot }, { is_available: false });
    res.json({ message: 'Appointment booked successfully', appointment });
});

// Cancel Appointment
router.delete('/appointment/:id/cancel', async (req, res) => {
    const { id } = req.params;
    const appointment = await Appointment.findByIdAndUpdate(id, { status: 'cancelled' });
    await Availability.updateOne({ professor_id: appointment.professor_id, time_slot: appointment.time_slot }, { is_available: true });
    res.json({ message: 'Appointment cancelled successfully' });
});

// Check Student Appointments
router.get('/student/:id/appointments', async (req, res) => {
    const { id } = req.params;
    const appointments = await Appointment.find({ student_id: id, status: 'booked' });
    res.json({ appointments });
});

module.exports = router;
