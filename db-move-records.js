const mongoose = require('mongoose');
const Inbox = require('./models/inbox.js');
const Outbox = require('./models/outbox.js');
const Box = require('./models/box.js');

const connectionString = process.env.STAMP_MONGODB || 'mongodb://localhost:27017/stamp';

mongoose.connect(connectionString);
const db = mongoose.connection;

db.on('error', (err) => { console.error(err.message); process.exit(1); })
  .on('close', () => { console.log('Connection closed'); });

db.once('open', () => { console.log('Connection established'); });

(async function() {
  const inbox = await Inbox.find({});
  const outbox = await Outbox.find({});
  let doc = {};

  for (let itemIn of inbox) {
    doc = new Box({
      id: itemIn.id,
      box: 'inbox',
      status: itemIn.status,
      addr: itemIn.from,
      subj: itemIn.subject,
      date: itemIn.date,
      updated: itemIn.updated,
      user: itemIn.addedBy,
      reply: itemIn.replyTo,
      note: itemIn.note
    });
    await doc.save();
  }

  for (let itemOut of outbox) {
    doc = new Box({
      id: itemOut.id,
      box: 'outbox',
      status: itemOut.status,
      addr: itemOut.to,
      subj: itemOut.subject,
      date: itemOut.date,
      updated: itemOut.updated,
      user: itemOut.addedBy,
      reply: itemOut.replyTo,
      note: itemOut.note
    });
    await doc.save();
  }
  db.close();
})();
