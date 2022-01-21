const mongoose = require('mongoose');

const attachmentSchema = mongoose.Schema({
  filename: { type: String, required: true },
  fs_directory: { type: String },
  fs_filename: { type: String },
  doc: { type: String, required: true },
  docId: { type: String, required: true },
  date: { type: Date },
  addedBy: { type: String }
});

const Attachment = mongoose.model('Attachment', attachmentSchema);
module.exports = Attachment;
  

