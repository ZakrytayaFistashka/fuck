const VKStrategy = require('passport-vkontakte').Strategy;
const passport = require('koa-passport');
const config = require('config');
const User = require('../models/user');
const keys = require('../keys').vk;

const strategy = new VKStrategy({
    clientID: keys.APP_ID,
    clientSecret: keys.APP_SECRET,
    callbackURL:  config.passport.vk_callback,
    scope: 4194304, // email
}, async (accessToken, refreshToken, params, profile, done) => {
    const user = await User.findOne({ vk: profile.id });

    if (user && !user.email) {
        user.email = params.email;
    }

    if (user) {
        user.lastVisited = new Date();
        user.save();

        return done(null, user);
    } else {
        try {
            const user = await User.create({
                vk: profile.id,
                name: profile.name.givenName,
                surname: profile.name.familyName,
                email: params.email,
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

module.exports = passport.use('vk', strategy);
