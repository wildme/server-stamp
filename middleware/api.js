const db = require('../db.js');

exports.getInboxApi = async (req, res) => {
  const field = req.query.field;
  const order = req.query.order;

  if (field && order) {
    const sortedInbox = await db.sortedInbox(field, order);
    res.json(sortedInbox);
  } else {
    const inbox = await db.getInbox();
    res.json(inbox);
  }
}
