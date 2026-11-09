const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');
const { registerSchema, loginSchema } = require('../src/validators/auth.validator');
const { createReportSchema } = require('../src/validators/report.validator');

describe('Auth & Validation Suite (Member 1)', () => {
  describe('Input Validation Schemas', () => {
    test('rejects registration with short password', () => {
      const result = registerSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        password: '123',
      });
      assert.equal(result.success, false);
      assert.match(result.error.errors[0].message, /at least 6 characters/i);
    });

    test('rejects registration with invalid email format', () => {
      const result = registerSchema.safeParse({
        name: 'Test User',
        email: 'not-an-email',
        password: 'password123',
      });
      assert.equal(result.success, false);
      assert.match(result.error.errors[0].message, /invalid email/i);
    });

    test('accepts valid registration data', () => {
      const result = registerSchema.safeParse({
        name: 'Valid User',
        email: 'valid@example.com',
        password: 'securepassword123',
        phone: '01711111111',
        area: 'Dhanmondi',
      });
      assert.equal(result.success, true);
    });

    test('rejects rescue report with invalid report_type enum', () => {
      const result = createReportSchema.safeParse({
        report_type: 'InvalidType',
        animal_type: 'Dog',
        location: 'Mirpur',
        description: 'Needs help urgently',
        contact_information: '01700000000',
      });
      assert.equal(result.success, false);
    });

    test('accepts valid rescue report input', () => {
      const result = createReportSchema.safeParse({
        report_type: 'Injured',
        animal_type: 'Cat',
        location: 'Road 27, Dhanmondi',
        description: 'Kitten stuck on tree with injured leg',
        contact_information: '01800000000',
        urgency: 'Critical',
      });
      assert.equal(result.success, true);
    });
  });

  describe('REST Endpoints Security & Health Checks', () => {
    test('GET /api/health responds with status ok', async () => {
      const res = await request(app).get('/api/health');
      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'ok');
      assert.ok(res.body.timestamp);
    });

    test('GET /api/auth/me returns null user when unauthenticated', async () => {
      const res = await request(app).get('/api/auth/me');
      assert.equal(res.status, 200);
      assert.equal(res.body.user, null);
    });

    test('GET /api/users/me returns 401 when unauthorized', async () => {
      const res = await request(app).get('/api/users/me');
      assert.equal(res.status, 401);
      assert.match(res.body.error, /Authentication required/i);
    });

    test('POST /api/reports returns 401 when unauthenticated', async () => {
      const res = await request(app)
        .post('/api/reports')
        .send({
          report_type: 'Injured',
          animal_type: 'Cat',
          location: 'Dhaka',
          description: 'Animal rescue description',
          contact_information: '01700000000',
        });
      assert.equal(res.status, 401);
    });

    test('POST /api/auth/register returns 400 for malformed payload', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
        });
      assert.equal(res.status, 400);
      assert.equal(res.body.error, 'Validation failed');
      assert.ok(Array.isArray(res.body.details));
    });
  });
});

