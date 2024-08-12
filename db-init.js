#!/usr/bin/env node

const mongoose = require('mongoose');
const LastId = require('./models/lastId.js');
const User = require('./models/user.js');
const Settings = require('./models/settings.js');
const DocCode = require('./models/docCode.js');

const db = mongoose.connection;
const connectionString = process.env.STAMP_MONGODB || 'mongodb://localhost:27017/stamp';
const opts = {connectTimeoutMS: 5000};
const curYear = String(new Date().getFullYear());

mongoose.connect(connectionString, opts)
  .catch((err) => {console.error("Enable connect to MongoDB: ", err)});

db.once('open', () => console.log('Connection established'));
db.on('error', (err) => {console.error(err.message); process.exit(1);})
  .on('close', () => console.log('Connection closed'))
  .on('disconnected', () => console.log('Disconnected from MongoDB'));

(async function() {
  const adminUser = await User.exists({username: 'admin'});
  const inLastId = await LastId.exists({box: 'inbox'});
  const outLastId = await LastId.exists({box: 'outbox'});
  const appLang = await Settings.findOne({'language': { $exists: true }});
  const docCodes = await DocCode.exists();

  if (adminUser) { 
    console.log('Admin account exists. Skipping');
  } else {
    const admin = new User({
      username: 'admin',
      password: 'admin',
      firstname: 'Admin',
      lastname: 'Admin',
      email: 'admin@example.com',
      administrator: true
    });
    await admin.save()
      .then(() => {console.log('Admin account has been created!');})
      .catch((err) => {console.error(err)});
  }
  if (inLastId) {
    console.log('Inbox lastID collection exists. Skipping');
  } else {
    const inboxLastId = new LastId({
      box: 'inbox',
      year: curYear
    });
    await inboxLastId.save()
      .then(() => {console.log('Inbox lastId has been created');})
      .catch((err) => {console.error(err)});
  }
  if (outLastId) {
    console.log('Outbox lastID collection exists. Skipping');
  } else {
    const outboxLastId = new LastId({
      box: 'outbox',
      year: curYear
    });
    await outboxLastId.save()
      .then(() => {console.log('Outbox lastId has been created');})
      .catch((err) => {console.error(err)});
  }
  if (docCodes === null) {
    const docCodeDefault = new DocCode({
      doc: 'directive',
      code: 'MN',
      title: 'Main activity'
    });
    await docCodeDefault.save()
      .then(() => {console.log('Document codes have been created');})
      .catch((err) => {console.error(err)});
  } else {
    console.log('Document codes exists. Skipping');
  }
  if (appLang) {
    console.log('Language is already set. Skipping');
  } else {
    const lang = new Settings({
      language: process.env.STAMP_LANG || 'en-En'
    });
    await lang.save()
      .then(() => {console.log('Language has been set');})
      .catch((err) => {console.error(err)});
  }
  return db.close();
})();
