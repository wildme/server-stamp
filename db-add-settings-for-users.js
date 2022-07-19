const mongoose = require('mongoose');
const User = require('./models/user.js');
//const UserSettings = require('./models/userSettings.js');

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
  for (let user of users) {
    await User.updateOne({username: user.username}, {settings: { records: {sortOrder: 'asc'}}}, {upsert: true});
  }
  db.close();
})();
