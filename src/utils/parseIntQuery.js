const parseIntQuery = (query) => {
  for (const key in query) {
    if ({}.hasOwnProperty.call(query, key)) {
      if (query[key] instanceof Array) {
        query[key] = query[key].map(e => +e);
      } else if (query[key] === 'true') {
        query[key] = true;
      } else if (query[key] === 'false') {
        query[key] = false;
      } else {
        query[key] = +query[key];
      }
    }
  }
  return query;
};

module.exports = parseIntQuery;
