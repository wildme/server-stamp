const jwt = require('../libs/jwt-check.js');

exports.authenticate = async function(req, res, next) {
  const accessToken = req.get('Authorization').split(' ')[1];
  if (!accessToken) return res.sendStatus(401);

  const refreshToken = req.cookies.jwt || null;
  let newToken = undefined;
  const tokenCheck = jwt.verifyToken(accessToken);

  if (tokenCheck === 'error') return res.sendStatus(500);
  if (tokenCheck === 'expired' && refreshToken) {
    newToken = await jwt.getNewToken(refreshToken);
    if (newToken === 'expired') return res.sendStatus(401);
  }
  if (tokenCheck === 'expired' && !refreshToken) {
    return res.sendStatus(401);
  }
  if (newToken) { 
    req.token = newToken.string;
    req.user = newToken.user;
    return next();
  }
  req.user = tokenCheck;
  return next();
}
