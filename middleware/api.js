const fs = require('fs');
const db = require('../db.js');
const smtp = require('../libs/smtp.js');
const hashpass = require('../libs/hashpass.js');
const path = require('path');

const staticDir = String(process.env.STAMP_EXPRESS_STATIC_DIR) || 'build';

exports.getReactIndex = async (req, res) => {
  return res.sendFile(path.join(process.cwd(), staticDir, 'index.html'));
};

exports.getItemsApi = async (req, res) => {
  const box = req.params.box;
  const column = req.query.column || 'id';
  const order = req.query.order || 'asc';
  const year = Number(req.query.year);
  const items = await db.getItems(box, column, order, year);
  const years = await db.getYearsOfActivity(box);

  if (!items) { 
    return res.sendStatus(500);
  }
  if (!items.length) {
    return res.sendStatus(204);
  }
  if (req.token) {
    return res.json({records: items, years: years, token: req.token});
  }
  return res.json({records: items, years: years});
};

exports.getContactsApi = async (req, res) => {
  const contacts = await db.getContacts();

  if (!contacts.length) {
    return res.sendStatus(204);
  }
  if (!contacts) {
    return res.sendStatus(500);
  }
  if (req.token) {
    return res.json({contacts: contacts, token: req.token});
  }
  return res.json({contacts: contacts});
};

exports.getItemByIdApi = async (req, res) => {
  const box = req.params.box;
  const id = req.params.id;
  const item = await db.getItemById(box, id);
  if (item === 'error') {
    return res.sendStatus(500);
  }
  if (!item) {
    return res.sendStatus(204);
  }
  const {firstname, lastname} = await db.getUserFullname(item.user);
  item.fullname = [firstname, lastname].join(' ');
  if (req.token) {
    return res.json({record: item, token: req.token});
  }
  return res.json({record: item});
};

exports.fetchItemByIdApi = async (req, res) => {
  const box = req.params.box;
  const id = req.params.id;
  const item = await db.getItemById(box, id);
  if (!item) {
      return res.sendStatus(204);
  }

  const admin = req.user.admin;
  const user = req.user.username;
  const permitted = admin || (user === item.user);
  if (!permitted) {
    return res.sendStatus(403);
  }

  if (item === 'error') {
    return res.sendStatus(500);
  }

  if (req.token) {
    return res.json({record: item, token: req.token});
  }
  return res.json({record: item});
};

exports.downloadFileApi = async (req, res) => {
  const id = req.params.file;
  const { file } = await db.getAttachmentByName(id);
  if (file === 'error') {
    return res.sendStatus(500);
  }
  if (!file) {
    return res.sendStatus(204);
  }
  const path = [file.dir, file.fsName].join('/');
  if (req.token) {
    res.token = req.token;
  }
  return res.set({'Content-Type': file.mime}).download(path, file.name);
};

exports.deleteAttachmentByNameApi = async (req, res) => {
  const id = req.params.id;
  const { user, file } = await db.getAttachmentByName(id);
  const reqUser = req.user.username;
  const admin = req.user.admin;

  const permitted = admin || (reqUser === user);
  if (!permitted) {
    return res.sendStatus(403);
  }
  const deleted = await db.deleteAttachmentByName(id);
  if (!deleted) {
    return res.sendStatus(500);
  }
  fs.unlink(`${file.dir}/${file.fsName}`, (err => {
    if (err) {
      console.error(err);
    } else {
      console.log('Deleted file: ', file.fsName);
    }
  }));
  if (req.token) {
    res.token = req.token;
  }
  return res.sendStatus(200);
};

exports.deleteContactByIdApi = async (req, res) => {
  const id = req.params.id;
  const contact = await db.deleteContactById(id);

  if (!contact) {
    return res.sendStatus(500);
  }
  if (req.token) {
    res.token = req.token;
  }
  return res.sendStatus(200);
};

exports.addItemApi = async (req, res) => {
  const box = req.params.box;
  const year = String(new Date().getFullYear());
  const user = req.body.user;
  const subj = req.body.subject.trim();
  const addr = req.body.fromTo.trim();
  const reply = req.body.replyTo.trim();
  const note = req.body.note.trim();
  const file = req.body.fileData;

  const id = await db.addItem(box, year, subj, addr, user, reply, note);

  if (!id) return res.sendStatus(500);
  if (file) {
    const attachment = await db.addAttachment(
      file.filename,
      file.fsDirectory,
      file.fsFilename,
      file.box,
      id,
      file.size,
      file.type
    );
  }
  if (req.token) {
    return res.json({id: id, token: req.token});
  }
  return res.json({id: id});
};

exports.updateItemByIdApi = async (req, res) => {
  const box = req.params.box;
  const id = req.params.id;
  const owner = req.body.owner;
  const subj = req.body.subject.trim();
  const addr = req.body.fromTo.trim();
  const reply = req.body.replyTo.trim();
  const note = req.body.note.trim();
  const file = req.body.fileData;
  const admin = req.user.admin;
  const user = req.user.username;
  let update = {};

  const permitted = admin || (user === owner);
  if (!permitted) {
    return res.sendStatus(403);
  }

  const item = await db.updateItemById(id, box, subj, addr, reply, note);
  if (!item) {
    return res.sendStatus(500);
  }
  if (req.token) {
    update.token = req.token;
  }
  if (file) {
    update.newFile = await db.addAttachment(
      file.filename,
      file.fsDirectory,
      file.fsFilename,
      file.box,
      id,
      file.size,
      file.type
    );
  }
  if (update.newFile || update.token) {
    return res.json({...update});
  }
  return res.sendStatus(200);
};

exports.updateContactByIdApi = async (req, res) => {
  const id = req.params.id
  const name = req.body.name.trim();
  const region = req.body.region.trim();
  const location = req.body.location.trim();
  const contact = await db.updateContactById(id, name, region, location);

  if (!contact) {
    return res.sendStatus(500);
  }
  if (req.token) {
    res.token = req.token;
  }
  return res.sendStatus(200);
};

exports.updateStatusApi = async (req, res) => {
  const box = req.params.box;
  const id = req.params.id
  const status = req.body.newStatus;
  const owner = req.body.owner;
  const admin = req.user.admin
  const user = req.user.username
  const permitted = admin || (user === owner);

  if (!permitted) {
    return res.sendStatus(403);
  }
  const itemStatus = await db.updateStatus(box, id, status);
  if (!itemStatus) {
    return res.sendStatus(500);
  }
  if (req.token) {
    res.token = req.token;
  }
  return res.sendStatus(200);
};

exports.updateUserEmailApi = async (req, res) => {
  const user = req.body.user;
  const email = req.body.email;
  const emailExists = await db.checkEmail(email);

  if (emailExists) {
    return res.sendStatus(409);
  }

  const emailUpdate = await db.updateUserEmail(user, email);
  if (!emailUpdate) {
    return res.sendStatus(500);
  }
  if (req.token) {
    res.token = req.token;
  }
  return res.sendStatus(200);
};

exports.updateUserInfoApi = async (req, res) => {
  const user = req.body.user;
  const firstname = req.body.firstname.trim();
  const lastname = req.body.lastname.trim();
  const info = await db.updateUserInfo(user, firstname, lastname);

  if (!info) {
    return res.sendStatus(500);
  }
  if (req.token) {
    res.token = req.token;
  }
  return res.sendStatus(200);
};

exports.updateUserPasswordApi = async (req, res) => {
  const username = req.body.user;
  const oldPass = req.body.oldPass;
  const newPass = req.body.newPass;
  const { password } = await db.checkPass(username, oldPass);
  const checkPass = await hashpass.cmpHash(oldPass, password);

  if (!checkPass) {
    return res.sendStatus(409);
  }
  const hash = await hashpass.getHashOfPass(newPass, username);
  if (!hash) {
    return res.sendStatus(500);
  }
  const pass = await db.updateUserPassword(username, hash);
  if (!pass) {
    return res.sendStatus(500);
  }
  if (req.token) {
    res.token = req.token;
  }
  return res.sendStatus(200);
};

exports.updateUserSettingsApi = async (req, res) => {
  const username = req.body.user;
  const newSettings = {...req.body.settings};
  const settings = await db.updateUserSettings(username, newSettings);

  if (!settings) {
    return res.sendStatus(500);
  }
  if (req.token) {
    res.token = req.token;
  }
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

exports.searchContactsApi = async (req, res) => {
  const name = req.query.name;
  const contacts = await db.searchContactsByName(name);
  if (!contacts) {
    return res.sendStatus(500);
  }
  if (req.token) {
    return res.json({contacts: contacts, token: req.token});
  }
  return res.json({contacts: contacts});
};

exports.addContactApi = async (req, res) => {
  const orgName = req.body.orgName.trim();
  const orgLocation = req.body.orgLocation.trim();
  const orgRegion = req.body.orgRegion.trim();

  const contact = await db.addContact(orgLocation, orgRegion, orgName);
  if (!contact) {
    return res.sendStatus(500);
  }
  if (req.token) {
    res.token = req.token;
  }
  return res.sendStatus(200);
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
  if (!emailExists) {
    return res.status(409).json({error: 'Email not found'});
  }

  const usernameExists = await db.checkUsername(username);
  if (!usernameExists) {
    return res.status(409).json({error: 'User not found'});
  }

  const hash = await hashpass.getHashOfPass(newPass, username);
  if (!hash) {
    return res.sendStatus(500);
  }

  const pass = await db.updateUserPassword(username, hash);
  if (!pass) {
    return res.sendStatus(500);
  }

  const emailSent = smtp.sendCreds(email, username, newPass);
  if (!emailSent) {
    return res.status(500).json({error: 'Cannot send email'});
  }
  return res.sendStatus(200);
};
