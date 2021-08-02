const mongoose = require('mongoose');
const connectionString = process.env.MONGO_SRV || 'mongodb://localhost:27017/test';

mongoose.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', err => {
  console.error(err.message);
  process.exit(1);
});
db.once('open', () => console.log('Connection established'));

const Inbox = require('./models/inbox.js');
const Outbox = require('./models/outbox.js');
const LastId = require('./models/lastId.js');

module.exports = {
  getInbox: async (field, order) => Inbox.find({}).sort([[field, order]]),
  addInbox: async (subject, fromTo, addedBy, notes) => {
    const doc = new Inbox({ id: 1, from: fromTo, subject: subject,
      addedBy: addedBy, notes: notes });
    doc.save();
  }
};
