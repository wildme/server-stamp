const mongoose = require('mongoose');

const connectionString = process.env.STAMP_MONGODB || 'mongodb://localhost:27017/stamp';

mongoose.connect(connectionString);
const db = mongoose.connection;

db.on('error', (err) => { console.error(err.message); process.exit(1); })
  .on('close', () => console.log('Connection closed'));
db.once('open', () => console.log('Connection established'));

const LastId = require('./models/lastId.js');
const User = require('./models/user.js');
const Settings = require('./models/settings.js');

const admin = new User({
  username: 'admin',
  password: 'admin',
  firstname: 'Admin',
  lastname: 'Admin',
  email: 'admin@example.com',
  administrator: true
});

const inboxLastId = new LastId({box: 'inbox'});
const outboxLastId = new LastId({box: 'outbox'});
const language = new Settings({language: process.env.STAMP_LANG || 'en-En'});

(async function() {
  const adminUser = await User.exists({username: 'admin'});
  const inLastId = await LastId.exists({box: 'inbox'});
  const outLastId = await LastId.exists({box: 'outbox'});
  const appLanguage = await Settings.findOne({'language': { $exists: true }});

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
  if (appLanguage) {
    console.log('Language is already set');
  } else {
    await language.save();
    console.log('Language document has been created in Settings');
  }
  return db.close();
})();
