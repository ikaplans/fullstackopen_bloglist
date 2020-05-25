const mongoose = require('mongoose');
const supertest = require('supertest');
const jwt = require('jsonwebtoken');
const config = require('../utils/config');
const authHelper = require('../utils/auth_helper');
const Blog = require('../models/blog');
const User = require('../models/user');
const app = require('../app');
const helper = require('./test_helper');

const api = supertest(app);
let token = '';
let token2 = '';
const getAuthToken = () => `bearer ${token}`;
const getAuthToken2 = () => `bearer ${token2}`;

beforeAll(async () => {
  await User.findOneAndDelete({ userName: 'blog_create_test_user' });
  await User.findOneAndDelete({ userName: 'blog_create_test_user2' });
  const user = new User({
    userName: 'blog_create_test_user',
    passwordHash: await authHelper.hashPassword('password'),
  });
  const user2 = new User({
    userName: 'blog_create_test_user2',
    passwordHash: await authHelper.hashPassword('password'),
  });
  await user.save();
  await user2.save();
  token = jwt.sign(
    {
      userName: user.userName,
      id: user.id,
    },
    config.SECRET
  );

  token2 = jwt.sign(
    {
      userName: user2.userName,
      id: user2.id,
    },
    config.SECRET
  );
});

beforeEach(async () => {
  await Blog.deleteMany();
  await Promise.all(helper.initialBlogs.map((b) => new Blog(b).save()));
});
describe('retrieval of blogs', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs');
    expect(response.body).toHaveLength(helper.initialBlogs.length);
  });

  test('a specific blog is returned', async () => {
    const response = await api.get('/api/blogs');
    const contents = response.body.map((b) => b.title);
    expect(contents).toContain(helper.initialBlogs[0].title);
  });

  test('blog has id', async () => {
    const response = await api.get('/api/blogs');
    expect(response.body[0].id).toBeDefined();
  });
});

describe('creation of blog', () => {
  test('blog can be added', async () => {
    const response = await api
      .post('/api/blogs')
      .set('Authorization', getAuthToken())
      .send(helper.oneBlog)
      .set('Content-Type', 'application/json')
      .set('accept', 'application/json');
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text)).toMatchObject(helper.oneBlog);

    const blogs = await api.get('/api/blogs');
    expect(blogs.body).toHaveLength(helper.initialBlogs.length + 1);

    const contents = blogs.body.map((b) => b.title);
    expect(contents).toContain(helper.oneBlog.title);
  });

  test('blog can not be added without a token', async () => {
    const response = await api
      .post('/api/blogs')
      .send(helper.oneBlog)
      .set('Content-Type', 'application/json')
      .set('accept', 'application/json');
    expect(response.status).toBe(401);

    const blogs = await api.get('/api/blogs');
    expect(blogs.body).toHaveLength(helper.initialBlogs.length);

    const contents = blogs.body.map((b) => b.title);
    expect(contents).not.toContain(helper.oneBlog.title);
  });

  test('blog added with no likes will save with 0 likes', async () => {
    const blogClone = { ...helper.oneBlog };
    delete blogClone.likes;

    const response = await api
      .post('/api/blogs')
      .set('Authorization', getAuthToken())
      .send(blogClone)
      .set('Content-Type', 'application/json')
      .set('accept', 'application/json');
    const responseObj = JSON.parse(response.text);

    const blogs = await api.get('/api/blogs');
    const blogFromDb = blogs.body.filter((b) => b.id === responseObj.id);
    expect(blogClone.likes).not.toBeDefined();
    expect(response.status).toBe(200);
    expect(responseObj.likes).toBe(0);
    expect(blogFromDb[0].likes).toBe(0);
  });

  test('blog added with no url will not save', async () => {
    const blogClone = { ...helper.oneBlog };
    delete blogClone.url;

    const response = await api
      .post('/api/blogs')
      .set('Authorization', getAuthToken())
      .send(blogClone)
      .set('Content-Type', 'application/json')
      .set('accept', 'application/json');
    expect(response.status).toBe(400);
  });

  test('blog added with no title will not save', async () => {
    const blogClone = { ...helper.oneBlog };
    delete blogClone.title;

    const response = await api
      .post('/api/blogs')
      .set('Authorization', getAuthToken())
      .send(blogClone)
      .set('Content-Type', 'application/json')
      .set('accept', 'application/json');
    expect(response.status).toBe(400);
  });
});

describe('deletion of blog', () => {
  const blogForDeletion = {
    title: 'Test Blog For Deletion',
    author: 'Test Author',
    url: 'http://test.url.org',
    likes: 10,
  };

  beforeEach(() => {
    Blog.findOneAndDelete(blogForDeletion);
  });

  test('blog can be deleted by the user who added it', async () => {
    const saveResponse = await api
      .post('/api/blogs')
      .set('Authorization', getAuthToken())
      .send(blogForDeletion)
      .set('Content-Type', 'application/json')
      .set('accept', 'application/json');
    const savedBlog = JSON.parse(saveResponse.text);

    const deleteResponse = await api
      .delete(`/api/blogs/${savedBlog.id}`)
      .set('Authorization', getAuthToken());

    const secondResponse = await api.get('/api/blogs');
    const contents = secondResponse.body.map((b) => b.title);

    expect(deleteResponse.status).toBe(204);
    expect(secondResponse.body).toHaveLength(helper.initialBlogs.length);
    expect(contents).not.toContain(savedBlog.title);
  });

  test('blog by another user can not be deleted', async () => {
    const saveResponse = await api
      .post('/api/blogs')
      .set('Authorization', getAuthToken())
      .send(blogForDeletion)
      .set('Content-Type', 'application/json')
      .set('accept', 'application/json');
    const savedBlog = JSON.parse(saveResponse.text);

    const deleteResponse = await api
      .delete(`/api/blogs/${savedBlog.id}`)
      .set('Authorization', getAuthToken2());
    const secondResponse = await api.get('/api/blogs');
    const contents = secondResponse.body.map((b) => b.title);

    expect(deleteResponse.status).toBe(401);
    expect(secondResponse.body).toHaveLength(helper.initialBlogs.length + 1);
    expect(contents).toContain(savedBlog.title);
  });
});

describe('updating blog', () => {
  test('can be updated', async () => {
    const firstResponse = await api.get('/api/blogs');
    const blogForUpdate = { ...firstResponse.body[0], likes: 99 };
    const updateResponse = await api
      .put(`/api/blogs/${blogForUpdate.id}`)
      .set('Content-Type', 'application/json')
      .set('accept', 'application/json')
      .send(blogForUpdate);

    const secondResponse = await api.get('/api/blogs');
    const blogFromDb = secondResponse.body.filter(
      (b) => b.id === blogForUpdate.id
    )[0];

    expect(updateResponse.status).toBe(200);
    expect(secondResponse.body).toHaveLength(helper.initialBlogs.length);
    expect(JSON.parse(updateResponse.text)).toMatchObject(blogForUpdate);
    expect(blogFromDb.likes).toBe(blogForUpdate.likes);
  });

  test('blog with no url will not update', async () => {
    const firstResponse = await api.get('/api/blogs');
    const blogForUpdate = { ...firstResponse.body[0], likes: 99 };
    delete blogForUpdate.url;

    const updateResponse = await api
      .put(`/api/blogs/${blogForUpdate.id}`)
      .set('Content-Type', 'application/json')
      .set('accept', 'application/json')
      .send(blogForUpdate);

    expect(updateResponse.status).toBe(400);
  });

  test('blog with no title will not update', async () => {
    const firstResponse = await api.get('/api/blogs');
    const blogForUpdate = { ...firstResponse.body[0], likes: 99 };
    delete blogForUpdate.title;

    const updateResponse = await api
      .put(`/api/blogs/${blogForUpdate.id}`)
      .set('Content-Type', 'application/json')
      .set('accept', 'application/json')
      .send(blogForUpdate);

    expect(updateResponse.status).toBe(400);
  });
});

afterAll(async () => {
  await User.findOneAndDelete({ userName: 'blog_create_test_user' });
  mongoose.connection.close();
});
