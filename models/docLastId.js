const mongoose = require('mongoose');

const docLastIdSchema = mongoose.Schema({
  doc: { type: String, unique: true },
  lastId: { type: Number, default: 0 }
});
const DocLastId = mongoose.model('DocLastId', docLastIdSchema);
module.exports = DocLastId;
