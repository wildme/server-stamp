const mongoose = require('mongoose');

const lastIdSchema = mongoose.Schema({
  inboxLastId: { type: Number, default: 0 },
  outboxLastId: { type: Number, default: 0 }
});

const lastId = mongoose.model('LastId', lastIdSchema);
module.exports = lastId;
