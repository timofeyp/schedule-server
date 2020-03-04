const ldap = require('ldapjs');
const log = require('src/utils/log')(module);
const config = require('config');
const {
  LDAP: {
    server: { url, bindDN, bindCredentials, searchBase },
  },
} = config;

const attributes = [
  'givenName',
  'displayName',
  'sn',
  'mail',
  'userPrincipalName',
  'department',
];

const getFilterQuery = searchText =>
  `(&(displayName=${searchText}*)(userPrincipalName=*@*rosenergoatom.ru))`;

const getSearchOptions = searchText => {
  const filter = getFilterQuery(searchText);
  return {
    filter,
    attributes,
    scope: 'sub',
    paged: {
      pageSize: 50,
      pagePause: true,
    },
  };
};

const searchLDAPUsers = (client, searchOptions, resolve) => {
  const searchResult = [];
  client.search(searchBase, searchOptions, (err, res) => {
    if (err) log.error(err);
    res.on('searchEntry', entry => searchResult.push(entry.object));
    res.on('page', () => {
      resolve(searchResult);
      client.destroy();
    });
    res.on('end', () => {
      resolve(searchResult);
      client.destroy();
    });
  });
};

class LDAPSearch {
  constructor() {
    this.client = ldap.createClient({
      url,
    });
  }
  bindClient() {
    this.client.bind(bindDN, bindCredentials, err => {
      if (err) {
        log.error(err);
      }
    });
  }
  handleSearchRequest(searchText, resolve) {
    this.bindClient();
    const searchOptions = getSearchOptions(searchText);
    searchLDAPUsers(this.client, searchOptions, resolve);
  }
  byText = searchText =>
    new Promise(resolve => this.handleSearchRequest(searchText, resolve));
}

module.exports = LDAPSearch;
