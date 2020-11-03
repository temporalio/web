const Router = require('koa-router');
const router = new Router();
const utils = require('./utils');
const auth = require('./auth');

router.get('/sso', (ctx, next) => {
  return auth.authenticate(ctx, next);
});

router.get('/sso_callback', async (ctx, next) => {
  return auth.authenticate(ctx, next, {
    successRedirect: '/namespaces',
    failureRedirect: '/signin',
  });
});

router.get('/logout', async (ctx) => {
  if (ctx.isAuthenticated()) {
    ctx.logout();
    ctx.redirect('/');
  } else {
    ctx.body = { success: false };
    ctx.throw(401);
  }
});

module.exports = router.routes();
