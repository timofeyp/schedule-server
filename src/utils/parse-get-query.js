const parseIntQuery = query => {
  Object.keys(query).forEach(key => {
    if ({}.hasOwnProperty.call(query, key)) {
      if (query[key] instanceof Array) {
        query[key] = query[key].map(e => +e);
      } else if (query[key] === 'true') {
        query[key] = true;
      } else if (query[key] === 'false') {
        query[key] = false;
      } else if (isNaN(+query[key])) {
        query[key] = query[key];
      } else {
        query[key] = +query[key];
      }
    }
  });
  return query;
};

module.exports = parseIntQuery;
