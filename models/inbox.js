const mongoose = require('mongoose');

const inboxSchema = mongoose.Schema({
  id: Number,
  from: String,
  subject: String,
  date: { type: Date, default: new Date },
  addedBy: String,
  notes: String
});

const Inbox = mongoose.model('Inbox', inboxSchema);
module.exports = Inbox;
