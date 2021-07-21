const mongoose = require('mongoose');

const outboxSchema = mongoose.Schema({
  id: Number,
  to: String,
  subject: String,
  date: Date,
  addedBy: String,
  notes: String,
});

const Outbox = mongoose.model('Outbox', OutboxSchema);
module.exports = Outbox;
