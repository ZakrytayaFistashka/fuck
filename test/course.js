'use strict';
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

describe('Course', () => {
  let tmp;

  before(async () => {
    await User.deleteOne({ email: data.email });
    await Course.deleteOne({ slug: data.course.slug });

    await agent
      .post('/register')
      .use(prefix)
      .send({ email: data.email, password: data.password });

    await agent
      .post('/login')
      .use(prefix)
      .send({ email: data.email, password: data.password });
  });

  it('Добавление курса', async () => {
    const { name, slug, description, preview, lessons } = data.course;
    await agent
      .post('/courses')
      .use(prefix)
      .send({ name, slug, description, preview, lessons })
  });

  it('Получение списка курсов', async () => {
    tmp = await agent
      .get('/courses')
      .use(prefix);
    tmp = tmp.body;
  });

  it('Получение одного курса', async () => {
    await agent
      .get(`/courses/${tmp[0]._id}`)
      .use(prefix);
  });

  it('Редактирование курса', async () => {
    const res = await agent
      .get(`/courses/${tmp[0]._id}`)
      .use(prefix);

    res.body.lessons.push({
      name: 'Taxi',
      slug: 'taxi',
      icon: 'taxi.svg',
    });

    await agent
      .put(`/courses/${tmp[0]._id}`)
      .use(prefix)
      .send(res.body);
  });
});
