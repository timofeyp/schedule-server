const LDAPSearch = require('src/managers/ldap');

const getUsers = async (req, res) => {
  const { search } = req.query;
  const ldapSearch = new LDAPSearch();
  const result = await ldapSearch.byText(search);
  return res.send(result);
};

module.exports = {
  getUsers,
};
