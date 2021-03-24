const Koa = require('koa');
const Router = require('koa-router');
const staticRoot = require('koa-static');
const bodyParser = require('koa-bodyparser');
const passport = require('koa-passport');
const session = require('koa-session');
const mongoStore = require('koa-session-mongoose');
const users = require('./api/users');
const courses = require('./api/courses');
const order = require('./api/order');
const mongoose = require('./db');
const { server } = require('config');
const router = new Router({ prefix: '/api/v1' });
const app = new Koa();

users(router);
courses(router);
order(router);

app.use(session({
  signed: false,
  store: mongoStore.create({
    name: 'Session',
    expires: 3600 * 4,
    connection: mongoose,
  }),
}, app));
app.use(bodyParser({ enableTypes: ['json', 'form', 'text'] }));
app.use(passport.initialize());
app.use(passport.session());
app.use(router.routes());
app.use(staticRoot(server.static));
app.listen(server.port);
