const mongoose = require('mongoose');

const inboxSchema = mongoose.Schema({
  id: { type: String },
  status: { type: String, default: 'active' },
  from: { type: String },
  subject: { type: String },
  date: { type: Date },
  updated: { type: Date },
  addedBy: { type: String },
  replyTo: { type: String },
  notes: { type: String }
});

const Inbox = mongoose.model('Inbox', inboxSchema);
module.exports = Inbox;
