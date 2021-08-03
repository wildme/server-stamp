const db = require('../db.js');

exports.getBoxApi = async (req, res) => {
  const page = req.params.box;
  const field = req.query.field || 'id';
  const order = req.query.order || 'asc';
  const box = await db.getBox(page, field, order);
  res.json(box);
};
exports.getItemByIdApi = async (req, res) => {
  const page = req.params.box;
  const id = req.params.id;
  const item = await db.getItemById(page, id);
  res.json(item);
}

exports.addBoxApi = async (req, res) => {
  const page = req.params.box;
  await db.addBox(page, req.body.subject,
    req.body.fromTo, req.body.addedBy, req.body.notes);
};

exports.editItemApi = async (req, res) => {
  await db.editInbox(reg.body.id, req.body.subject,
    req.body.fromTo, req.body.addedBy, req.body.notes);
};
