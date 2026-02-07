(async () => {
  // internal tests using supertest
  require('dotenv').config();
  const mongoose = require('mongoose');
  const request = require('supertest');
  const app = require('./app');

  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/focusflow', { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Test script connected to MongoDB');

    const email = `test-${Date.now()}@example.com`;
    console.log('Testing signup...');
    const signup = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'SuperTest', email, password: 'pass123' })
      .set('Accept', 'application/json');

    console.log('signup status', signup.status);
    console.log(signup.body);

    if (signup.status !== 200) {
      console.error('Signup failed');
      return process.exit(1);
    }

    const token = signup.body.token;
    console.log('Testing /api/user/me with token...');
    const me = await request(app).get('/api/user/me').set('Authorization', 'Bearer ' + token);
    console.log('me status', me.status);
    console.log(me.body);

    console.log('Testing analytics POST...');
    const an = await request(app).post('/api/analytics').set('Authorization', 'Bearer ' + token).send({ subjectTimes: { Math: 120 } });
    console.log('analytics post status', an.status);
    console.log(an.body);

    console.log('Testing analytics GET...');
    const an2 = await request(app).get('/api/analytics').set('Authorization', 'Bearer ' + token);
    console.log('analytics get status', an2.status);
    console.log('items:', (an2.body.items || []).length);

    console.log('All internal tests done successfully ✅');
    process.exit(0);
  } catch (err) {
    console.error('Internal test error', err);
    process.exit(1);
  } finally {
    mongoose.disconnect().catch(()=>{});
  }
})();
