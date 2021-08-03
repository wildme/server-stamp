const db = require('../db.js');

exports.getInboxApi = async (req, res) => {
  const field = req.query.field || 'id';
  const order = req.query.order || 'asc';
  const inbox = await db.getInbox(field, order);
  res.json(inbox);
};
exports.getItemByIdApi = async (req, res) => {
  const box = req.params.box;
  const id = req.params.id;
  const item = await db.getItemById(box, id);
  res.json(item);
}

exports.addInboxApi = async (req, res) => {
  await db.addInbox(req.body.subject,
    req.body.fromTo, req.body.addedBy, req.body.notes);
};

exports.editItemApi = async (req, res) => {
  await db.editInbox(reg.body.id, req.body.subject,
    req.body.fromTo, req.body.addedBy, req.body.notes);
};
