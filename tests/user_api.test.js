const mongoose = require('mongoose');
const supertest = require('supertest');
const User = require('../models/user');
const app = require('../app');
const helper = require('./test_helper');

const api = supertest(app);

beforeEach(async () => {
  await User.deleteMany();
  await api
    .post('/api/users')
    .send({ userName: 'admin', password: 'password', name: 'Administrator' })
    .expect(200);
});

describe('user creation', () => {
  test('can create user', async () => {
    const savedUserResponse = await api
      .post('/api/users')
      .send(helper.userForInsert)
      .expect(200)
      .expect('Content-Type', /application\/json/);
    const savedUser = JSON.parse(savedUserResponse.text);

    const dbUsers = await api
      .get('/api/users')
      .expect('Content-Type', /application\/json/);

    expect(dbUsers.body).toHaveLength(2);
    expect(savedUser.userName).toBe(helper.userForInsert.userName);
    expect(savedUser.passwordHash).not.toBeDefined();
    expect(dbUsers.body[1].userName).toBe(helper.userForInsert.userName);
    expect(dbUsers.body[1].passwordHash).not.toBeDefined();
  });
});

describe('user creation validation', () => {
  test('userName must be unique', async () => {
    const dbUsers = await helper.usersInDb();
    const duplicateUser = {
      ...helper.userForInsert,
      userName: dbUsers[0].userName,
    };
    const savedUserResponse = await api
      .post('/api/users')
      .send(duplicateUser)
      .expect(400);
    expect(savedUserResponse.body.error).toMatch(
      'E11000 duplicate key error collection:'
    );
  });

  test('can not create user without username', async () => {
    const userWithoutUserName = helper.userForInsert;
    delete userWithoutUserName.userName;
    const savedUserResponse = await api
      .post('/api/users')
      .send(userWithoutUserName)
      .expect(400);
    expect(savedUserResponse.body.error).toMatch(
      'User validation failed: userName:'
    );
  });

  test('can not create user with username less than 3 characters', async () => {
    const userWithShortUsername = { ...helper.userForInsert, userName: '12' };
    const savedUserResponse = await api
      .post('/api/users')
      .send(userWithShortUsername)
      .expect(400);
    expect(savedUserResponse.body.error).toMatch(
      'User validation failed: userName:'
    );
  });

  test('can not create user without password', async () => {
    const userWithoutPassword = helper.userForInsert;
    delete userWithoutPassword.password;
    const savedUserResponse = await api
      .post('/api/users')
      .send(userWithoutPassword)
      .expect(400);
    expect(savedUserResponse.body.error).toMatch(
      'User validation failed: password:'
    );
  });

  test('can not create user with password less than 3 characters', async () => {
    const userWithShortUsername = { ...helper.userForInsert, password: '12' };
    const savedUserResponse = await api
      .post('/api/users')
      .send(userWithShortUsername)
      .expect(400);
    expect(savedUserResponse.body.error).toMatch(
      'User validation failed: password:'
    );
  });

  afterEach(async () => {
    await helper.verifyThatNoUserIsAdded(api, 1);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
