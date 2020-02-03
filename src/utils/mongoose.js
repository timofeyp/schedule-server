const mongoose = require('mongoose');
const config = require('config');
const log = require('src/utils/log')(module);

mongoose.connect(
  config.get('database.uri'),
  config.get('database.options'),
).then(() => log.info('connection with mongo establishment'));
mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;

module.exports = mongoose;
