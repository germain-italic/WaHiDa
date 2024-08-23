const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/google', (req, res, next) => {
  console.log('Google auth initiated');
  passport.authenticate('google', {
    scope: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/youtube.readonly'
    ]
  })(req, res, next);
});

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    console.log('Google auth callback reached');
    console.log('User:', req.user);
    console.log('Session:', req.session);
    res.redirect('http://localhost:3000');
  }
);

router.get('/logout', (req, res) => {
  console.log('Logout initiated');
  req.logout((err) => {
    if (err) {
      console.error('Error during logout:', err);
      return next(err);
    }
    console.log('User logged out');
    res.redirect('http://localhost:3000');
  });
});

module.exports = router;