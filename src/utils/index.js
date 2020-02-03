const log = require('src/utils/log')(module);

const delay = time => new Promise(res => setTimeout(() => res(), time));

const tryCatchWrapper = async (func) => {
  try {
    await func();
  } catch (e) {
    log.error(e);
  }
};

const intervalWork = async (func, time) => {
  await tryCatchWrapper(func);
  setInterval(() => tryCatchWrapper(func), time);
};

module.exports = {
  delay, intervalWork,
};
