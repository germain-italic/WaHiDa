const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = (passport) => {
    passport.use(
        new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/auth/google/callback"
        },
        async (accessToken, refreshToken, profile, done) => {
            console.log('Google strategy callback reached');
            console.log('Profile:', profile);

            const newUser = {
                googleId: profile.id,
                email: profile.emails[0].value,
            };

            try {
                let user = await User.findOne({ googleId: profile.id });
                if (user) {
                    console.log('Existing user found:', user);
                    done(null, user);
                } else {
                    console.log('Creating new user');
                    user = await User.create(newUser);
                    console.log('New user created:', user);
                    done(null, user);
                }
            } catch (err) {
                console.error('Error in Google strategy callback:', err);
                done(err, null);
            }
        })
    );

    passport.serializeUser((user, done) => {
        console.log('Serializing user:', user);
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        console.log('Deserializing user id:', id);
        User.findById(id)
            .then(user => {
                console.log('Deserialized user:', user);
                done(null, user);
            })
            .catch(err => {
                console.error('Error deserializing user:', err);
                done(err, null);
            });
    });
};