const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set to true if your using https
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Session:', req.session);
  console.log('User:', req.user);
  next();
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Passport config
require('./config/passport')(passport);

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));

// Auth status route
app.get('/auth/status', (req, res) => {
  console.log('Auth status requested. Is authenticated:', req.isAuthenticated());
  res.json({ isLoggedIn: req.isAuthenticated() });
});

// Redirect root to React app
app.get('/', (req, res) => {
  res.redirect('http://localhost:3000');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));