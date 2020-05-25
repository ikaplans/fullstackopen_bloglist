const usersRouter = require('express').Router();
const authHelper = require('../utils/auth_helper');
const User = require('../models/user');

usersRouter.post('/', async (request, response, next) => {
  const { body } = request;

  try {
    if (!body.password || body.password.length < 3) {
      next({
        name: 'ValidationError',
        message:
          'User validation failed: password: Path `password` is missing or is shorter than the minimum allowed length (3).',
      });
    }
    const userModel = new User({
      userName: body.userName,
      name: body.name,
      passwordHash: await authHelper.hashPassword(body.password),
    });
    const result = await userModel.save();
    response.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

usersRouter.get('/', async (request, response, next) => {
  try {
    const users = await User.find({}).populate('blogs', {
      url: 1,
      title: 1,
      author: 1,
      id: 1,
    });
    response.json(users);
  } catch (err) {
    next(err);
  }
});

module.exports = usersRouter;
