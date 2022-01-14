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
  getBox: async (page, field, order) =>
  page === 'inbox' ?
  Inbox.find({}).sort([[field, order]]) :
  Outbox.find({}).sort([[field, order]]),

  getItemById: async (page, id) =>
    page === 'inbox' ?
  Inbox.find({id: id}) :
  Outbox.find({id: id}),

  updateItemById: async(id, page, subject, fromTo, notes) =>
  page === 'inbox' ?
  Inbox.updateOne({id: id}, {subject: subject, from: fromTo, notes: notes}) :
  Outbox.updateOne({id: id}, {subject: subject, to: fromTo, notes: notes}),

  addBox: async (page, subject, fromTo, addedBy, notes) => {
    await LastId.updateOne({box: page}, {$inc: {lastId: 1}});
    const id = await LastId.findOne({box: page}, 'lastId')
    const doc = page === 'inbox' ?
      new Inbox({ id: id.lastId, from: fromTo, subject: subject,
        addedBy: addedBy, notes: notes, date: new Date }) :
      new Outbox({ id: id.lastId, to: fromTo, subject: subject,
      addedBy: addedBy, notes: notes, date: new Date });
    doc.save();
  },

  checkUsername: async (username) => User.findOne({username: username}, 'username'),

  checkEmail: async (email) => User.findOne({email: email}, 'email'),

  signup: async (username, password, firstname, lastname, email) => {
    new User({username: username, password: password,
    firstname: firstname, lastname: lastname, email: email }).save();
  },

  getContacts: async () => Contact.find({}),

  searchContactsByName: async (name) =>
  Contact.find({name: new RegExp('^'+name+'$', "i")}).exec(),

  addContact: async (location, region, name) => {
    new Contact({location: location, region: region, name: name}).save();
  }
};
