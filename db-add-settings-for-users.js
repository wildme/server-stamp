const mongoose = require('mongoose');
const User = require('./models/user.js');
const UserSettings = require('./models/userSettings.js');

const connectionString = process.env.STAMP_MONGODB || 'mongodb://localhost:27017/stamp';

mongoose.connect(connectionString,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);
const db = mongoose.connection;

db.on('error', (err) => { console.error(err.message); process.exit(1); })
  .on('close', () => { console.log('Connection closed'); });

db.once('open', () => { console.log('Connection established'); });

(async function() {
  const users = await User.find({}, 'username');
  let newDoc = null
  let user = null;
  for (let i = 0; i < users.length; i++) {
    user = await UserSettings.findOne({username: users[i].username});
    if (user) {
      console.log('Settings for: ', users[i].username, ' are in place');
    } else {
      newDoc = new UserSettings({username: users[i].username});
      console.log('Adding settings for: ', users[i].username, 'are in place');
      await newDoc.save()
        .then(doc => console.log('Settings added for: ', doc.username))
        .catch((err) => console.error(err));
    }
  }
  db.close();
})();
