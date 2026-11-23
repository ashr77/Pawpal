const { test, describe, before } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');

describe('Phase 2: Advanced Rescue Management & Volunteer Coordination Suite', () => {
  const reporterAgent = request.agent(app);
  const volunteerAgent = request.agent(app);
  let createdReportId;
  let createdOfferId;

  before(async () => {
    // 1. Log in Demo User (acts as reporter)
    await reporterAgent.post('/api/auth/login').send({
      email: 'demo@pawpal.com',
      password: 'Password123!',
    });

    // 2. Log in Admin User (acts as volunteer in tests)
    await volunteerAgent.post('/api/auth/login').send({
      email: 'admin@pawpal.com',
      password: 'Admin123!',
    });

    // 3. Create a fresh test rescue report
    const res = await reporterAgent.post('/api/reports').send({
      report_type: 'Injured',
      animal_type: 'Dog',
      location: 'Banani 11, Dhaka',
      description: 'Golden retriever found near park with injured paw.',
      animal_condition: 'Limping and nervous',
      contact_information: '01700000001',
      urgency: 'Critical',
    });
    assert.equal(res.status, 201);
    createdReportId = res.body.report.id;
  });

  describe('1. Search, Multi-Criteria Filtering & Emergency Priority Sorting', () => {
    test('filters reports by urgency (Critical)', async () => {
      const res = await request(app).get('/api/reports?urgency=Critical');
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.reports));
      assert.ok(res.body.reports.length >= 1);
      assert.ok(res.body.reports.every(r => r.urgency === 'Critical'));
    });

    test('filters reports by keyword search in location or description', async () => {
      const res = await request(app).get('/api/reports?search=retriever');
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.reports));
      assert.ok(res.body.reports.some(r => r.id === createdReportId));
    });

    test('filters reports by area query', async () => {
      const res = await request(app).get('/api/reports?area=Banani');
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.reports));
      assert.ok(res.body.reports.some(r => r.id === createdReportId));
    });

    test('sorts reports with Critical cases appearing before Urgent and Normal', async () => {
      const res = await request(app).get('/api/reports?sort=emergency');
      assert.equal(res.status, 200);
      const reports = res.body.reports;
      assert.ok(reports.length >= 2);

      // Verify urgency ordering
      const urgencyRank = { Critical: 1, Urgent: 2, Normal: 3 };
      for (let i = 0; i < reports.length - 1; i++) {
        const currRank = urgencyRank[reports[i].urgency] || 4;
        const nextRank = urgencyRank[reports[i + 1].urgency] || 4;
        assert.ok(currRank <= nextRank, `Report ${i} (${reports[i].urgency}) should be <= Report ${i+1} (${reports[i+1].urgency})`);
      }
    });
  });

  describe('2. Report Editing & Ownership Controls', () => {
    test('rejects unauthenticated report update with 401', async () => {
      const res = await request(app)
        .patch(`/api/reports/${createdReportId}`)
        .send({ location: 'Updated location' });
      assert.equal(res.status, 401);
    });

    test('allows report creator to update report details', async () => {
      const res = await reporterAgent
        .patch(`/api/reports/${createdReportId}`)
        .send({
          location: 'Banani Block C, Road 11, Dhaka',
          animal_condition: 'Stabilized by bystander',
        });
      assert.equal(res.status, 200);
      assert.equal(res.body.report.location, 'Banani Block C, Road 11, Dhaka');
      assert.equal(res.body.report.animal_condition, 'Stabilized by bystander');
    });
  });

  describe('3. Rescue Status Updates & Automated Timeline Logging', () => {
    test('rejects unauthenticated status update with 401', async () => {
      const res = await request(app)
        .patch(`/api/reports/${createdReportId}/status`)
        .send({ status: 'In Progress' });
      assert.equal(res.status, 401);
    });

    test('allows report owner to update status to In Progress', async () => {
      const res = await reporterAgent
        .patch(`/api/reports/${createdReportId}/status`)
        .send({ status: 'In Progress' });
      assert.equal(res.status, 200);
      assert.equal(res.body.report.status, 'In Progress');
    });

    test('verifies an automatic status change timeline event was inserted', async () => {
      const res = await request(app).get(`/api/reports/${createdReportId}/updates`);
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.updates));
      const statusUpdate = res.body.updates.find(u => u.event_type === 'Status Change');
      assert.ok(statusUpdate, 'A Status Change timeline event should exist');
      assert.match(statusUpdate.description, /transitioned from Active to In Progress/i);
    });
  });

  describe('4. Rescue Progress Timeline APIs', () => {
    test('allows report owner to add a new progress milestone', async () => {
      const res = await reporterAgent
        .post(`/api/reports/${createdReportId}/updates`)
        .send({
          event_type: 'Taken to Veterinarian',
          description: 'Animal transported to Central Vet Hospital for X-ray examination.',
        });
      assert.equal(res.status, 201);
      assert.equal(res.body.update.event_type, 'Taken to Veterinarian');
      assert.equal(res.body.update.author_name, 'Demo User');
    });

    test('retrieves chronological timeline updates', async () => {
      const res = await request(app).get(`/api/reports/${createdReportId}/updates`);
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.updates));
      assert.ok(res.body.updates.length >= 3); // Initial 'Reported', 'Status Change', and 'Taken to Veterinarian'
      assert.equal(res.body.updates[0].event_type, 'Reported');
    });
  });

  describe('5. Volunteer Assistance Coordination APIs', () => {
    test('rejects volunteer offer from the report creator on their own report', async () => {
      const res = await reporterAgent
        .post(`/api/reports/${createdReportId}/offers`)
        .send({
          help_type: 'Transportation',
          message: 'Trying to volunteer on my own report',
        });
      assert.equal(res.status, 400);
      assert.match(res.body.error, /cannot submit an assistance offer for your own report/i);
    });

    test('allows another authenticated user to submit an assistance offer', async () => {
      const res = await volunteerAgent
        .post(`/api/reports/${createdReportId}/offers`)
        .send({
          help_type: 'Transportation',
          message: 'I have a car available immediately to assist with transport.',
        });
      assert.equal(res.status, 201);
      assert.equal(res.body.offer.help_type, 'Transportation');
      assert.equal(res.body.offer.status, 'Pending');
      createdOfferId = res.body.offer.id;
    });

    test('enforces volunteer contact privacy (non-owner cannot view offers)', async () => {
      // Unauthenticated request
      const unauthRes = await request(app).get(`/api/reports/${createdReportId}/offers`);
      assert.equal(unauthRes.status, 401);
    });

    test('allows report owner to retrieve incoming offers with contact details', async () => {
      const res = await reporterAgent.get(`/api/reports/${createdReportId}/offers`);
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.offers));
      const offer = res.body.offers.find(o => o.id === createdOfferId);
      assert.ok(offer, 'Created offer should be present in incoming offers list');
      assert.equal(offer.help_type, 'Transportation');
      assert.ok(offer.volunteer_name);
      assert.ok(offer.volunteer_email);
    });

    test('allows report owner to accept an incoming assistance offer', async () => {
      const res = await reporterAgent
        .patch(`/api/reports/${createdReportId}/offers/${createdOfferId}/status`)
        .send({ status: 'Accepted' });
      assert.equal(res.status, 200);
      assert.equal(res.body.offer.status, 'Accepted');
    });

    test('blocks new assistance offers when the case is Resolved', async () => {
      // 1. Transition report to Resolved
      await reporterAgent
        .patch(`/api/reports/${createdReportId}/status`)
        .send({ status: 'Resolved' });

      // 2. Attempt to offer help on Resolved report
      const res = await volunteerAgent
        .post(`/api/reports/${createdReportId}/offers`)
        .send({
          help_type: 'Temporary Shelter',
          message: 'Offering shelter after resolution',
        });
      assert.equal(res.status, 400);
      assert.match(res.body.error, /resolved rescue cases/i);
    });
  });

  describe('6. User-Scoped Dashboard Endpoints', () => {
    test('GET /api/users/me/reports returns current user reports with offer counts', async () => {
      const res = await reporterAgent.get('/api/users/me/reports');
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.reports));
      const myReport = res.body.reports.find(r => r.id === createdReportId);
      assert.ok(myReport, 'Created report must be returned in user reports');
      assert.ok(parseInt(myReport.offers_count, 10) >= 1);
    });

    test('GET /api/users/me/offers returns current volunteer offers with report metadata', async () => {
      const res = await volunteerAgent.get('/api/users/me/offers');
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.offers));
      const myOffer = res.body.offers.find(o => o.id === createdOfferId);
      assert.ok(myOffer, 'Created volunteer offer must be in volunteer offers list');
      assert.equal(myOffer.help_type, 'Transportation');
      assert.equal(myOffer.offer_status, 'Accepted');
      assert.ok(myOffer.reporter_name);
    });
  });
});
