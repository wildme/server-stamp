const db = require('../db.js');

exports.getInboxApi = async (req, res) => {
  const field = req.query.field || 'id';
  const order = req.query.order || 'asc';
  const inbox = await db.getInbox(field, order);
  res.json(inbox);
}

exports.addInboxApi = async (req, res) => {
  await db.addInbox(req.body.subject,
    req.body.fromTo, req.body.addedBy, req.body.notes);
}

