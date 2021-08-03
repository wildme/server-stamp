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

LastId.find((err, ids) => {
  if(err) return console.error(err);
  if(ids.length) return;

  new LastId({ box: 'inbox'}).save();
  new LastId({ box: 'outbox'}).save();
});

module.exports = {
  getInbox: async (field, order) => Inbox.find({}).sort([[field, order]]),
  getItemById: async (box, id) => 
    box === 'inbox' ? Inbox.find({id: id}) : Outbox.find({id: id}),
  addInbox: async (subject, fromTo, addedBy, notes) => {
    await LastId.updateOne({box: 'inbox'}, {$inc: {lastId: 1}});
    const id = await LastId.findOne({box: 'inbox'}, 'lastId')
    const doc = new Inbox({ id: id.lastId, from: fromTo, subject: subject,
      addedBy: addedBy, notes: notes });
    doc.save();
  }
};
