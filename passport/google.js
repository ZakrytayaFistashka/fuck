const GoogleStrategy = require('passport-google-oauth2').Strategy;
const passport = require('koa-passport');
const config = require('config');
const User = require('../models/user');
const keys = require('../keys').google;

const strategy = new GoogleStrategy({
    clientID: keys.APP_ID,
    clientSecret: keys.API_KEY,
    callbackURL:  config.passport.google_callback,
}, async (accessToken, refreshToken, params, profile, done) => {
    const user = await User.findOne({ google: profile.id });

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
                google: profile.id,
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

module.exports = passport.use('google', strategy);
