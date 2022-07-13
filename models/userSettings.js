const mongoose = require('mongoose');

const userSettingsSchema = mongoose.Schema({
  username: { type: String, unique: true },
  settings: {
    records: {
      sortOrder: { type: String, enum: ['desc', 'asc'], default: 'asc' }
    }
  }
});

const UserSettings = mongoose.model('UserSettings', userSettingsSchema);
module.exports = UserSettings;
