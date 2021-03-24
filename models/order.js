const mongoose = require('../db');
const { Schema, model } = mongoose;
const { PAY_STATUS_UNPAY } = require('../constants');

const schema = new Schema({
    // Зарезервировано
    number: {
        type: Number,
    },
    user: {
        type: String,
        required: true,
    },
    course: {
        type: String,
        required: true,
    },
    cost: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: 'rur',
    },
    status: {
        type: String,
        default: PAY_STATUS_UNPAY,
    },
    terminalKey: {
        type: String,
        default: '',
    },
    paymentId: {
        type: Number,
        default: 0,
    },
    errorCode: {
        type: Number,
        default: 0,
    },
    amount: {
        type: Number,
        default: 0,
    },
    cardId: {
        type: Number,
        default: 0,
    },
    pan: {
        type: String,
        default: '',
    },
    expDate: {
        type: String,
        default: '',
    },
    token: {
        type: String,
        default: '',
    },
    createAt: {
        type: Date,
        default: new Date(),
    },
    updateAt: {
        type: Date,
        default: new Date(),
    },
});

module.exports = model('Order', schema);
