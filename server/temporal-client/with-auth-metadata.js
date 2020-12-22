const grpc = require('grpc');
const { getAuthConfig } = require('../config');

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
    return async (ctx, req) => {
      const metadata = await buildGrpcMetadata(ctx);
      return fn(req, metadata);
    };
  }

  return obj[property];
};

const extractAccessToken = (ctx) => {
  if (ctx.isAuthenticated()) {
    return ctx.state.user.accessToken;
  }
  return undefined;
};

const buildGrpcMetadata = async (ctx) => {
  const metadata = new grpc.Metadata();

  const auth = await getAuthConfig();
  if (auth.enabled) {
    const accessToken = extractAccessToken(ctx);
    if (!accessToken) {
      throw Error('Request unauthorized')
    }
    metadata.add('authorization', `Bearer ${accessToken}`);
  }
  return metadata;
};

module.exports = { WithAuthMetadata };
