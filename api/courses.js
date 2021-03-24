const Course = require('../models/course');
const { ROLE_ADMIN } = require('../constants');

module.exports = (router) => {
  router.post('/courses', async (ctx) => {
    const {
      name,
      slug,
      description,
      preview,
      lessons: rawLessons,
    } = ctx.request.body;
    const lessons = rawLessons ? rawLessons : [];
    const course = new Course({ name, slug, description, preview, lessons });

    if (ctx.isUnauthenticated()) {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        message: 'unauthorized',
      };
      return;
    }

    if (ctx.state.user.role !== ROLE_ADMIN) {
      ctx.status = 403;
      ctx.body = {
        code: 403,
        message: 'forbidden',
      };
      return;
    }

    try {
      await course.save();
      ctx.body = {
        code: 200,
      };
    } catch (e) {
      const payload = {};

      ctx.status = 400;
      ctx.body = {
        code: 400,
        payload: payload,
      };
    }
  });

  router.get('/courses', async (ctx) => {
    if (ctx.isUnauthenticated()) {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        message: 'unauthorized',
      };

      return;
    }

    if (ctx.state.user.role !== ROLE_ADMIN) {
      ctx.status = 403;
      ctx.body = {
        code: 403,
        message: 'forbidden',
      };
      return;
    }

    ctx.body = await Course.find({}).exec();
  });

  router.get('/courses/:_id', async (ctx) => {
    const { _id } = ctx.params;

    if (ctx.isUnauthenticated()) {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        message: 'unauthorized',
      };

      return;
    }

    if (ctx.state.user.role !== ROLE_ADMIN) {
      ctx.status = 403;
      ctx.body = {
        code: 403,
        message: 'forbidden',
      };
      return;
    }

    ctx.body = await Course.findOne({ _id});
  });

  router.put('/courses/:_id', async (ctx) => {
    const { _id } = ctx.params;
    const {
      name,
      slug,
      description,
      enable,
      lessons,
    } = ctx.request.body;

    if (ctx.isUnauthenticated()) {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        message: 'unauthorized',
      };

      return;
    }

    if (ctx.state.user.role !== ROLE_ADMIN) {
      ctx.status = 403;
      ctx.body = {
        code: 403,
        message: 'forbidden',
      };
      return;
    }

    ctx.body = await Course.updateOne({
      _id,
    }, {
      name,
      slug,
      description,
      enable,
      lessons: lessons,
    });
  });

  router.delete('/courses/:_id', async (ctx) => {
    const { _id } = ctx.params;

    if (ctx.isUnauthenticated()) {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        message: 'unauthorized',
      };

      return;
    }

    if (ctx.state.user.role !== ROLE_ADMIN) {
      ctx.status = 403;
      ctx.body = {
        code: 403,
        message: 'forbidden',
      };
      return;
    }

    Course.deleteOne({ _id });

    ctx.body = {
      code: 200,
    };
  });
};
