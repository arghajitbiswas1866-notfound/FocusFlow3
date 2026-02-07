(async () => {
  require('dotenv').config();
  const mongoose = require('mongoose');
  const request = require('supertest');
  const app = require('./app');

  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/focusflow', { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected for playground tests');

    // create test user
    const email = `play-${Date.now()}@example.com`;
    const signup = await request(app).post('/api/auth/signup').send({ name: 'PlayTest', email, password: 'pass123' });
    console.log('signup status', signup.status);
    const token = signup.body.token;

    // create playground item
    const create = await request(app).post('/api/playground').set('Authorization', 'Bearer ' + token).send({ name: 'test1', data: { x: 1, subjectTimes: { Math: 120 } } });
    console.log('create status', create.status, create.body._id);

    // get list
    const list = await request(app).get('/api/playground').set('Authorization', 'Bearer ' + token);
    console.log('list status', list.status, (list.body.items || []).length);

    // delete
    const id = create.body._id;
    const del = await request(app).delete('/api/playground/' + id).set('Authorization', 'Bearer ' + token);
    console.log('delete status', del.status);

    console.log('Playground tests completed ✅');
    process.exit(0);
  } catch (err) {
    console.error('Playground test error', err);
    process.exit(1);
  } finally {
    mongoose.disconnect().catch(()=>{});
  }
})();