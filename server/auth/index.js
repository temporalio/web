const passport = require('koa-passport');

const oidc = require('./oidc');
const { STRATEGY_NAMES } = require('./constants');
const { getAuthConfig } = require('../config');

const initialize = async (ctx, next) => {
  const auth = await getAuthConfig();
  if (!auth.enabled) {
    await next();
    return;
  }

  if (!passport._strategies[STRATEGY_NAMES.oidc]) {
    if (!auth || !auth.providers?.length === 0) {
      throw Error('No authentication configuration found');
    }

    const {
      issuer,
      client_id: clientId,
      client_secret: clientSecret,
      scope,
      audience,
      callback_base_uri: callbackUri,
    } = auth.providers[0]; // we currently support single auth config
    const strategy = await oidc.getStrategy(
      issuer,
      clientId,
      clientSecret,
      scope || 'openid profile email',
      audience,
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
