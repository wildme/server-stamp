const mongoose = require('mongoose');
const Box = require('./models/box.js');
const LastId = require('./models/lastId.js');
const User = require('./models/user.js');
const Contact = require('./models/contact.js');
const Settings = require('./models/settings.js');
const Directive = require('./models/directive.js');
const DocCode = require('./models/docCode.js');
const DocLastId = require('./models/docLastId.js');

const connectionString = process.env.STAMP_MONGODB;
const opts = {connectTimeoutMS: 5000};

mongoose.connect(connectionString, opts)
  .catch((err) => {console.error("Couldn't init connection to MongoDB: ", err)});

const db = mongoose.connection;
process.on('SIGINT', () => {
  db.close()
    .then(() => process.exit(0))
    .catch((err) => {console.error(err); process.exit(1);})
});

db.once('open', () => console.log('Connection established'));
db.on('error', (err) => {console.error(err.message); process.exit(1);})
  .on('close', () => console.log('Connection closed'))
  .on('disconnected', () => console.log('Disconnected from MongoDB'));

module.exports = {
  getItems: async (box, column, order, year) => {
    const newYear = new Date(year, 0, 1, 0, 0, 0);
    const endYear = new Date(year, 11, 31, 23, 59, 59);
    return await Box.find({box: box,
      date: {$gte: newYear, $lte: endYear}}).sort([[column, order]])
      .then(items => items)
      .catch((err) => {console.error(err); return null;});
  },

  getDirectives: async (column, order, year) => {
    const newYear = new Date(year, 0, 1, 0, 0, 0);
    const endYear = new Date(year, 11, 31, 23, 59, 59);
    return await Directive.find({createdAt: {$gte: newYear, $lte: endYear}})
      .sort([[column, order]])
      .then(items => items)
      .catch((err) => {console.error(err); return null;});
  },

  getYearsOfActivity: async (doc) => {
    if (doc === 'inbox' || doc === 'outbox') {
      return await LastId.find({box: doc}, 'year')
        .then(years => years.map(year => year.year))
        .catch((err) => {console.error(err); return null;});
    }
    if (doc === 'directives') {
      return await Directive.find({}, 'createdAt')
        .then(years => years)
        .catch((err) => {console.error(err); return null;});
    }
  },

  getLastRecordId: async (box, year) => {
    return await LastId.findOne({box: box, year: year}, 'lastId')
      .then(lastId => (lastId == null) ? 0 : lastId.lastId)
      .catch((err) => {console.error(err); return null;});
  },

  getLastDocId: async (doc) => {
    return await DocLastId.findOne({doc: doc}, 'lastId')
      .then(lastId => (lastId == null) ? 0 : lastId.lastId)
      .catch((err) => {console.error(err); return null;});
  },

  getItemById: async (box, id) => {
    return await Box.findOne({box: box, id: id},
      'id status addr subj date updated user reply note file.name file.fsName').lean()
      .then(item => item)
      .catch((err) => {console.error(err); return 'error';});
  },

  getDirectiveById: async (id) => {
    return await Directive.findOne({id: id},
      'id status subj createdAt updatedAt user note typeCode file.name file.fsName').lean()
      .then(item => item)
      .catch((err) => {console.error(err); return 'error';});
  },

  getAttachmentByName: async (doc, id) => {
    if (doc === 'inbox' || doc === 'outbox') {
      return await Box.findOne({'file.fsName': id}, 'user file')
        .then(data => data)
        .catch((err) => {console.error(err); return 'error'});
    }
    if (doc === 'directive') {
      return await Directive.findOne({'file.fsName': id}, 'user file')
        .then(data => data)
        .catch((err) => {console.error(err); return 'error'});
    }
  },

  getAppLanguage: async () => {
    return await Settings.findOne({}, 'language')
      .then(lang => lang)
      .catch((err) => {console.error(err);});
  },

  getDocCodes: async (doc) => {
    return await DocCode.find({doc: doc}, 'code title')
      .then(docCodes => docCodes)
      .catch((err) => {console.error(err); return null;});
  },

  getUserFullname: async (user) => {
    return await User.findOne({username: user}, 'firstname lastname')
      .then(user => user)
      .catch((err) => {console.error(err);});
  },

  getUserRoles: async (user) => {
    return await User.findOne({username: user}, 'roles')
      .then(user => user.roles)
      .catch((err) => {console.error(err);});
  },

  getContacts: async () => {
    return Contact.find({}).sort('name')
      .then(contacts => contacts)
      .catch((err) => {console.error(err); return null;});
  },

  deleteAttachmentByName: async (doc, id) => {
    if (doc === 'inbox' || doc === 'outbox') {
      return await Box.updateOne({'file.fsName': id}, { $unset: { file: true }})
        .then(data => data)
        .catch((err) => {console.error(err); return null;});
    }
    if (doc === 'directive') {
      return await Directive.updateOne({'file.fsName': id}, { $unset: { file: true }})
        .then(data => data)
        .catch((err) => {console.error(err); return null;});
    }
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

  updateDirectiveById: async (id, subj, note) => {
    return await Directive.updateOne({id: id}, { subj: subj, note: note })
      .then(item => item)
      .catch(err => {console.error(err); return null;});
  },

  updateStatus: async (doc, id, status) => {
    if (doc === 'inbox' || doc === 'outbox') {
      return await Box.updateOne({id: id, box: doc}, {status: status})
        .then(status => status)
        .catch(err => {console.error(err); return null;});
    }
    if (doc === 'directive') {
      return await Directive.updateOne({id: id}, {status: status})
        .then(status => status)
        .catch(err => {console.error(err); return null;});
    }
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
    const bulk = User.collection.initializeUnorderedBulkOp();
    if (settings.sortOrder) {
      bulk.find({username: user})
        .updateOne({$set:{"settings.sortOrder": settings.sortOrder}});
    }
    return await bulk.execute()
      .then(data => data)
      .catch(err => {console.error(err); return null;});
  },

  addItem: async (box, year, subj, addr, user, reply, note) => {
    const query = {box: box, year: year};
    const update = {$inc: {lastId: 1}};
    const opts = {upsert: true, new: true};
    const { lastId } = await LastId.findOneAndUpdate(query, update, opts);
    const id = [lastId, year].join('-');
    const doc = new Box({
      id: id,
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

  addDirective: async (subj, user, typeCode, note) => {
    const query = {doc: 'directive'};
    const update = {$inc: {lastId: 1}};
    const opts = {upsert: true, new: true};
    const { lastId } = await DocLastId.findOneAndUpdate(query, update, opts);
    const doc = new Directive({
      id: lastId,
      subj: subj,
      user: user,
      typeCode: typeCode,
      note: note,
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

  addDirectiveAttachment: async (name, dir, fsName, id, size, mime) => {
    const file = {
      name: name,
      dir: dir,
      fsName: fsName,
      size: size,
      mime: mime,
      date: new Date
    };
    const doc = await Directive.updateOne({id: id}, {file: file})
      .then(data => data)
      .catch(err => {console.error(err); return null;});
    return doc ? file : null;
  },

  searchRecordsById: async (box, id) => {
    return await Box.find({box: box, id: new RegExp("^" + id, "i")}, 'id -_id')
      .then(records => records.map(record => record.id))
      .catch((err) => {console.error(err);});
  },

  checkUsername: async (username) => {
    return await User.findOne({username: username}, 'username')
      .then(user => user)
      .catch((err) => {console.error(err);});
  },

  checkEmail: async (email) => {
    return await User.findOne({email: email}, 'email')
      .then(email => email)
      .catch((err) => {console.error(err);});
  },

  checkPass: async (user, password) => {
    return await User.findOne({username: user}, 'password')
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
  }
};
