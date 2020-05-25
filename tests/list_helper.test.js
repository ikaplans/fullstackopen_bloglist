const listHelper = require('../utils/list_helper');
const helper = require('./test_helper');

test('dummy returns one', () => {
  const result = listHelper.dummy([]);
  expect(result).toBe(1);
});

describe('totalLikes', () => {
  test('when list has only one blog equals the likes of that', () => {
    const result = listHelper.totalLikes(helper.listWithOneBlog);
    expect(result).toBe(5);
  });

  test('when list has multiple blogs equals the sum of likes of that', () => {
    const result = listHelper.totalLikes(helper.initialBlogs);
    expect(result).toBe(36);
  });

  test('when list has no blogs equals 0', () => {
    const result = listHelper.totalLikes([]);
    expect(result).toBe(0);
  });

  test('when list is undefined equals 0', () => {
    const result = listHelper.totalLikes(undefined);
    expect(result).toBe(null);
  });

  test('when list is null equals 0', () => {
    const result = listHelper.totalLikes(null);
    expect(result).toBe(null);
  });
});

describe('favoriteBlog', () => {
  test('when list empty equals null', () => {
    const result = listHelper.favoriteBlog([]);
    expect(result).toBe(null);
  });

  test('when list undefined is null', () => {
    const result = listHelper.favoriteBlog(undefined);
    expect(result).toBe(null);
  });

  test('when list null is null', () => {
    const result = listHelper.favoriteBlog(null);
    expect(result).toBe(null);
  });

  test('when list has only one blog equals itself', () => {
    const result = listHelper.favoriteBlog(helper.listWithOneBlog);
    expect(helper.listWithOneBlog[0]).toMatchObject(result);
  });

  test('when list has many blogs equals blog with most likes', () => {
    const result = listHelper.favoriteBlog(helper.initialBlogs);
    expect(helper.initialBlogs[2]).toMatchObject(result);
  });
});

describe('mostBlogs', () => {
  test('when list empty equals null', () => {
    const result = listHelper.mostBlogs([]);
    expect(result).toBe(null);
  });

  test('when list undefined is null', () => {
    const result = listHelper.mostBlogs(undefined);
    expect(result).toBe(null);
  });

  test('when list null is null', () => {
    const result = listHelper.mostBlogs(null);
    expect(result).toBe(null);
  });

  test('when list has only one blog equals author with 1 blog', () => {
    const result = listHelper.mostBlogs(helper.listWithOneBlog);
    expect(result).toMatchObject({
      author: 'Edsger W. Dijkstra',
      blogs: 1,
    });
  });

  test('when list has many blogs equals author with most blogs', () => {
    const result = listHelper.mostBlogs(helper.initialBlogs);
    expect(result).toMatchObject({
      author: 'Robert C. Martin',
      blogs: 3,
    });
  });
});

describe('mostLikes', () => {
  test('when list empty equals null', () => {
    const result = listHelper.mostLikes([]);
    expect(result).toBe(null);
  });

  test('when list undefined is null', () => {
    const result = listHelper.mostLikes(undefined);
    expect(result).toBe(null);
  });

  test('when list null is null', () => {
    const result = listHelper.mostLikes(null);
    expect(result).toBe(null);
  });

  test('when list has only one blog equals author with likes', () => {
    const result = listHelper.mostLikes(helper.listWithOneBlog);
    expect(result).toMatchObject({
      author: 'Edsger W. Dijkstra',
      likes: 5,
    });
  });

  test('when list has many blogs equals author with most likes', () => {
    const result = listHelper.mostLikes(helper.initialBlogs);
    expect(result).toMatchObject({
      author: 'Edsger W. Dijkstra',
      likes: 17,
    });
  });
});
