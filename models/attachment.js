const mongoose = require('mongoose');

const attachmentSchema = mongoose.Schema({
  filename: { type: String, required: true },
  fsDirectory: { type: String },
  fsFilename: { type: String },
  fileSize: { type: Number },
  mimeType: { type: String, default: null },
  doc: { type: String, required: true },
  docId: { type: String, required: true },
  date: { type: Date },
});

const Attachment = mongoose.model('Attachment', attachmentSchema);
module.exports = Attachment;
  

