const db = require('../db.js');
const fs = require('fs');

exports.getItemsApi = async (req, res) => {
  const page = req.params.box;
  const field = req.query.field || 'id';
  const order = req.query.order || 'asc';
  const items = await db.getItems(page, field, order);
  if (items.length) res.status(200).json(items);
  else res.status(204).send();
};

exports.getItemByIdApi = async (req, res) => {
  const page = req.params.box;
  const id = req.params.id;
  const item = await db.getItemById(page, id);
  if (item.length) res.status(200).json(item);
  else res.status(204).send();
};

exports.getAttachmentByIdApi = async (req, res) => {
  const box = req.params.box;
  const id = req.params.id;
  const attachment = await db.getAttachmentById(box, id);
  if (attachment) return res.status(200).json(attachment);
  else return res.status(204).send();
};

exports.getUserByNameApi = async (req, res) => {
  const user = req.params.user;
  const profile = await db.getUserByName(user);
  if (profile) return res.status(200).json(profile);
  else res.status(204).send();
};

exports.deleteAttachmentByIdApi = async (req, res) => {
  const id = req.params.id;
  const { fsDirectory, fsFilename } = await db.getAttachmentByFileId(id);

  await db.deleteAttachmentById(id);
  fs.unlink(`${fsDirectory}/${fsFilename}`, (err => {
    if (err) {
      console.log(err);
      return;
    } else {
      console.log('Deleted file: ', fsFilename);
    }
  }));
  res.status(200).send();
};

exports.addItemApi = async (req, res) => {
  const page = req.params.box;
  const id = await db.addItem(page, req.body.subject,
    req.body.fromTo, req.body.addedBy,
    req.body.replyTo, req.body.note);
  res.status(200).json(id);
};

exports.updateItemByIdApi = async (req, res) => {
  const page = req.params.box;
  const id = req.params.id;
  await db.updateItemById(id, page, req.body.subject,
    req.body.fromTo, req.body.replyTo, req.body.note);
};
exports.updateStatusApi = async (req, res) => {
  const box = req.params.box;
  const id = req.params.id
  const status = req.body.newStatus;
  await db.updateStatus(box, id, status);
  return res.status(200).send();
};

exports.updateUserEmailApi = async (req, res) => {
  const user = req.body.user;
  const email = req.body.email;
  const emailExists = await db.checkEmail(email);

  if (emailExists) return res.status(409).send();

  await db.updateUserEmail(user, email);
  return res.status(200).send();
};

exports.updateUserInfoApi = async (req, res) => {
  const user = req.body.user;
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;

  await db.updateUserInfo(user, firstname, lastname);
  return res.status(200).send();
};

exports.updateUserPasswordApi = async (req, res) => {
  const user = req.body.username;
  const oldPass = req.body.oldPass;
  const newPass = req.body.newPass;

  await db.updateUserPassword(user, newPass);
  
  return res.status(200).send();
};

exports.signupApi = async (req, res) => {
  const username = await db.checkUsername(req.body.username);
  const email = await db.checkEmail(req.body.email);

  if (username) return res.status(409)
    .json({error: 'Username is taken'});
  if (email) return res.status(409)
    .json({error: 'There is an account using this email'});

  await db.signup(req.body.username, req.body.password, 
    req.body.firstname, req.body.lastname, req.body.email);

    return res.status(201).send();
};

exports.getContactsApi = async (req, res) => {
  const contacts = await db.getContacts();

  if (contacts)  return res.status(200).json(contacts);
  else return res.status(204).send();
};

exports.searchContactsByNameApi = async (req, res) => {
  const name = req.query.name;
  const contacts = await db.searchContactsByName(name);

  return res.json(contacts);
};

exports.addContactApi = async (req, res) => {
  await db.addContact(req.body.orgLocation, req.body.orgRegion, req.body.orgName);

  return res.status(200).send();
};

exports.uploadFileApi = async (req, res) => {
  const filename = req.file.originalname;
  const fsDirectory = req.file.destination;
  const fsFilename = req.file.filename;
  const size = req.file.size;
  const type = req.file.mimetype;
  const box = req.params.box;
  const id = req.params.id;
  await db.addAttachment(filename, fsDirectory, fsFilename, box, id, size, type);

  return res.status(200).send();
};

exports.downloadFileApi = async (req, res) => {
  const id = req.params.file;
  const { fsDirectory, fsFilename, filename, mimeType } = await db.getAttachmentByFileId(id);
  const path = [fsDirectory, fsFilename].join('/');

  return res.set({'Content-Type': mimeType}).status(200).download(path, filename);
};
