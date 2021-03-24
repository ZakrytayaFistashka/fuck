const mongoose = require('mongoose');
const { db } = require('config');

mongoose.connect(`${db.host}:${db.port}/${db.name}`, { useNewUrlParser: true });

module.exports = mongoose;
