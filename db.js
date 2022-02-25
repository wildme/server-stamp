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
const Settings = require('./models/settings.js');

module.exports = {
  getItems: async (box, column, order) => {
    if (box === 'inbox') {
      return await Inbox.find({}).sort([[column, order]])
        .then(items => items)
        .catch((err) => {
          console.error(err);
          return null;
        });
    }
    if (box === 'outbox') {
      return await Outbox.find({}).sort([[column, order]])
        .then(items => items)
        .catch((err) => {
          console.error(err);
          return null;
        });
    }
  },

  getItemById: async (box, id) => {
    if (box === 'inbox') {
      return await Inbox.find({ id: id }).exec()
        .then(item => item)
        .catch((err) => {
          console.error(err);
          return null;
        });
    }
    if (box === 'outbox') {
      return await Outbox.find({ id: id }).exec()
        .then(item => item)
        .catch((err) => {
          console.error(err);
          return null;
        });
    }
  },

  getAttachmentById: async (box, id) => {
    return await Attachment.findOne({ doc: box, docId: id },
      'filename _id').exec()
      .then(attach => attach)
      .catch((err) => {
        console.error(err);
      });
  },

  getUserByName: async (user) => {
    return await User.findOne({ username: user },
      'firstname lastname email').exec()
      .then(user => user)
      .catch((err) => {
        console.error(err);
      });
  },

  getContacts: async () => {
    return Contact.find({}).sort('name')
      .then(contacts => contacts)
      .catch((err) => {
        console.error(err);
        return null;
      });
  },

  deleteAttachmentById: async (id) => {
    return await Attachment.deleteOne({ _id: id })
      .then(file => file)
      .catch((err) => {
        console.error(err);
        return null;
      });
  },

  deleteContactById: async (id) => {
    return await Contact.deleteOne({ _id: id })
      .then(contact => contact)
      .catch((err) => {
        console.error(err);
        return null;
      });
  },

  getAttachmentByFileId: async (id) => {
    return await Attachment.findOne({ _id: id },
      'fsDirectory fsFilename filename mimeType').exec()
      .then(file => file)
      .catch((err) => {
        console.error(err);
      });
  },

  updateItemById: async (id, box, subject, fromTo, replyTo, note) => {
    if (box === 'inbox') {
      return await Inbox.updateOne({ id: id },
        { subject: subject, from: fromTo,
          replyTo: replyTo, note: note,
            updated: new Date() })
        .then(item => item)
        .catch(err => {
          console.error(err);
          return null;
        });
    }
    if (box === 'outbox') {
      return await Outbox.updateOne({ id: id },
        { subject: subject, to: fromTo,
          replyTo: replyTo, note: note,
            updated: new Date() })
        .then(item => item)
        .catch(err => {
          console.error(err);
          return null;
        });
    }
  },

  updateStatus: async (box, id, status) => {
    if (box === 'inbox') {
      return await Inbox.updateOne({ id: id },
        { status: status })
        .then(status => status)
        .catch(err => {
          console.error(err);
          return null;
        });
    }
    if (box === 'outbox') {
      return await Outbox.updateOne({ id: id },
        { status: status })
        .then(status => status)
        .catch(err => {
          console.error(err);
          return null;
        });
    }
  },
  updateContactById: async (id, name, region, location) => {
    return Contact.updateOne({ _id: id },
      { name: name, region: region, location: location })
      .then(contact => contact)
      .catch(err => {
        console.error(err);
        return null;
      });
  },

  updateUserEmail: async (user, email) => {
    return await User.updateOne({ username: user },
      { email: email })
      .then(email => email)
      .catch(err => {
        console.error(err);
        return null;
      });
  },

  updateUserInfo: async (user, firstname, lastname) => {
    return await User.updateOne({ username: user },
      { firstname: firstname, lastname: lastname })
      .then(userInfo => userInfo)
      .catch(err => {
        console.error(err);
        return null;
      });
  },

  updateUserPassword: async (user, hash) => {
    return await User.updateOne({ username: user },
      { password: hash })
      .then(password => password)
      .catch(err => {
        console.error(err);
        return null;
      });
  },

  addItem: async (box, subject, fromTo, addedBy, replyTo, note) => {
    const year = new Date().getFullYear();
    const docForCurrentYear = await LastId.findOne({ box: box, year: year });

    if (!(docForCurrentYear)) new LastId({ box: box, year: year }).save();

    await LastId.updateOne({ box: box, year: year }, { $inc: { lastId: 1 } });
    const id = await LastId.findOne({ box: box, year: year }, 'lastId');
    const idYearFormat = [id.lastId, year].join('-'); 

    const doc = box === 'inbox' ?
      new Inbox({ id: idYearFormat, from: fromTo, subject: subject,
        addedBy: addedBy, replyTo: replyTo, note: note, date: new Date }) :
      new Outbox({ id: idYearFormat, to: fromTo, subject: subject,
        addedBy: addedBy, replyTo: replyTo, note: note, date: new Date });

    return await doc.save()
      .then(record => record.id)
      .catch(err => {
        console.error(err);
        return null;
      });
  },

  addContact: async (location, region, name) => {
    const doc = new Contact({ location: location, region: region, name: name });
    return await doc.save()
      .then(contact => contact)
      .catch(err => {
        console.error(err);
        return null;
      });
  },

  addAttachment: async (filename, fsDirectory, fsFilename, box, id, size, type) => {
    const doc = new Attachment({ filename: filename,
      fsDirectory: fsDirectory, fsFilename: fsFilename,
      doc: box, docId: id, filesize: size,
      date: new Date, mimeType: type });
    return await doc.save()
      .then(file => file)
      .catch(err => {
        console.error(err);
        return null;
      });
  },

  searchContactsByName: async (name) => {
    const string  = new RegExp(name, "i");
    return await Contact.find({ name: string }, 'name location').exec()
      .then(contacts => contacts)
      .catch((err) => {
        console.error(err);
      });
  },

  checkUsername: async (username) => {
    return await User.findOne({ username: username }, 'username').exec()
      .then(user => user)
      .catch((err) => {
        console.error(err);
      });
  },

  checkEmail: async (email) => {
    return await User.findOne({ email: email }, 'email').exec()
      .then(email => email)
      .catch((err) => {
        console.error(err);
      });
  },

  checkPass: async (user, password) => {
    return await User.findOne({ username: user }, 'password').exec()
      .then(pass => pass)
      .catch((err) => {
        console.error(err);
      });
  },

  signup: async (username, password, firstname, lastname, email) => {
    const user = new User({ username: username, password: password,
    firstname: firstname, lastname: lastname, email: email });

    return await user.save()
      .then(user => user)
      .catch(err => {
        console.error(err);
        return null;
      });
  },

  getAppLanguage: async () => {
    return await Settings.findOne({}, 'language').exec()
      .then(lang => lang)
      .catch((err) => {
        console.error(err);
      });
  }
};
