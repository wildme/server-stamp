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

module.exports = {
  getItems: async (page, field, order) =>
  page === 'inbox' ?
  await Inbox.find({}).sort([[field, order]]) :
  await Outbox.find({}).sort([[field, order]]),

  getItemById: async (page, id) =>
    page === 'inbox' ?
  await Inbox.find({id: id}) :
  await Outbox.find({id: id}),

  updateItemById: async(id, page, subject, fromTo, replyTo, notes) =>
  page === 'inbox' ?
  await Inbox.updateOne({id: id},
    {subject: subject, from: fromTo, replyTo: replyTo, notes: notes}) :
  await Outbox.updateOne({id: id},
    {subject: subject, to: fromTo, replyTo: replyTo, notes: notes}),

  addItem: async (page, subject, fromTo, addedBy, replyTo, notes) => {
    const year = new Date().getFullYear();
    const docForCurrentYear = await LastId.findOne({box: page, year: year});
    if (!(docForCurrentYear)) new LastId({box: page, year: year}).save();
    await LastId.updateOne({box: page, year: year}, {$inc: {lastId: 1}});
    const id = await LastId.findOne({box: page, year: year}, 'lastId');
    const doc = page === 'inbox' ?
      new Inbox({ id: [id.lastId, year].join('-'), from: fromTo, subject: subject,
        addedBy: addedBy, replyTo: replyTo, notes: notes, date: new Date }) :
      new Outbox({ id: [id.lastId, year].join('-'), to: fromTo, subject: subject,
      addedBy: addedBy, replyTo: replyTo, notes: notes, date: new Date });
    await doc.save();
  },

  checkUsername: async (username) => await User.findOne({username: username}, 'username'),

  checkEmail: async (email) => await User.findOne({email: email}, 'email'),

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
