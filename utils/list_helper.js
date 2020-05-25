const _ = require('lodash');

// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => 1;

const mostBlogs = (blogs) =>
  !blogs || _.isEmpty(blogs)
    ? null
    : _(blogs)
        .groupBy('author')
        .map((v, k) => ({ author: k, blogs: v.length }))
        .maxBy('blogs');

const mostLikes = (blogs) =>
  !blogs || _.isEmpty(blogs)
    ? null
    : _(blogs)
        .groupBy('author')
        .map((v, k) => ({ author: k, likes: _.sumBy(v, 'likes') }))
        .maxBy('likes');

const totalLikes = (blogs) =>
  blogs ? blogs.reduce((acc, val) => acc + val.likes, 0) : null;

const favoriteBlog = (blogs) => {
  if (!blogs || blogs.length === 0) {
    return null;
  }
  if (blogs.length === 1) {
    return blogs[0];
  }

  return blogs.reduce((acc, val) => {
    const valClone = {
      title: val.title,
      author: val.author,
      likes: val.likes,
    };
    if (acc === undefined) {
      return valClone;
    }
    return valClone.likes > acc.likes ? valClone : acc;
  });
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
