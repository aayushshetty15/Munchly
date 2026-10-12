require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const foodRoutes = require('./routes/food.routes');

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);

// Global Error Handler (e.g. Multer file limits)
app.use((err, req, res, next) => {
  if (err) {
    const status = err.status || 400;
    return res.status(status).json({
      message: err.message || 'An error occurred during request processing',
    });
  }
  next();
});

module.exports = app;