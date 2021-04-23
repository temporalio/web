const getQueryResult = queryResponse => {
  if (typeof queryResponse?.payloads === 'string') {
    return { payloads: JSON.parse(queryResponse.payloads) };
  }

  return queryResponse;
};

export { getQueryResult };
