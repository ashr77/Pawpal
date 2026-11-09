const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../src/app');

describe('Image Upload Suite (Multer)', () => {
  const agent = request.agent(app);

  test('rejects unauthenticated image upload with 401', async () => {
    const res = await request(app)
      .post('/api/upload')
      .attach('image', Buffer.from('fake image data'), 'test.jpg');
    assert.equal(res.status, 401);
  });

  test('successfully uploads an image for an authenticated user', async () => {
    // 1. Log in
    const loginRes = await agent.post('/api/auth/login').send({
      email: 'demo@pawpal.com',
      password: 'Password123!',
    });
    assert.equal(loginRes.status, 200);

    // 2. Upload image buffer
    const testImageBuffer = Buffer.from('fake-png-content');
    const uploadRes = await agent
      .post('/api/upload')
      .attach('image', testImageBuffer, 'cat.png');

    assert.equal(uploadRes.status, 201);
    assert.ok(uploadRes.body.imageUrl);
    assert.match(uploadRes.body.imageUrl, /^\/uploads\/img-/);

    // Verify file actually exists on disk
    const filePath = path.join(__dirname, '../uploads', uploadRes.body.filename);
    assert.ok(fs.existsSync(filePath), 'Uploaded image must exist on disk');

    // Clean up test file
    fs.unlinkSync(filePath);
  });
});
