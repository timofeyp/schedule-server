const mongoose = require("mongoose");
const config = require("config");
const log = require("./log")(module);

mongoose.connect(
	config.get("database.uri"),
	config.get("database.options"),
).then(() => log.info("connection with mongo establishment"));

mongoose.Promise = global.Promise;

module.exports = mongoose;
