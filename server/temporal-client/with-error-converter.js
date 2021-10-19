const mapper = {
  2: 500, // UNKNOWN -> Internal Server Error
  3: 400, // INVALID_ARGUMENT -> Bad Request
  5: 404, // NOT_FOUND -> Not Found
  7: 403, // PERMISSION_DENIED -> Forbidden
  12: 404, // UNIMPLEMENTED -> Not Found
  13: 400, // INTERNAL -> Bad Request
  16: 401, // UNAUTHENTICATED -> Unauthorized
};

const convertError = (err) => {
  if (err.code in mapper) {
    err.statusCode = mapper[err.code];
  }
  return err;
};

const getter = (obj, property) => {
  if (!property in obj) {
    return undefined;
  }

  if (typeof obj[property] === 'function') {
    const fn = obj[property].bind(obj);
    const isAsync = fn[Symbol.toStringTag] === 'AsyncFunction';

    if (isAsync) {
      return async (...args) => {
        try {
          return await fn(...args);
        } catch (err) {
          const req = args.length >= 1 ? args[1]: null; // [0] - context, [1] - request
          err.message = `${err.message}. method: ${property}, req: ${JSON.stringify(req)}`;
          throw convertError(err);
        }
      };
    } else {
      return (...args) => {
        try {
          return fn(...args);
        } catch (err) {
          throw convertError(err);
        }
      };
    }
  }

  return obj[property];
};

const WithErrorConverter = (client) => {
  const proxy = new Proxy(client, { get: getter });
  return proxy;
};

module.exports = { WithErrorConverter };
