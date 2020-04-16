const {
  portalUrl,
  eventsUrl,
  portalLogin,
  portalPass,
} = require('src/managers/events/constants');
const log = require('src/utils/log')(module);
const { requestData, jar } = require('src/managers/events/utils/request-data');

const formBody = {
  j_username: portalLogin,
  j_password: portalPass,
};

const requestOptions = {
  resolveWithFullResponse: true,
};

const setCookies = async () => {
  const response = await requestData(portalUrl, formBody, requestOptions);
  const {
    headers: { 'set-cookie': cookies },
  } = response;
  cookies.forEach(el => {
    jar.setCookie(`${el.name}=${el.value}`, eventsUrl);
  });
  log.info('cookies set');
};

module.exports = setCookies;
