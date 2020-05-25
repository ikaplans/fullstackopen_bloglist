const mongoose = require('mongoose');
const cors = require('cors');
const express = require('express');
const config = require('./utils/config.js');
const blogsRouter = require('./controllers/blogs.js');
const usersRouter = require('./controllers/users.js');
const loginRouter = require('./controllers/login.js');

const app = express();

const logger = require('./utils/logger.js');
const middleware = require('./utils/middleware.js');

logger.info(`Connecting to ${config.MONGODB_URI}`);
mongoose
  .connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.info('connected to MongoDB');
  })
  .catch((err) => {
    logger.error(`Error connecting to MongoDb ${err.message}`);
  });

app.use(cors());
app.use(express.static('build'));
app.use(express.json());
app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);

app.use('/api/blogs', blogsRouter);
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
