const passport = require('passport');
const config = require('config');
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/user');
const keys = require('../keys');

const strategy = new FacebookStrategy({
    clientID: keys.fb.APP_ID,
    clientSecret: keys.fb.APP_CLIENT_ID,
    callbackURL: config.passport.fb_callback,
    profileFields: ['id', 'email', 'name'],
}, async (accessToken, refreshToken, params, profile, done) => {
    const user = await User.findOne({ fb: profile.id });

    if (user && !user.email) {
        user.email = profile.email;
    }

    if (user) {
        user.lastVisited = new Date();
        user.save();

        return done(null, user);
    } else {
        try {
            const user = await User.create({
                fb: profile.id,
                name: profile.name.givenName,
                surname: profile.name.familyName,
                email: profile.email,
            });
            done(null, user);
        } catch (e) {
            done(e);
        }
    }
});

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, done);
});

module.exports = passport.use('fb', strategy);

