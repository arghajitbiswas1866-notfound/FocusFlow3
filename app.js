require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const analyticsRoutes = require('./routes/analytics');
const playgroundRoutes = require('./routes/playground');

const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => {
  console.error('❌ MongoDB connection failed:', err);
  process.exit(1);
});

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/playground', playgroundRoutes);
app.get('/api/health', (req, res) => res.json({ healthy: true }));

// Serve static site (existing front-end files) from project root
app.use(express.static(path.join(__dirname)));

module.exports = app;
