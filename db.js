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
const User = require('./models/user.js');
const Contact = require('./models/contact.js');
const Attachment = require('./models/attachment.js');

module.exports = {
  getItems: async (page, field, order) =>
  page === 'inbox' ?
  await Inbox.find({}).sort([[field, order]]) :
  await Outbox.find({}).sort([[field, order]]),

  getItemById: async (page, id) =>
    page === 'inbox' ?
  await Inbox.find({id: id}) :
  await Outbox.find({id: id}),

  getAttachmentById: async (box, id) => {
    return await Attachment.findOne({ doc: box, docId: id },
      'filename _id').exec();
  },

  getUserByName: async (user) => {
    return await User.findOne({ username: user }, 'firstname lastname email').exec();
  },

  deleteAttachmentById: async (id) => {
    await Attachment.deleteOne({ _id: id });
  },

  getAttachmentByFileId: async (id) => {
    return await Attachment.findOne({ _id: id },
      'fsDirectory fsFilename filename mimeType').exec();
  },

  updateItemById: async (id, page, subject, fromTo, replyTo, note) =>
  page === 'inbox' ?
  await Inbox.updateOne({id: id},
    {subject: subject, from: fromTo,
      replyTo: replyTo, note: note, updated: new Date()}) :
  await Outbox.updateOne({id: id},
    {subject: subject, to: fromTo,
      replyTo: replyTo, note: note, updated: new Date()}),

  updateStatus: async (box, id, status) => (
    box === 'inbox' ?
    await Inbox.updateOne({id: id}, {status: status}) :
    await Outbox.updateOne({id: id}, {status: status})
  ),

  updateUserEmail: async (user, email) => {
    return await User.updateOne({username: user}, {email: email});
  },

  updateUserInfo: async (user, firstname, lastname) => {
    return await User.updateOne({username: user}, {firstname: firstname,
      lastname: lastname});
  },

  updateUserPassword: async (user, hash) => {
    return await User.updateOne({username: user}, {password: hash});
  },

  addItem: async (page, subject, fromTo, addedBy, replyTo, note) => {
    const year = new Date().getFullYear();
    const docForCurrentYear = await LastId.findOne({box: page, year: year});
    if (!(docForCurrentYear)) new LastId({box: page, year: year}).save();
    await LastId.updateOne({box: page, year: year}, {$inc: {lastId: 1}});
    const id = await LastId.findOne({box: page, year: year}, 'lastId');
    const idYearFormat = [id.lastId, year].join('-'); 
    const doc = page === 'inbox' ?
      new Inbox({ id: idYearFormat, from: fromTo, subject: subject,
        addedBy: addedBy, replyTo: replyTo, note: note, date: new Date }) :
      new Outbox({ id: idYearFormat, to: fromTo, subject: subject,
      addedBy: addedBy, replyTo: replyTo, note: note, date: new Date });
    await doc.save();
    return idYearFormat;
  },

  addAttachment: async (filename, fsDirectory, fsFilename, box, id, size, type) => {
    const doc = new Attachment({ filename: filename, fsDirectory: fsDirectory,
      fsFilename: fsFilename, doc: box, docId: id, filesize: size,
      date: new Date, mimeType: type });
    await doc.save();
  },

  checkUsername: async (username) => {
    return await User.findOne({username: username}, 'username');
  },

  checkEmail: async (email) => {
    return await User.findOne({email: email}, 'email');
  },

  checkPass: async (user, password) => {
    return await User.findOne({username: user}, 'password');
  },

  signup: async (username, password, firstname, lastname, email) => {
    new User({username: username, password: password,
    firstname: firstname, lastname: lastname, email: email }).save();
  },

  getContacts: async () => Contact.find({}),

  searchContactsByName: async (name) => {
  const string  = new RegExp(name, "i");
  return await Contact.find({name: string}, 'name location').exec();
  },

  addContact: async (location, region, name) => {
    new Contact({location: location, region: region, name: name}).save();
  }
};
