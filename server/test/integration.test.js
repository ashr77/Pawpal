const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');

describe('Database Integration & End-to-End Test (Milestone Zero)', () => {
  const agent = request.agent(app); // preserves session cookie

  test('successfully retrieves seeded rescue reports from PostgreSQL', async () => {
    const res = await agent.get('/api/reports');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.reports));
    assert.ok(res.body.reports.length >= 2, 'Should have at least 2 seeded reports');
    assert.equal(res.body.reports[0].report_type !== undefined, true);
  });

  test('authenticates demo user and persists session', async () => {
    const res = await agent.post('/api/auth/login').send({
      email: 'demo@pawpal.com',
      password: 'Password123!',
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.user.email, 'demo@pawpal.com');

    // Verify session persistence
    const meRes = await agent.get('/api/auth/me');
    assert.equal(meRes.status, 200);
    assert.equal(meRes.body.user.email, 'demo@pawpal.com');
  });

  test('creates a new rescue report as authenticated user', async () => {
    const newReport = {
      report_type: 'Stray',
      animal_type: 'Dog',
      location: 'Gulshan 2 Circle, Dhaka',
      description: 'Found a stray puppy shivering near the supermarket.',
      animal_condition: 'Cold, no visible injuries',
      contact_information: '01700000001',
      urgency: 'Normal',
    };

    const res = await agent.post('/api/reports').send(newReport);
    assert.equal(res.status, 201);
    assert.equal(res.body.report.animal_type, 'Dog');
    assert.equal(res.body.report.location, 'Gulshan 2 Circle, Dhaka');
    assert.ok(res.body.report.id);
  });

  test('retrieves updated reports list containing new report', async () => {
    const res = await agent.get('/api/reports');
    assert.equal(res.status, 200);
    const created = res.body.reports.find(r => r.location === 'Gulshan 2 Circle, Dhaka');
    assert.ok(created, 'Newly created report should be in reports list');
  });

  test('logs out successfully and destroys session', async () => {
    const res = await agent.post('/api/auth/logout');
    assert.equal(res.status, 200);

    const meRes = await agent.get('/api/auth/me');
    assert.equal(meRes.status, 200);
    assert.equal(meRes.body.user, null);
  });
});

