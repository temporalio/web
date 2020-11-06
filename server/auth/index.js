const passport = require('koa-passport');

const oidc = require('./oidc');
const { STRATEGY_NAMES } = require('./constants');
const { getAuthConfig } = require('../config');

const initialize = async (ctx, next) => {
  if (!passport._strategies[STRATEGY_NAMES.oidc]) {
    const enabled = (await getAuthConfig()).enabled;
    if (!enabled) {
      throw Error('No authentication configuration found');
    }

    const auth = await getAuthConfig();

    if (!auth || !auth.providers?.length === 0) {
      throw Error('No authentication configuration found');
    }

    const {
      issuer,
      client_id: clientId,
      client_secret: clientSecret,
      callback_base_uri: callbackUri,
    } = auth.providers[0]; // we currently support single auth config
    const strategy = await oidc.getStrategy(
      issuer,
      clientId,
      clientSecret,
      callbackUri
    );
    passport.use(STRATEGY_NAMES.oidc, strategy);

    passport.serializeUser((user, done) => {
      done(null, user);
    });
    passport.deserializeUser((user, done) => {
      done(null, user);
    });
  }
  await next();
};

const authenticate = (ctx, next, options, callback) => {
  return passport.authenticate(
    STRATEGY_NAMES.oidc,
    options,
    callback
  )(ctx, next);
};

/**
 * Authenticated routes middleware.
 */
const verifyAuth = () => {
  return (ctx, next) => {
    if (ctx.isAuthenticated()) {
      return next();
    } else {
      ctx.redirect('auth/login');
    }
  };
};

module.exports = {
  initialize,
  authenticate,
  verifyAuth,
};
