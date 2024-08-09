const mongoose = require('mongoose');

const docCodeSchema = mongoose.Schema({
  doc: { type: String },
  code: { type: String, unique: true },
  title: { type: String }
});
const DocCode = mongoose.model('DocCode', docCodeSchema);
module.exports = DocCode;
