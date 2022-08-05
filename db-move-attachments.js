const mongoose = require('mongoose');
const Box = require('./models/box.js');
const Attachment = require('./models/attachment.js');

const connectionString = process.env.STAMP_MONGODB || 'mongodb://localhost:27017/stamp';

mongoose.connect(connectionString);
const db = mongoose.connection;

db.on('error', (err) => { console.error(err.message); process.exit(1); })
  .on('close', () => { console.log('Connection closed'); });

db.once('open', () => { console.log('Connection established'); });

(async function() {
  const files = await Attachment.find({});
  for (let file of files) {
    await Box.updateOne(
      {box: file.doc, id: file.docId},
      { file:
        {
          name: file.filename,
          dir: file.fsDirectory,
          fsName: file.fsFilename,
          size: file.fileSize,
          mime: file.mimeType,
          date: file.date
        }
      }
    );
  }
  db.close();
})();
