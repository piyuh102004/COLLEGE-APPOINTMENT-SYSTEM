const request = require('supertest');
const app = require('./app'); // Assuming app.js exports the Express app
const { User, Availability, Appointment } = require('./models');

describe('College Appointment System API', () => {
    let student, professor;

    beforeAll(async () => {
        // Create test users
        student = await User.create({ name: 'Student A1', email: 'studentA1@example.com', password: 'password', role: 'student' });
        professor = await User.create({ name: 'Professor P1', email: 'professorP1@example.com', password: 'password', role: 'professor' });
    });

    afterAll(async () => {
        await User.deleteMany({});
        await Appointment.deleteMany({});
        await Availability.deleteMany({});
    });

    test('Student A1 logs in', async () => {
        const response = await request(app).post('/api/auth/student/login').send({ email: 'studentA1@example.com', password: 'password' });
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Student logged in successfully');
    });

    test('Professor P1 logs in', async () => {
        const response = await request(app).post('/api/auth/professor/login').send({ email: 'professorP1@example.com', password: 'password' });
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Professor logged in successfully');
    });

    test('Professor P1 specifies availability', async () => {
        const response = await request(app).post('/api/professor/availability').send({ professor_id: professor._id, time_slot: new Date() });
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Availability added successfully');
    });

    test('Student A1 views available slots', async () => {
        const response = await request(app).get(`/api/professor/${professor._id}/availability`);
        expect(response.status).toBe(200);
        expect(response.body.availability).toBeDefined();
    });

    test('Student A1 books an appointment', async () => {
        const response = await request(app).post('/api/appointment/book').send({ student_id: student._id, professor_id: professor._id, time_slot: new Date() });
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Appointment booked successfully');
    });

    test('Professor P1 cancels the appointment', async () => {
        const appointment = await Appointment.findOne({ student_id: student._id });
        const response = await request(app).delete(`/api/appointment/${appointment._id}/cancel`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Appointment cancelled successfully');
    });

    test('Student A1 checks appointments', async () => {
        const response = await request(app).get(`/api/student/${student._id}/appointments`);
        expect(response.status).toBe(200);
        expect(response.body.appointments).toHaveLength(0);
    });
});
