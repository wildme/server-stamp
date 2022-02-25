const mongoose = require('mongoose');

const settingsSchema = mongoose.Schema({
  language: { type: String, default: 'en' }
});

const Settings = mongoose.model('Settings', settingsSchema);
module.exports = Settings;
