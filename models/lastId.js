const mongoose = require('mongoose');

const lastIdSchema = mongoose.Schema({
  box: { type: String }, 
  lastId: { type: Number, default: 0 }
});

const lastId = mongoose.model('LastId', lastIdSchema);
module.exports = lastId;
