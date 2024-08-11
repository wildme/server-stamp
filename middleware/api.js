const fs = require('fs');
const db = require('../db.js');
const smtp = require('../libs/smtp.js');
const hashpass = require('../libs/hashpass.js');
const path = require('path');
const { WebSocket } = require('ws');

const staticDir = String(process.env.STAMP_EXPRESS_STATIC_DIR) || 'build';
const wssPort = Number(process.env.STAMP_WEBSOCKET_PORT) || 8080;

exports.getReactIndex = async (req, res) => {
  return res.sendFile(path.join(process.cwd(), staticDir, 'index.html'));
};

exports.getItemsApi = async (req, res) => {
  const box = req.params.doc;
  const column = req.query.column || 'id';
  const order = req.query.order || 'asc';
  const year = Number(req.query.year);
  const items = await db.getItems(box, column, order, year);
  const years = await db.getYearsOfActivity(box);

  if (!items) { 
    return res.sendStatus(500);
  }
  if (!items.length && !years.length) {
    return res.sendStatus(204);
  }
  if (req.token) {
    return res.json({records: items, years: years, token: req.token});
  }
  if (!items.length && years.length) {
    return res.json({records: false, years: years});
  }
  return res.json({records: items, years: years});
};

exports.getDirectivesApi = async (req, res) => {
  const doc = req.params.doc;
  const column = req.query.column || 'id';
  const order = req.query.order || 'asc';
  const year = Number(req.query.year);
  let yearsSet = new Set();
  const items = await db.getDirectives(column, order, year);
  const years = await db.getYearsOfActivity(doc);
  if (years.length) {
    years.map((year => yearsSet.add(year.createdAt.getFullYear())));
  }

  if (!items) {
    return res.sendStatus(500);
  }
  if (!items.length && !yearsSet.size) {
    return res.sendStatus(204);
  }
  if (req.token) {
    return res.json({records: items, years: [...yearsSet], token: req.token});
  }
  if (!items.length && yearsSet.size) {
    return res.json({records: false, years: [...yearsSet]});
  }
  return res.json({records: items, years: [...yearsSet]});
};

exports.getDirectiveByIdApi = async (req, res) => {
  const id = req.params.id;
  const item = await db.getDirectiveById(id);
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

exports.getNextRecordIdApi = async (req, res) => {
  const box = req.params.box;
  const curYear = new Date().getFullYear();
  const lastId = await db.getLastRecordId(box, curYear);
  let nextId;

  if (lastId) nextId = lastId + 1;
  else nextId = 1;

  const nextIdStr = nextId + '-' + curYear;
  if (req.token) {
    return res.json({nextid: nextIdStr, token: req.token});
  }
  return res.json({nextid: nextIdStr});
};

exports.getNextDocIdApi = async (req, res) => {
  const doc = req.params.doc;
  const lastId = await db.getLastDocId(doc);
  let nextId = 0;

  if (lastId) nextId = lastId + 1;
  else nextId = 1;

  if (req.token) {
    return res.json({nextid: nextId, token: req.token});
  }
  return res.json({nextid: nextId});
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

exports.getDocCodesApi = async (req, res) => {
  const doc = req.params.doc;
  const admin = req.user.admin;
  const user = req.user.username;
  const roles = await db.getUserRoles(user);
  const permitted = admin || (roles.includes('chief'));

  if (!permitted) {
    return res.sendStatus(403);
  }

  const items = await db.getDocCodes(doc);

  if (!items) {
    return res.sendStatus(500);
  }

  if (req.token) {
    return res.json({docCodes: items, token: req.token});
  }
  return res.json({docCodes: items});
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

exports.fetchDirectiveByIdApi = async (req, res) => {
  const id = req.params.id;
  const item = await db.getDirectiveById(id);
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
  const doc = req.params.doc;
  const id = req.params.file;
  const { file } = await db.getAttachmentByName(doc, id);
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
  const doc = req.params.doc;
  const { user, file } = await db.getAttachmentByName(doc, id);
  const reqUser = req.user.username;
  const admin = req.user.admin;

  const permitted = admin || (reqUser === user);
  if (!permitted) {
    return res.sendStatus(403);
  }
  const deleted = await db.deleteAttachmentByName(doc, id);
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
  const ws = new WebSocket(`ws://localhost:${wssPort}/${box}`);
  ws.on('open', function() {
    const nextId = Number(id.split('-')[0]) + 1;
    ws.send(nextId + '-' + year);
  });
  if (req.token) {
    return res.json({id: id, token: req.token});
  }
  return res.json({id: id});
};

exports.addDirectiveApi = async (req, res) => {
  const user = req.body.user;
  const subj = req.body.subject.trim();
  const typeCode = req.body.typeCode;
  const note = req.body.note.trim();
  const file = req.body.fileData;

  const id = await db.addDirective(subj, user, typeCode, note);

  if (!id) return res.sendStatus(500);
  if (file) {
    const attachment = await db.addDirectiveAttachment(
      file.filename,
      file.fsDirectory,
      file.fsFilename,
      id,
      file.size,
      file.type
    );
  }
  const ws = new WebSocket(`ws://localhost:${wssPort}/directive`);
  ws.on('open', function() {
    const nextId = Number(id) + 1;
    ws.send(nextId);
  });
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

exports.updateDirectiveByIdApi = async (req, res) => {
  const id = req.params.id;
  const owner = req.body.owner;
  const subj = req.body.subject.trim();
  const note = req.body.note.trim();
  const file = req.body.fileData;
  const admin = req.user.admin;
  const user = req.user.username;
  let update = {};

  const permitted = admin || (user === owner);
  if (!permitted) {
    return res.sendStatus(403);
  }

  const item = await db.updateDirectiveById(id, subj, note);
  if (!item) {
    return res.sendStatus(500);
  }
  if (req.token) {
    update.token = req.token;
  }
  if (file) {
    update.newFile = await db.addDirectiveAttachment(
      file.filename,
      file.fsDirectory,
      file.fsFilename,
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
  const doc = req.params.doc;
  const id = req.params.id
  const status = req.body.newStatus;
  const owner = req.body.owner;
  const admin = req.user.admin
  const user = req.user.username
  const permitted = admin || (user === owner);

  if (!permitted) {
    return res.sendStatus(403);
  }
  const itemStatus = await db.updateStatus(doc, id, status);
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
  const newSettings = req.body.settings;
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

exports.searchRecordsByIdApi = async (req, res) => {
  const box = req.params.box;
  const id = req.body.value.trim();
  const escSpecChars = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const result = await db.searchRecordsById(box, escSpecChars);

  if (!result) {
    return res.sendStatus(500);
  }
  if (req.token) {
    return res.json({result: result, token: req.token});
  }
  return res.json({result: result});
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

  const emailSent = await smtp.sendCreds(email, username, newPass);
  if (!emailSent) {
    return res.status(500).json({error: 'Cannot send email'});
  }
  return res.sendStatus(200);
};
