const mongoose = require('mongoose');

const outboxSchema = mongoose.Schema({
  id: Number,
  to: String,
  subject: String,
  date: { type: Date, default: new Date },
  addedBy: String,
  notes: String,
});

const Outbox = mongoose.model('Outbox', outboxSchema);
module.exports = Outbox;
