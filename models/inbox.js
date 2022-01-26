const mongoose = require('mongoose');

const inboxSchema = mongoose.Schema({
  id: { type: String, unique: true },
  status: { type: String, default: 'active', enum: ['active', 'canceled'] },
  from: { type: String },
  subject: { type: String },
  date: { type: Date },
  updated: { type: Date },
  addedBy: { type: String },
  replyTo: { type: String },
  note: { type: String }
});

const Inbox = mongoose.model('Inbox', inboxSchema);
module.exports = Inbox;
