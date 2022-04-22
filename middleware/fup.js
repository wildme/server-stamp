const multer = require('multer');
const db = require('../db.js');

const maxFileSize = Number(process.env.STAMP_MAX_FILESIZE) || 5000000;
const staticDir = String(process.env.STAMP_EXPRESS_STATIC_DIR) || 'build';
const uploadDir = String(process.env.STAMP_EXPRESS_UPLOAD_DIR) || 'files';

exports.uploadFileApi = async (req, res) => {
  const upload = multer({
    dest: `${uploadDir}/${new Date().getFullYear()}/${new Date().getMonth()}`,
    limits: { fileSize: maxFileSize }
  }).single('file');

  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.message === 'File too large') return res.sendStatus(413);
      return res.sendStatus(500);
    } else if (err) {
      return res.sendStatus(500);
    }

    const filename = req.file.originalname;
    const fsDirectory = req.file.destination;
    const fsFilename = req.file.filename;
    const size = req.file.size;
    const type = req.file.mimetype;
    const box = req.params.box;
    const id = req.params.id;
    const attach = db.addAttachment(
      filename,
      fsDirectory,
      fsFilename,
      box,
      id,
      size,
      type);

    if (!attach) return res.sendStatus(500);
    return res.sendStatus(200);
  });
};
