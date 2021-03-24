const mongoose = require('../db');
const { Schema, model } = mongoose;

const schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    default: '',
  },
  preview: {
    type: String,
    default: '',
  },
  enable: {
    type: Boolean,
    default: true,
  },
  freeAvailable: {
    type: Boolean,
    default: false,
  },
  lessons: {
    type: [{
      name: {
        type: String,
        required: true,
      },
      slug: {
        type: String,
        required: true,
      },
      icon: {
        type: String,
        default: '',
      }
    }],
    default: [],
  }
});

module.exports = model('Course', schema);
