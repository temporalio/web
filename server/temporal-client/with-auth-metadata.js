const { buildGrpcMetadata } = require('./helpers');

const WithAuthMetadata = (temporalClient) => {
  let tClient = Object.create(temporalClient);

  tClient.client = new Proxy(tClient.client, { get: getter });

  return tClient;
};

const getter = (obj, property) => {
  if (!property in obj) {
    return undefined;
  }

  if (typeof obj[property] === 'function') {
    const fn = obj[property].bind(obj);
    return (ctx, req) => {
      const metadata = buildGrpcMetadata(ctx);
      return fn(req, metadata);
    };
  }

  return obj[property];
};

module.exports = { WithAuthMetadata };
