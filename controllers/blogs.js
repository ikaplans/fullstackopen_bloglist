const blogsRouter = require('express').Router();
const authHelper = require('../utils/auth_helper');
const Blog = require('../models/blog');
const User = require('../models/user');

blogsRouter.get('/', async (request, response, next) => {
  try {
    const blogs = await Blog.find({}).populate('user', {
      userName: 1,
      name: 1,
    });
    response.json(blogs);
  } catch (err) {
    next(err);
  }
});

blogsRouter.post('/', async (request, response, next) => {
  try {
    if (!authHelper.verifyToken(request, response)) {
      return;
    }
    const userId = authHelper.getUserIdFromToken(request.token);
    const user = await User.findById(userId);
    const blogModel = new Blog({ ...request.body, user: userId });
    const result = await blogModel.save();
    user.blogs = user.blogs ? user.blogs.concat(result.id) : [result.id];
    await user.save();

    response.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

blogsRouter.delete('/:id', async (request, response, next) => {
  try {
    if (!authHelper.verifyToken(request, response)) {
      return response
        .status(401)
        .json({
          error: 'invalid token',
        })
        .end();
    }
    const userId = authHelper.getUserIdFromToken(request.token);
    const blog = await Blog.findById(request.params.id).populate('user');
    if (!blog) {
      return response
        .status(404)
        .json({
          error: 'blog not found',
        })
        .end();
    }
    if (blog.user.id.toString() !== userId.toString()) {
      return response
        .status(401)
        .json({
          error: 'blog entry belongs to another user',
        })
        .end();
    }
    await Blog.findByIdAndDelete(request.params.id);
    response.status(204).end();
  } catch (err) {
    next(err);
  }
});

blogsRouter.put('/:id', async (request, response, next) => {
  try {
    const { body } = request;
    const newObject = {
      author: body.author,
      title: body.title,
      url: body.url,
    };
    if (body.likes) {
      newObject.likes = body.likes;
    }
    const updated = await Blog.findOneAndUpdate(
      { _id: request.params.id },
      newObject,
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
        context: 'query',
      }
    );
    response.status(200).json(updated);
  } catch (err) {
    next(err);
  }
});

module.exports = blogsRouter;
