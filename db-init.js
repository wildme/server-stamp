const mongoose = require('mongoose');

const connectionString = process.env.MONGO_SRV || 'mongodb://localhost:27017/test';

mongoose.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;

db.on('error', (err) => { console.error(err.message); process.exit(1); })
  .on('close', () => console.log('Connection closed'));
db.once('open', () => console.log('Connection established'));

const Inbox = require('./models/inbox.js');
const Outbox = require('./models/outbox.js');
const LastId = require('./models/lastId.js');
const User = require('./models/user.js');

const admin = new User({ username: 'admin', password: 'admin',
      firstname: 'John', lastname: 'Doe', email: 'admin@example.com',
      administrator: true });
const inboxLastId = new LastId({ box: 'inbox', lastId: 0 });
const outboxLastId = new LastId({ box: 'outbox', lastId: 0 });

(async function() {
  const adminUser = await User.exists({ username: 'admin' });
  const inLastId = await LastId.exists({ box: 'inbox' });
  const outLastId = await LastId.exists({ box: 'outbox' });

  if (adminUser) { 
    console.log('Admin user exists');
  } else {
    await admin.save();
    console.log('Admin user has been created!');
  }
  if (inLastId) {
    console.log('Inbox lastID collection exists');
  } else {
    await inboxLastId.save();
    console.log('Inbox lastId has been created');
  }
  if (outLastId) {
    console.log('Outbox lastID collection exists');
  } else {
    await outboxLastId.save();
    console.log('Outbox lastId has been created');
  }
  return db.close();
})();
