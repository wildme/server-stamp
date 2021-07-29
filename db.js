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

Inbox.find((err, docs) => {
  if(err) console.error(err);
  if(docs.length) return;

  new Inbox({
    id: 1,
    from: 'Duckburg',
    subject: 'Test1',
    date: new Date,
    addedBy: 'Me',
    notes: 'TEST1'
  }).save();

  new Inbox({
    id: 2,
    from: 'Gotham',
    subject: 'Test2',
    date: new Date,
    addedBy: 'Me',
    notes: 'TEST2'
  }).save();
});

module.exports = {
  getInbox: async () => Inbox.find({}),
  sortedInbox: async (field, order) => Inbox.find({}).sort({field:order})
};
