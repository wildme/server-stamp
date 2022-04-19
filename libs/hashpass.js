const bcrypt = require('bcrypt');

exports.cmpHash = (oldPass, password) => {
  return bcrypt.compareSync(oldPass, password);
};

exports.getHashOfPass = async (newPass, username) => {
  const saltRounds = 10;
  return bcrypt.hash(newPass, saltRounds)
    .then(hash => hash)
    .catch((err) => {console.error(err); return null;})
};
