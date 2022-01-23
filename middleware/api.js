const db = require('../db.js');

exports.getItemsApi = async (req, res) => {
  const page = req.params.box;
  const field = req.query.field || 'id';
  const order = req.query.order || 'asc';
  const items = await db.getItems(page, field, order);
  res.json(items);
};

exports.getItemByIdApi = async (req, res) => {
  const page = req.params.box;
  const id = req.params.id;
  const item = await db.getItemById(page, id);
  res.json(item);
};

exports.getAttachmentByIdApi = async (req, res) => {
  const box = req.params.box;
  const id = req.params.id;
  const attachment = await db.getAttachmentById(box, id);
  if (attachment) return res.status(200).json(attachment);
  else return res.status(204).send();
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
    req.body.fromTo, req.body.replyTo, req.body.notes);
};
exports.updateStatusApi = async (req, res) => {
  const box = req.params.box;
  const id = req.params.id
  const status = req.body.newStatus;
  await db.updateStatus(box, id, status);
  res.status(200).send();
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
    res.status(201).send();
};

exports.getContactsApi = async (req, res) => {
  const contacts = await db.getContacts();
  if (contacts)  res.status(200).json(contacts);
  else res.status(204).send();
};

exports.searchContactsByNameApi = async (req, res) => {
  const name = req.query.name;
  const contacts = await db.searchContactsByName(name);
  res.json(contacts);
};

exports.addContactApi = async (req, res) => {
  await db.addContact(req.body.orgLocation, req.body.orgRegion, req.body.orgName);
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
  res.status(200).send();
};

exports.downloadFileApi = async (req, res) => {
  const fsFilename = req.params.file;
  const { fsDirectory, filename, mimeType } = await db.getAttachmentByFilename(fsFilename);
  const path = [fsDirectory, fsFilename].join('/');
  res.set({'Content-Type': mimeType}).status(200).download(path, filename);
};
