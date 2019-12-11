const parseIntQuery = (query) => {
  for (const key in query) {
    if ({}.hasOwnProperty.call(query, key)) {
      // eslint-disable-next-line no-param-reassign
      query[key] = query[key] instanceof Array ? query[key].map(e => +e) : [+query[key]];
    }
  }
  return query;
};

module.exports = parseIntQuery;
