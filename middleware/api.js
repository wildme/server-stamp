const db = require('../db.js');
const fs = require('fs');
const bcrypt = require('bcrypt');

exports.getItemsApi = async (req, res) => {
  const box = req.params.box;
  const column = req.query.field || 'id';
  const order = req.query.order || 'asc';
  const items = await db.getItems(box, column, order);

  if (!items) return res.status(500).send();
  if (items.length) return res.status(200).json(items);
  if (!items.length) return res.status(204).send();
};

exports.getItemByIdApi = async (req, res) => {
  const box = req.params.box;
  const id = req.params.id;
  const item = await db.getItemById(box, id);

  if (!item) return res.status(500).send();
  return res.status(200).json(item);
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
  else return res.status(204).send();
};

exports.deleteAttachmentByIdApi = async (req, res) => {
  const id = req.params.id;
  const { fsDirectory, fsFilename } = await db.getAttachmentByFileId(id);
  const file = await db.deleteAttachmentById(id);

  fs.unlink(`${fsDirectory}/${fsFilename}`, (err => {
    if (err) {
      console.log(err);
    } else {
      console.log('Deleted file: ', fsFilename);
    }
  }));

  if (!file) return res.status(500).send();

  return res.status(200).send();
};

exports.deleteContactByIdApi = async (req, res) => {
  const id = req.params.id;
  const contact = await db.deleteContactById(id);

  if (!contact) return res.status(500).send();

  return res.status(200).send();
};

exports.addItemApi = async (req, res) => {
  const box = req.params.box;
  const id = await db.addItem(box, req.body.subject,
    req.body.fromTo, req.body.addedBy,
    req.body.replyTo, req.body.note);

  if (!id) return res.status(500).send();

  return res.status(200).json(id);
};

exports.updateItemByIdApi = async (req, res) => {
  const box = req.params.box;
  const id = req.params.id;
  const item = await db.updateItemById(id, box, req.body.subject,
    req.body.fromTo, req.body.replyTo, req.body.note);

  if (!item) return res.status(500).send();

  return res.status(200).send();
};
 exports.updateContactByIdApi = async (req, res) => {
   const id = req.body.id
   const name = req.body.name;
   const region = req.body.region;
   const location = req.body.location;
   const contact = await db.updateContactById(id, name, region, location);

   if (!contact) return res.status(500).send();
   return res.status(200).send();
 };

exports.updateStatusApi = async (req, res) => {
  const box = req.params.box;
  const id = req.params.id
  const status = req.body.newStatus;
  const itemStatus = await db.updateStatus(box, id, status);

  if (!itemStatus) return res.status(500).send();

  return res.status(200).send();
};

exports.updateUserEmailApi = async (req, res) => {
  const user = req.body.user;
  const email = req.body.email;
  const emailExists = await db.checkEmail(email);

  if (emailExists) return res.status(409).send();

  const emailUpdate = await db.updateUserEmail(user, email);

  if (!emailUpdate) return res.status(500).send();

  return res.status(200).send();
};

exports.updateUserInfoApi = async (req, res) => {
  const user = req.body.user;
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;

  const info = await db.updateUserInfo(user, firstname, lastname);
  if (!info) return res.status(500).send();

  return res.status(200).send();
};

exports.updateUserPasswordApi = async (req, res) => {
  const user = req.body.user;
  const oldPass = req.body.oldPass;
  const newPass = req.body.newPass;

  const { password } = await db.checkPass(user, oldPass);
  const checkPass = bcrypt.compareSync(oldPass, password);

  if (checkPass) {
    const saltRounds = 10;
    bcrypt.hash(newPass, saltRounds)
      .then(hash => {
        const pass = db.updateUserPassword(user, hash);
        if (!pass) throw new Error("Password wasn't updated");
      })
      .catch((e) => {
        console.error(e)
        return res.status(500).send();
      });
      res.status(200).send();
  } else {
    return res.send(409).send();
  }
};

exports.signupApi = async (req, res) => {
  const username = await db.checkUsername(req.body.username);
  const email = await db.checkEmail(req.body.email);

  if (username) return res.status(409)
    .json({error: 'Username is taken'});
  if (email) return res.status(409)
    .json({error: 'There is an account using this email'});

  const user = await db.signup(req.body.username, req.body.password,
    req.body.firstname, req.body.lastname, req.body.email);

  if (!user) return res.status(500).send();

  return res.status(201).send();
};

exports.getContactsApi = async (req, res) => {
  const contacts = await db.getContacts();

  if (contacts) return res.status(200).json(contacts);
  else return res.status(204).send();
};

exports.searchContactsByNameApi = async (req, res) => {
  const name = req.query.name;
  const contacts = await db.searchContactsByName(name);

  return res.json(contacts);
};

exports.addContactApi = async (req, res) => {
  const contact = await db.addContact(req.body.orgLocation,
    req.body.orgRegion, req.body.orgName);

  if (!contact) return res.status(500).send();

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
  const attach = await db.addAttachment(filename, fsDirectory,
    fsFilename, box, id, size, type);
  if (!attach) return res.status(500).send();

  return res.status(200).send();
};

exports.downloadFileApi = async (req, res) => {
  const id = req.params.file;
  const { fsDirectory, fsFilename, filename, mimeType } =
    await db.getAttachmentByFileId(id);
  const path = [fsDirectory, fsFilename].join('/');

  return res.set({'Content-Type': mimeType}).status(200).download(path, filename);
};
