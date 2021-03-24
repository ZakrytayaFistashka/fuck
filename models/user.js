const mongoose = require('../db');
const { Schema, model } = mongoose;
const { ROLE_USER } = require('../constants');

const schema = new Schema({
  vk: {
    type: Number,
  },
  fb: {
    type: Number,
  },
  google: {
    type: Number,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  name: {
    type: String,
  },
  surname: {
    type: String,
  },
  role: {
    type: String,
    default: ROLE_USER,
  },
  balance: {
    type: Number,
    default: 0,
  },
  lastVisited: Date,
  // points: {
  //   type: Number,
  //   default: 0,
  // },
  courses: {
    type: [{
      _id: {
        type: String,
        required: true,
      },
      pay: {
        type: Boolean,
        default: false,
      },
      lessons: [{
        _id: {
          type: String,
          required: true,
        },
        completed: {
          type: Boolean,
          default: false,
        },
        points: {
          type: Number,
          default: 0,
        },
      }],
    }],
    default: [],
  }
});

module.exports = model('User', schema);
