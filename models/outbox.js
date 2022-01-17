const mongoose = require('mongoose');

const outboxSchema = mongoose.Schema({
  id: { type: String, unique: true },
  status: { type: String, default: 'active', enum: ['active', 'canceled'] },
  to: { type: String },
  subject: { type: String },
  date: { type: Date },
  updated: { type: Date },
  addedBy:  { type: String },
  replyTo: { type: String },
  notes:  { type: String },
});

const Outbox = mongoose.model('Outbox', outboxSchema);
module.exports = Outbox;
