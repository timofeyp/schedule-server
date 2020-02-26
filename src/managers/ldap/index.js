const ldap = require('ldapjs');
const log = require('src/utils/log')(module);
const client = ldap.createClient({
  url: 'ldap://10.3.6.26:389',
});

client.bind(
  'CN=сuadmin,CN=Users,DC=ln,DC=rosenergoatom,DC=ru',
  '1QAZse4',
  err => {
    if (err) {
      log.error(err);
    }
  },
);

const opts = {
  filter: '(&(displayName=Пляш*))',
  scope: 'sub',
  attributes: ['givenName', 'displayName', 'sn', 'mail', 'department'],
};

const searchResult = [];

client.search('OU=laes.ru,DC=ln,DC=rosenergoatom,DC=ru', opts, (err, res) => {
  if (err) {
    log.error(err);
  }

  res.on('searchEntry', entry => {
    searchResult.push(entry.object);
  });
  res.on('searchReference', referral => {
    log.info(`referral: ${referral.uris.join()}`);
  });
  // eslint-disable-next-line no-shadow
  res.on('error', err => {
    log.error(`error: ${err.message}`);
  });
  res.on('end', result => {
    console.log(searchResult);
    console.log(`status: ${result.status}`);
  });
});
