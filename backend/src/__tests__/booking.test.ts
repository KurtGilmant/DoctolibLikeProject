import request from 'supertest';
import app from '../index';
import prisma from '../utils/prisma';

describe('Booking API', () => {
  let proToken: string;
  let userToken: string;
  let garageId: number;
  let serviceId: number;
  let slotId: number;
  let bookingId: number;

  beforeAll(async () => {
    await prisma.booking.deleteMany();
    await prisma.slot.deleteMany();
    await prisma.service.deleteMany();
    await prisma.garage.deleteMany();
    await prisma.user.deleteMany();

    const proRes = await request(app).post('/api/auth/register').send({
      email: 'pro@test.com',
      password: 'password123',
      firstName: 'Pro',
      lastName: 'User',
      role: 'PROFESSIONAL'
    });
    proToken = proRes.body.token;

    const userRes = await request(app).post('/api/auth/register').send({
      email: 'user@test.com',
      password: 'password123',
      firstName: 'User',
      lastName: 'Test'
    });
    userToken = userRes.body.token;

    const garageRes = await request(app)
      .post('/api/garages')
      .set('Authorization', `Bearer ${proToken}`)
      .send({
        name: 'Test Garage',
        address: '123 Test St',
        city: 'Paris',
        postalCode: '75001',
        latitude: 48.8566,
        longitude: 2.3522,
        phone: '0123456789',
        email: 'garage@test.com'
      });
    garageId = garageRes.body.id;

    const serviceRes = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${proToken}`)
      .send({
        type: 'VIDANGE',
        name: 'Vidange complète',
        price: 80,
        duration: 60
      });
    serviceId = serviceRes.body.id;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const endTime = new Date(tomorrow);
    endTime.setHours(11, 0, 0, 0);

    const slotRes = await request(app)
      .post('/api/slots')
      .set('Authorization', `Bearer ${proToken}`)
      .send({
        startTime: tomorrow.toISOString(),
        endTime: endTime.toISOString()
      });
    slotId = slotRes.body.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/bookings', () => {
    it('should create a booking', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          garageId,
          serviceId,
          slotId,
          notes: 'Test booking'
        });

      expect(res.status).toBe(201);
      expect(res.body.notes).toBe('Test booking');
      bookingId = res.body.id;
    });

    it('should not book already booked slot', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          garageId,
          serviceId,
          slotId
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/bookings/my/upcoming', () => {
    it('should get user upcoming bookings', async () => {
      const res = await request(app)
        .get('/api/bookings/my/upcoming')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('bookings');
      expect(res.body).toHaveProperty('total');
    });
  });

  describe('GET /api/bookings/garage', () => {
    it('should get garage bookings', async () => {
      const res = await request(app)
        .get('/api/bookings/garage')
        .set('Authorization', `Bearer ${proToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('bookings');
    });
  });

  describe('PATCH /api/bookings/:id/cancel', () => {
    it('should cancel a booking', async () => {
      const res = await request(app)
        .patch(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
    });

    it('should not cancel already cancelled booking', async () => {
      const res = await request(app)
        .patch(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(400);
    });
  });
});
