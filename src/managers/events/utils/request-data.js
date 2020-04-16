const log = require('src/utils/log')(module);
const request = require('request-promise');
const jar = request.jar();
const { requestHeaders } = require('src/managers/events/constants');

const requestData = async (url, form, options) => {
  log.info({ url, form });
  const res = await request.post({
    url,
    headers: requestHeaders,
    form,
    jar,
    json: true,
    ...options,
  });
  return res;
};

module.exports = {
  requestData,
  jar,
};
