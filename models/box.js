const mongoose = require('mongoose');

const boxSchema = mongoose.Schema({
  id: { type: String },
  box: { type: String, enum: ['inbox', 'outbox'] },
  status: { type: String, default: 'active', enum: ['active', 'canceled'] },
  addr: { type: String },
  subj: { type: String },
  date: { type: Date },
  updated: { type: Date },
  user: { type: String },
  reply: { type: String },
  note: { type: String },
  file: {
    name: { type: String },
    dir: { type: String },
    fsName: { type: String },
    size: { type: Number },
    mime: { type: String },
    date: { type: Date }
  }
});

const Box = mongoose.model('Box', boxSchema);
module.exports = Box;
