const mongoose = require('mongoose');
const db = mongoose.connection;
const connectionString = process.env.STAMP_MONGODB;
const opts = {connectTimeoutMS: 5000};

mongoose.connect(connectionString, opts );

process.on('SIGINT', () => {
  db.close((err) => {
    process.exit(err ? 1 : 0);
  });
});

db.on('error', (err) => {
  console.error(err.message);
  process.exit(1);
});

db.once('open', () => console.log('Connection established'));

const Box = require('./models/box.js');
const LastId = require('./models/lastId.js');
const User = require('./models/user.js');
const Contact = require('./models/contact.js');
const Settings = require('./models/settings.js');

module.exports = {
  getItems: async (box, column, order) => {
    return await Box.find({box: box}).sort([[column, order]])
      .then(items => items)
      .catch((err) => {console.error(err); return null;});
  },

  getItemById: async (box, id) => {
    return await Box.findOne({box: box, id: id},
      'id status addr subj date updated user reply note file.name file.fsName')
      .then(item => item)
      .catch((err) => {console.error(err); return 'error';});
  },

  getAttachmentByName: async (id) => {
    return await Box.findOne({'file.fsName': id}, 'file')
      .then(file => file)
      .catch((err) => {console.error(err); return 'error'});
  },

  getUserByName: async (user) => {
    return await User.findOne({username: user},
      'firstname lastname email').exec()
      .then(user => user)
      .catch((err) => {console.error(err);});
  },

  getContacts: async () => {
    return Contact.find({}).sort('name')
      .then(contacts => contacts)
      .catch((err) => {console.error(err); return null;});
  },

  deleteAttachmentByName: async (id) => {
    const file = {
      name: undefined,
      dir: undefined,
      fsName: undefined,
      size: undefined,
      mime: undefined,
      date: undefined
    };
    return await Box.updateOne({'file.fsName': id}, { file: file })
      .then(file => file)
      .catch((err) => {console.error(err); return null;});
  },

  deleteContactById: async (id) => {
    return await Contact.deleteOne({_id: id})
      .then(contact => contact)
      .catch((err) => {console.error(err); return null;});
  },

  updateItemById: async (id, box, subj, addr, reply, note) => {
    return await Box.updateOne({id: id, box: box}, {
      subj: subj,
      addr: addr,
      reply: reply,
      note: note,
      updated: new Date()
    })
      .then(item => item)
      .catch(err => {console.error(err); return null;});
  },

  updateStatus: async (box, id, status) => {
    return await Inbox.updateOne({id: id, box: box}, {status: status})
      .then(status => status)
      .catch(err => {console.error(err); return null;});
  },

  updateContactById: async (id, name, region, location) => {
    return Contact.updateOne({_id: id},
      {name: name, region: region, location: location})
      .then(contact => contact)
      .catch(err => {console.error(err); return null;});
  },

  updateUserEmail: async (user, email) => {
    return await User.updateOne({username: user}, {email: email})
      .then(email => email)
      .catch(err => {console.error(err); return null;});
  },

  updateUserInfo: async (user, firstname, lastname) => {
    return await User.updateOne({username: user},
      {firstname: firstname, lastname: lastname})
      .then(userInfo => userInfo)
      .catch(err => {console.error(err); return null;});
  },

  updateUserPassword: async (user, hash) => {
    return await User.updateOne({username: user}, {password: hash})
      .then(password => password)
      .catch(err => {console.error(err); return null;});
  },

  updateUserSettings: async (user, settings) => {
    return await User.updateOne({username: user}, {settings: settings},
      {upsert: true})
      .then(data => data)
      .catch(err => {console.error(err); return null;});
  },

  addItem: async (box, year, subj, addr, user, reply, note) => {
    const docForCurrentYear = await LastId.findOne({box: box, year: year});

    if (!(docForCurrentYear)) new LastId({box: box, year: year}).save();

    await LastId.updateOne({box: box, year: year}, {$inc: {lastId: 1}});

    const id = await LastId.findOne({box: box, year: year}, 'lastId');
    const idYearFormat = [id.lastId, year].join('-'); 
    const doc = new Box({
      id: idYearFormat,
      box: box,
      addr: addr,
      subj: subj,
      user: user,
      reply: reply,
      note: note,
      date: new Date
      });

    return await doc.save()
      .then(record => record.id)
      .catch(err => {console.error(err); return null;});
  },

  addContact: async (location, region, name) => {
    const doc = new Contact({location: location, region: region, name: name});
    return await doc.save()
      .then(contact => contact)
      .catch(err => {console.error(err); return null;});
  },

  addAttachment: async (name, dir, fsName, box, id, size, mime) => {
    const file = {
      name: name,
      dir: dir,
      fsName: fsName,
      size: size,
      mime: mime,
      date: new Date
    };
    const doc = await Box.updateOne({box: box, id: id}, {file: file})
      .then(data => data)
      .catch(err => {console.error(err); return null;});
    return doc ? file : null;
  },

  searchContactsByName: async (name) => {
    const escSpecChars = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regexp  = new RegExp(escSpecChars, "i");
    return await Contact.find({name: regexp}, 'name location').exec()
      .then(contacts => contacts)
      .catch((err) => {console.error(err);});
  },

  checkUsername: async (username) => {
    return await User.findOne({username: username}, 'username').exec()
      .then(user => user)
      .catch((err) => {console.error(err);});
  },

  checkEmail: async (email) => {
    return await User.findOne({email: email}, 'email').exec()
      .then(email => email)
      .catch((err) => {console.error(err);});
  },

  checkPass: async (user, password) => {
    return await User.findOne({username: user}, 'password').exec()
      .then(pass => pass)
      .catch((err) => {console.error(err);});
  },

  signup: async (username, password, firstname, lastname, email) => {
    const user = new User({
      username: username,
      password: password,
      firstname: firstname,
      lastname: lastname,
      email: email
    });

    return await user.save()
      .then(user => user)
      .catch(err => {console.error(err); return null;});
  },

  getAppLanguage: async () => {
    return await Settings.findOne({}, 'language').exec()
      .then(lang => lang)
      .catch((err) => {console.error(err);});
  }
};
