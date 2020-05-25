const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('./config');

const hashPassword = (password) => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

const getTokenFromRequest = (request) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7);
  }
  return null;
};

const getUserIdFromToken = (token) => {
  if (!token) {
    return null;
  }
  const decodedToken = jwt.verify(token, config.SECRET);
  return decodedToken.id;
};

const verifyToken = (request, response) => {
  if (!request.token || !getUserIdFromToken(request.token)) {
    response.status(401).json({ error: 'token missing or invalid' });
    return false;
  }
  return true;
};

module.exports = {
  getTokenFromRequest,
  getUserIdFromToken,
  verifyToken,
  hashPassword,
};
