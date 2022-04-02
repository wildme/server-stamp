const mongoose = require('mongoose');

const lastIdSchema = mongoose.Schema({
  box: { type: String, enum: ['inbox', 'outbox'] },
  lastId: { type: Number, default: 0 },
  year: { type: Date, default: new Date().getFullYear() }
});

const lastId = mongoose.model('LastId', lastIdSchema);
module.exports = lastId;
