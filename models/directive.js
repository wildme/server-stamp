const mongoose = require('mongoose');

const directiveSchema = mongoose.Schema({
  id: { type: Number },
  subj: { type: String },
  user: { type: String },
  note: { type: String },
  typeCode: { type: String },
  status: { type: String, default: 'active', enum: ['active', 'canceled'] },
  file: {
    name: { type: String },
    dir: { type: String },
    fsName: { type: String },
    size: { type: Number },
    mime: { type: String },
    date: { type: Date }
  }
}, { timestamps: true });
const Directive = mongoose.model('Directive', directiveSchema);
module.exports = Directive;
