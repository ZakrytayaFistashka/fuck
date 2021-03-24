const agent = require('superagent').agent();
const prefix = require('superagent-prefix')('http://localhost:4001/api/v1');
const User = require('../models/user');
const Course = require('../models/course');
const data = {
  email: 'test@test',
  password: 'password',
  course: {
    name: 'Main story',
    slug: 'main',
    description: 'You got a new job!',
    preview: 'story.png',
    lessons: [{
      name: 'name',
      slug: 'slug',
      icon: 'icon',
    }],
  },
};

describe('User', () => {
  before(async () => {
    await User.deleteOne({ email: data.email });
    await Course.deleteOne({ slug: data.course.slug });
    const course = new Course(data.course);
    await course.save();
  });

  it('Регистрация', async () => {
    await agent
      .post('/register')
      .use(prefix)
      .send({ email: data.email, password: data.password });
  });

  it('Вход', async () => {
    await agent
      .post('/login')
      .use(prefix)
      .send({ email: data.email, password: data.password });
  });

  it('Повторная регистрация', (done) => {
    agent
      .post('/register')
      .use(prefix)
      .send({ email: data.email, password: data.password })
      .then(e => console.log(e))
      .catch((e) => {
        if (e.status === 400) {
          done();
        }
      });
  });

  it('Получение пользователя', async () => {
    const res = await agent
      .get('/user')
      .use(prefix);
  });

  it('Выход', async () => {
    await agent
      .get('/logout')
      .use(prefix);
  });

  it('Получение пользователя без авторизации', (done) => {
    agent
      .get('/user')
      .use(prefix)
      .catch((e) => {
        if (e.status === 401) {
          done();
        }
      });
  });

  it('Получение курсов пользователя', async () => {
    await agent
        .post('/login')
        .use(prefix)
        .send({ email: data.email, password: data.password });
  });

  it('Модификация курса', async () => {
    await agent
        .post('/login')
        .use(prefix)
        .send({ email: data.email, password: data.password });

    const res = await agent
        .get('/user/courses')
        .use(prefix);
    const course = res.body[0];

    await agent
        .put(`/user/course/${course._id}/${course.lessons[0]._id}`)
        .use(prefix)
        .send({ lesson: { completed: true, points: 300 } });
  });

  it('Модификация курса', async () => {
    await agent
        .post('/login')
        .use(prefix)
        .send({ email: data.email, password: data.password });

    const res = await agent
        .get('/user/courses')
        .use(prefix);
    const course = res.body[0];

    await agent
        .put(`/user/course/${course._id}/${course.lessons[0]._id}`)
        .use(prefix)
        .send({ lesson: { completed: true, points: 400 } });

    const tmp = await agent
        .get('/user/courses')
        .use(prefix);

    console.log(tmp.body[0])
  });
});
