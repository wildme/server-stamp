const mongoose = require('mongoose');

const contactSchema = mongoose.Schema({
  location: { type: String, required: true },
  region: { type: String, required: false },
  name: { type: String, required: true },
  email: { type: String },
  person: { type: String }
});

const Contact = mongoose.model('Contact', contactSchema);
module.exports = Contact;
