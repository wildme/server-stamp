const multer = require('multer');

const maxFileSize = Number(process.env.STAMP_MAX_FILESIZE) || 5000000;
const uploadDir = String(process.env.STAMP_EXPRESS_UPLOAD_DIR) || 'files';

exports.uploadFileApi = async (req, res) => {
  const upload = multer({
    dest: `${uploadDir}/${new Date().getFullYear()}/${new Date().getMonth()}`,
    limits: { fileSize: maxFileSize }
  }).single('file');

  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.message === 'File too large') return res.sendStatus(413);
    } else if (err) {
      return res.sendStatus(500);
    }

    const savedFileData = {
      filename: req.file.originalname,
      fsDirectory: req.file.destination,
      fsFilename: req.file.filename,
      size: req.file.size,
      type: req.file.mimetype,
      box: req.params.box
    };

    return res.json({...savedFileData});
  });
};
