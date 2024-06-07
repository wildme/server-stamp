#!/usr/bin/env node

const mongoose = require('mongoose');
const lastId = require('./models/lastId.js');
const user = require('./models/user.js');
const settings = require('./models/settings.js');
const connectionString = process.env.STAMP_MONGODB || 'mongodb://localhost:27017/stamp';
const opts = {connectTimeoutMS: 5000};
const curYear = String(new Date().getFullYear());

mongoose.connect(connectionString, opts)
  .catch((err) => {console.error("Couldn't init connection to MongoDB: ", err)});
const db = mongoose.connection;

db.once('open', () => console.log('Connection established'));
db.on('error', (err) => {console.error(err.message); process.exit(1);})
  .on('close', () => console.log('Connection closed'))
  .on('disconnected', () => console.log('Disconnected from MongoDB'));

(async function() {
  const adminUser = await user.exists({username: 'admin'});
  const inLastId = await lastId.exists({box: 'inbox'});
  const outLastId = await lastId.exists({box: 'outbox'});
  const appLang = await settings.findOne({'language': { $exists: true }});

  if (adminUser) { 
    console.log('Admin account exists. Skipping');
  } else {
    const admin = new User({username: 'admin', password: 'admin',
      firstname: 'Admin', lastname: 'Admin', email: 'admin@example.com',
      administrator: true});
    await admin.save()
      .then(() => {console.log('Admin account has been created!');})
      .catch((err) => {console.error(err)});
  }
  if (inLastId) {
    console.log('Inbox lastID collection exists. Skipping');
  } else {
    const inboxLastId = new lastId({box: 'inbox', year: curYear});
    await inboxLastId.save()
      .then(() => {console.log('Inbox lastId has been created');})
      .catch((err) => {console.error(err)});
  }
  if (outLastId) {
    console.log('Outbox lastID collection exists. Skipping');
  } else {
    const outboxLastId = new lastId({box: 'outbox', year: curYear});
    await outboxLastId.save()
      .then(() => {console.log('Outbox lastId has been created');})
      .catch((err) => {console.error(err)});
  }
  if (appLang) {
    console.log('Language is already set. Skipping');
  } else {
    const lang = new settings({language: process.env.STAMP_LANG || 'en-En'});
    await lang.save()
      .then(() => {console.log('Language has been set');})
      .catch((err) => {console.error(err)});
  }
  return db.close();
})();
