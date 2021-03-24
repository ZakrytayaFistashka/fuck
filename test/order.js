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
    cost: 100,
};

describe('Order', () => {
    let tmp;

    before(async () => {
        await User.deleteOne({ email: data.email });
        tmp = await Course.deleteOne({ slug: data.course.slug });

        await agent
            .post('/register')
            .use(prefix)
            .send({ email: data.email, password: data.password });

        await agent
            .post('/login')
            .use(prefix)
            .send({ email: data.email, password: data.password });
        tmp = await new Course(data.course);
        await tmp.save();

        tmp = await Course.findOne({});
    });

    it('Создание заказа', async () => {
        const { cost } = data;
        tmp = await agent
            .post('/orders/create')
            .use(prefix)
            .send({ cost, courseId: tmp._id });
    });
});
