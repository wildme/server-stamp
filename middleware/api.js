const fs = require('fs');
const db = require('../db.js');
const smtp = require('../libs/smtp.js');
const hashpass = require('../libs/hashpass.js');
const multer = require('multer');
const path = require('path');

const maxFileSize = Number(process.env.STAMP_MAX_FILESIZE) || 5000000;
const staticDir = String(process.env.STAMP_EXPRESS_STATIC_DIR) || 'build';
const uploadDir = String(process.env.STAMP_EXPRESS_UPLOAD_DIR) || 'files';

exports.getReactIndex = async (req, res) => {
  return res.sendFile(path.join(process.cwd(), staticDir, 'index.html'));
};

exports.getItemsApi = async (req, res) => {
  const box = req.params.box;
  const column = req.query.field || 'id';
  const order = req.query.order || 'asc';
  const items = await db.getItems(box, column, order);

  if (!items) return res.sendStatus(500);
  if (items.length) return res.json(items);
  if (!items.length) return res.sendStatus(204);
};

exports.getContactsApi = async (req, res) => {
  const contacts = await db.getContacts();

  if (contacts.length) return res.json(contacts);
  if (!contacts.length) return res.sendStatus(204);
  if (!conatcts) return res.sendStatus(500);
};

exports.getItemByIdApi = async (req, res) => {
  const box = req.params.box;
  const id = req.params.id;
  const item = await db.getItemById(box, id);

  if (!item) return res.sendStatus(500);
  if (!item.length) return res.sendStatus(204);
  return res.json(item);
};

exports.getAttachmentByIdApi = async (req, res) => {
  const box = req.params.box;
  const id = req.params.id;
  const attachment = await db.getAttachmentById(box, id);

  if (attachment) return res.json(attachment);
  else return res.sendStatus(204);
};

exports.getUserByNameApi = async (req, res) => {
  const user = req.params.user;
  const profile = await db.getUserByName(user);

  if (profile) return res.json(profile);
  else return res.sendStatus(204);
};

exports.deleteAttachmentByIdApi = async (req, res) => {
  const id = req.params.id;
  const { fsDirectory, fsFilename } = await db.getAttachmentByFileId(id);
  const file = await db.deleteAttachmentById(id);

  fs.unlink(`${fsDirectory}/${fsFilename}`, (err => {
    if (err) {
      console.error(err);
    } else {
      console.log('Deleted file: ', fsFilename);
    }
  }));

  if (!file) return res.sendStatus(500);
  return res.sendStatus(200);
};

exports.deleteContactByIdApi = async (req, res) => {
  const id = req.params.id;
  const contact = await db.deleteContactById(id);

  if (!contact) return res.sendStatus(500);
  return res.sendStatus(200);
};

exports.addItemApi = async (req, res) => {
  const box = req.params.box;
  const year = new Date().getFullYear();
  const id = await db.addItem(
    box,
    year,
    req.body.subject,
    req.body.fromTo,
    req.body.addedBy,
    req.body.replyTo,
    req.body.note
  );

  if (!id) return res.sendStatus(500);
  return res.json(id);
};

exports.updateItemByIdApi = async (req, res) => {
  const box = req.params.box;
  const id = req.params.id;
  const item = await db.updateItemById(
    id, box, req.body.subject,
    req.body.fromTo, req.body.replyTo, req.body.note
  );

  if (!item) return res.sendStatus(500);
  return res.sendStatus(200);
};

exports.updateContactByIdApi = async (req, res) => {
  const id = req.body.id
  const name = req.body.name;
  const region = req.body.region;
  const location = req.body.location;
  const contact = await db.updateContactById(id, name, region, location);

  if (!contact) return res.sendStatus(500);
  return res.sendStatus(200);
};

exports.updateStatusApi = async (req, res) => {
  const box = req.params.box;
  const id = req.params.id
  const status = req.body.newStatus;
  const itemStatus = await db.updateStatus(box, id, status);

  if (!itemStatus) return res.sendStatus(500);
  return res.sendStatus(200);
};

exports.updateUserEmailApi = async (req, res) => {
  const user = req.body.user;
  const email = req.body.email;
  const emailExists = await db.checkEmail(email);

  if (emailExists) return res.sendStatus(409);
  const emailUpdate = await db.updateUserEmail(user, email);

  if (!emailUpdate) return res.sendStatus(500);
  return res.sendStatus(200);
};

exports.updateUserInfoApi = async (req, res) => {
  const user = req.body.user;
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const info = await db.updateUserInfo(user, firstname, lastname);

  if (!info) return res.sendStatus(500);
  return res.sendStatus(200);
};

exports.updateUserPasswordApi = async (req, res) => {
  const username = req.body.user;
  const oldPass = req.body.oldPass;
  const newPass = req.body.newPass;
  const { password } = await db.checkPass(username, oldPass);
  const checkPass = await hashpass.cmpHash(oldPass, password);

  if (!checkPass) return res.sendStatus(409);

  const hash = await hashpass.getHashOfPass(newPass, username);
  if (!hash) return res.sendStatus(500);

  const pass = await db.updateUserPassword(username, hash);
  if (!pass) return res.sendStatus(500);

  return res.sendStatus(200);
};

exports.signupApi = async (req, res) => {
  const username = await db.checkUsername(req.body.username);
  const email = await db.checkEmail(req.body.email);

  if (username) return res.status(409).json({error: 'user exists'});
  if (email) return res.status(409).json({error: 'email exists'});

  const user = await db.signup(
    req.body.username,
    req.body.password,
    req.body.firstname,
    req.body.lastname,
    req.body.email
  );

  if (!user) return res.sendStatus(500);
  return res.sendStatus(201);
};

exports.searchContactsByNameApi = async (req, res) => {
  const name = req.query.name;
  const contacts = await db.searchContactsByName(name);

  return res.json(contacts);
};

exports.addContactApi = async (req, res) => {
  const contact = await db.addContact(req.body.orgLocation,
    req.body.orgRegion, req.body.orgName);

  if (!contact) return res.sendStatus(500);
  return res.sendStatus(200);
};

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

exports.downloadFileApi = async (req, res) => {
  const id = req.params.file;
  const { fsDirectory, fsFilename, filename, mimeType } =
    await db.getAttachmentByFileId(id);
  const path = [fsDirectory, fsFilename].join('/');

  return res.set({'Content-Type': mimeType}).download(path, filename);
};

exports.getAppLanguageApi = async (req, res) => {
  const setting = await db.getAppLanguage();

  if (!setting) return res.sendStatus(500);
  return res.json(setting.language);
};

exports.resetPasswordApi = async (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const newPass = String(Math.floor(Math.random() * 100000000) + 100000);

  const emailExists = await db.checkEmail(email);
  const usernameExists = await db.checkUsername(username);

  if (!usernameExists) return res.status(204).json({info: 'User not found'});
  if (!emailExists) return res.status(204).json({info: 'Email not found'});

  const hash = await hashpass.getHashOfPass(newPass, username);
  if (!hash) return res.sendStatus(500);

  const pass = await db.updateUserPassword(username, hash);
  if (!pass) return res.sendStatus(500);

  const emailSent = smtp.sendCreds(email, username, newPass);
  if (!emailSent) return res.sendStatus(500);

  return res.sendStatus(200);
};
