const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const loginRouter = require('express').Router();
const User = require('../models/user');
const config = require('../utils/config');

loginRouter.post('/', async (request, response, next) => {
  try {
    const { body } = request;
    const user = await User.findOne({ userName: body.userName });
    const passwordCorrect = user
      ? await bcrypt.compare(body.password, user.passwordHash)
      : false;
    if (!(user && passwordCorrect)) {
      return response.status(401).json({
        error: 'invalid username or password',
      });
    }

    const userForToken = {
      userName: user.userName,
      id: user.id,
    };

    const token = jwt.sign(userForToken, config.SECRET);
    response
      .status(200)
      .send({ token, userName: user.userName, name: user.name });
  } catch (err) {
    next(err);
  }
});

module.exports = loginRouter;
