import request from 'supertest';
import app from '../index';
import prisma from '../utils/prisma';

describe('Garage API', () => {
  let proToken: string;
  let userToken: string;
  let garageId: number;

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
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/garages', () => {
    it('should create a garage as professional', async () => {
      const res = await request(app)
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

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Test Garage');
      garageId = res.body.id;
    });

    it('should not create garage as regular user', async () => {
      const res = await request(app)
        .post('/api/garages')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Test Garage 2',
          address: '456 Test St',
          city: 'Lyon',
          postalCode: '69001',
          latitude: 45.7640,
          longitude: 4.8357,
          phone: '0123456789',
          email: 'garage2@test.com'
        });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/garages', () => {
    it('should get all garages with pagination', async () => {
      const res = await request(app).get('/api/garages?page=1');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('garages');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('totalPages');
      expect(Array.isArray(res.body.garages)).toBe(true);
    });

    it('should filter garages by city', async () => {
      const res = await request(app).get('/api/garages?city=Paris');

      expect(res.status).toBe(200);
      expect(res.body.garages.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/garages/:id', () => {
    it('should get garage by id', async () => {
      const res = await request(app).get(`/api/garages/${garageId}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(garageId);
    });

    it('should return 404 for non-existent garage', async () => {
      const res = await request(app).get('/api/garages/99999');

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/garages/my', () => {
    it('should get professional own garage', async () => {
      const res = await request(app)
        .get('/api/garages/my')
        .set('Authorization', `Bearer ${proToken}`);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Test Garage');
    });
  });

  describe('GET /api/garages/stats', () => {
    it('should get garage statistics', async () => {
      const res = await request(app)
        .get('/api/garages/stats')
        .set('Authorization', `Bearer ${proToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('totalBookings');
      expect(res.body).toHaveProperty('completedBookings');
      expect(res.body).toHaveProperty('totalRevenue');
    });
  });
});
