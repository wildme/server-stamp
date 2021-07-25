const db = require('../db.js');

exports.getInboxApi = async (req, res) => {
  const inbox = await db.getInbox();
  res.json(inbox);
}
