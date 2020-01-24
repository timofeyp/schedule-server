const log = require('utils/log')(module);
const request = require('request');
const jar = request.jar();
const {
  requestHeaders,
} = require('managers/events/constants');

const requestData = (url, query) => new Promise((res, rej) => {
  log.info({ url, query });
  request.post(
    {
      url,
      headers: requestHeaders,
      form: query,
      jar,
    }
    , async (error, response, body) => {
      if (error) {
        rej(error);
      } else if (response.statusCode !== 200) {
        rej(new Error(`Code ${response.statusCode}, message ${response.statusMessage}`));
      } else if (body) {
        try {
          const resp = JSON.parse(body);
          res(resp);
        } catch (e) {
          rej(e);
        }
      }
    }
  );
});

module.exports = {
  requestData, jar,
};
