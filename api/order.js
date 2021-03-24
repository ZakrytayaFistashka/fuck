const Order = require('../models/order');
const Course = require('../models/course');
const User = require('../models/user');

module.exports = (router) => {
    router.post('/orders/create', async (ctx) => {
        const { courseId, cost } = ctx.request.body;
        const { user } = ctx.state;
        const course = await Course.findOne({ _id: courseId });

        if (!course) {
            ctx.throw(400);
        }

        if (ctx.isUnauthenticated()) {
            ctx.throw(401);
        }

        const order = new Order({
            cost,
            course: courseId,
            user: user._id,
        });

        await order.save();

        ctx.body = {
            _id: order._id,
            cost: order.cost,
            course: order.course,
        };
    });

    router.post('/orders/notify', async (ctx) => {
        let order = null;
        let user = null;
        let course = -1;
        const {
            TerminalKey,
            OrderId,
            Success,
            Status,
            PaymentId,
            ErrorCode,
            Amount,
            CardId,
            Pan,
            ExpDate,
            Token,
        } = ctx.request.body;

        order = await Order.findOne({ _id: OrderId });

        if (order) {
            user = await User.findOne({ _id: order.user });
        }

        if (user) {
            course = user.courses.findIndex(c => c._id === order.course);
        }

        if (user && course === -1 && order) {
            user.courses.push({
                _id: order.course,
            });

            course = user.courses.findIndex(c => c._id === order.course);
        }

        if (user && course !== -1) {
            user.courses[course].pay = true;
            await user.save();
        }

        if (order) {
            order.status = Status;
            order.terminalKey = TerminalKey;
            order.paymentId = PaymentId;
            order.errorCode = ErrorCode;
            order.amount = Amount / 100;
            order.cardId = CardId;
            order.pan = Pan;
            order.expDate = ExpDate;
            order.token = Token;

            order.save();
        }

        if (!Success || ! order || !user || course === -1) {
            ctx.throw(400);
        }

        ctx.body = 'OK';
    });
};
