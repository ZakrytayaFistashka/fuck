const localStrategy = require('../passport/local');
const vkStrategy = require('../passport/vk');
const fbStrategy = require('../passport/fb');
const googleStrategy = require('../passport/google');
const User = require('../models/user');
const Course = require('../models/course');

module.exports = (router) => {
  router.post('/register', async (ctx) => {
    const {
      email,
      password,
      name,
      surname,
    } = ctx.request.body;
    const user = new User({ email, password, name, surname });

    const dbUser = await User.find({ email });

    if (dbUser.length) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        payload: {
          email: 'DUPLICATE',
        },
      };

      return;
    }

    try {
      await user.save();
      ctx.body = {
        code: 200,
      };
    } catch (e) {
      const payload = {};

      if (e.errmsg && e.errmsg.indexOf('dup key') !== -1) {
        payload.email = 'DUPLICATE';
      }

      if (e.errors && e.errors.email) {
        payload.email = 'REQUIRED';
      }

      if (e.errors && e.errors.password) {
        payload.password = 'REQUIRED';
      }

      ctx.status = 400;
      ctx.body = {
        code: 400,
        payload: payload,
      };
    }
  });

  router.post('/login', async (ctx, next) => {
    await localStrategy.authenticate('local', async (err, user, info) => {
      if (err) {
        throw err;
      }

      if (user) {
        await ctx.login(user);
        ctx.body = { message: 'ok' };
      } else {
        ctx.status = 401;
        ctx.body = {
          code: 401,
          message: info.message,
        };
      }
    })(ctx, next);
  });

  router.get('/logout', async (ctx) => {
    ctx.logout();
    ctx.body = { message: 'ok' };
  });

  router.get('/vk', async (ctx, next) => {
    await vkStrategy.authenticate('vk', { scope: ['email', 'profile'] })(ctx, next);
  });

  router.get('/vk/callback', async (ctx, next) => {
    await vkStrategy.authenticate('vk', async (err, user) => {
      if (err) {
        ctx.redirect('/auth-error/')
      } else {
        await ctx.login(user);
        ctx.redirect('/');
      }
    })(ctx, next);
  });

  router.get('/fb', async (ctx, next) => {
    await fbStrategy.authenticate('fb', { scope: ['email', 'profile'] })(ctx, next);
  });

  router.get('/fb/callback', async (ctx, next) => {
    await fbStrategy.authenticate('fb', async (err, user) => {
      if (err) {
        ctx.redirect('/auth-error');
      } else {
        await ctx.login(user);
        ctx.redirect('/');
      }
    })(ctx, next);
  });

  router.get('/google', async (ctx, next) => {
    await googleStrategy.authenticate('google', { scope: ['email', 'profile'] })(ctx, next);
  });

  router.get('/google/callback', async (ctx, next) => {
    await googleStrategy.authenticate('google', async (err, user) => {
      if (err) {
        ctx.redirect('/auth-error/')
      } else {
        await ctx.login(user);
        ctx.redirect('/');
      }
    })(ctx, next);
  });

  router.get('/user', async (ctx) => {
    if (ctx.isAuthenticated()) {
      const { user } = ctx.state;
      ctx.body = {
        email: user.email,
        name: user.name,
        surname: user.surname,
        balance: user.balance,
        points: user.points,
      };
    } else {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        message: 'unauthorized',
      };
    }
  });

  router.get('/user/courses', async (ctx) => {
    if (ctx.isUnauthenticated()) {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        message: 'unauthorized',
      };

      return;
    }

    const { user } = ctx.state;
    let rawCourses = await Course.find({}).exec();
    let userCourses = user.courses;

    let courses = rawCourses.map((course) => {
      const userCourse = userCourses.find(c => c._id.toString() === course._id.toString());
      const mergedCourse = {
        _id: course.id,
        name: course.name,
        slug: course.slug,
        description: course.description,
      };

      if (userCourse) {
        mergedCourse.pay = userCourse.pay;
        mergedCourse.lessons = course.lessons.map((lesson) => {
          const userLesson = userCourse.lessons.find(l => l._id.toString() === lesson._id.toString());
          const mergedLesson = {
            _id: lesson._id,
            name: lesson.name,
            slug: lesson.slug,
            icon: lesson.icon,
          };

          if (userLesson) {
            mergedLesson.completed = userLesson.completed;
            mergedLesson.points = userLesson.points;
          } else {
            mergedLesson.completed = false;
            mergedLesson.points = 0;
          }

          return mergedLesson;
        });

        const results = mergedCourse.lessons.reduce((acc, l) => {
          const completed = acc.completed && l.completed;
          const points = acc.points + l.points;

          return {
            completed,
            points,
          };
        }, { points: 0, completed: false });

        mergedCourse.points = results.points;
        mergedCourse.completed = results.completed;
      } else {
        mergedCourse.points = 0;
        mergedCourse.pay = false;
        mergedCourse.completed = false;
        mergedCourse.lessons = course.lessons.map(l => ({
          _id: l._id,
          name: l.name,
          slug: l.slug,
          icon: l.icon,
          points: 0,
          completed: false,
        }));
      }

      return mergedCourse;
    });

    ctx.body = courses;
  });

  router.put('/user/course/:courseId/:lessonId', async (ctx) => {
    const { courseId, lessonId } = ctx.params;
    const { lesson } = ctx.request.body;
    const { points, completed } = lesson;
    const { user } = ctx.state;
    let courseIndex = user.courses.findIndex(c => c._id === courseId);
    let lessonIndex = -1;
    console.log(lessonId)

    if (ctx.isUnauthenticated()) {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        message: 'unauthorized',
      };

      return;
    }

    if (courseIndex === -1) {
      user.courses.push({
        _id: courseId,
        lessons: [],
      });

      courseIndex = user.courses.findIndex(c => c._id === courseId);
    }

    if (courseIndex !== -1) {
      lessonIndex = user.courses[courseIndex].lessons.findIndex(l => l._id.toString() === lessonId);
    }

    if (courseIndex !== -1 && lessonIndex === -1) {
      user.courses[courseIndex].lessons.push({
        _id: lessonId,
      });

      lessonIndex = user.courses[courseIndex].lessons.findIndex(l => l._id.toString() === lessonId);
    }

    if (lessonIndex !== -1 && courseIndex !== -1) {
      user.courses[courseIndex].lessons[lessonIndex].points = points;
      user.courses[courseIndex].lessons[lessonIndex].completed = completed;
    }

    if (lessonIndex === -1 || courseIndex === -1) {
      ctx.throw(400);
    }

    await User.updateOne({ _id: user._id }, user);

    ctx.body = {
      message: 'ok',
    }
  });
};
